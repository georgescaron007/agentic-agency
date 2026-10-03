# Brief UX / UI — Initiative IA

Version 0.2 · 2026-10-03 · Statut : **en revue**
v0.2 : marque Initiative IA et Akgents, marque blanche côté client, prénoms des Akgents en option, modèle de conversation avec l'équipe (§6.3).
Destinataire : conception dans Figma Make, puis retour du code pour intégration (F-005 interface client, F-006 back-office).
Sources : `00-vision/vision.md` v0.2, `features/F-001-moteur-equipe/spec.md` v0.2.

Fichiers associés :
- `prompts-figma-make.md` : prompts prêts à coller, dans l'ordre ;
- `contrat-donnees.ts` : types TypeScript et données fictives à fournir à Figma Make pour que le code généré colle aux APIs ;
- `brand/initiative-ia/` : brand book, logos et planche d'identité (référence obligatoire).

---

## 1. Ce qu'on conçoit
Deux applications web qui partagent un même système de design :

| Application | Utilisateurs | Rôle |
|-------------|--------------|------|
| **Espace client** | Collaborateurs et responsable du client | Travailler avec sa suite d'agents : donner des consignes, répondre aux questions, valider, suivre |
| **Back-office** | Notre équipe | Créer les clients, concevoir et publier les suites, régler les harnais, superviser, assister |

Nom du produit : **Initiative IA**. Les agents s'appellent des **Akgents** (terme propriétaire, voir brand book §5). Langue de l'interface : français ; prévoir des libellés externalisés (anglais et néerlandais plus tard).

## 2. Personas
| Persona | Contexte | Ce qu'il veut | Écrans clés |
|---------|----------|---------------|-------------|
| **Sophie, commerciale** (utilisatrice client) | PME de 15 personnes, utilise ChatGPT de son côté, peu de temps | Déléguer une tâche en une phrase, répondre vite aux agents, retrouver ce qu'ils ont produit | Accueil, Fil de la suite, Demandes |
| **Marc, gérant** (responsable client) | Acheteur de la plateforme, veut voir le retour sur investissement | Savoir ce que fait la suite, garder le contrôle sur les actions sensibles, maîtriser le forfait | Accueil, Activité, Consommation, Utilisateurs |
| **Léa, consultante** (notre équipe) | Conçoit les suites avec les clients | Partir d'un modèle, adapter rapidement, tester avant de livrer, ajuster après coup | Suites, Éditeur d'agent, Bac à sable, Publication |
| **Admin plateforme** (nous) | Exploitation | Voir les coûts réels, les erreurs, les clients proches de leur quota ; assister un client | Supervision, Clients, Journal |

## 3. Principes de conception
1. **Converser avec une équipe, pas avec un chatbot.** On écrit aussi simplement que dans ChatGPT, mais on voit qui travaille : chaque Akgent a un nom, un rôle, un statut, et son travail apparaît dans la conversation (§6.3).
2. **L'humain d'abord quand il est attendu.** Les demandes qui attendent une personne (questions, validations) sont toujours visibles en un coup d'œil : badge global, encart en tête de l'accueil, notification.
3. **Répondre en un clic.** Chaque question affiche la recommandation de l'agent et ses options sous forme de boutons ; le texte libre reste possible.
4. **Montrer l'effet avant de valider.** Une validation d'action affiche précisément ce qui va se passer (destinataire, contenu, montant, dépôt). Le niveau de risque est visible. On peut modifier avant d'approuver.
5. **Le travail asynchrone est normal.** Les agents travaillent pendant qu'on fait autre chose : statuts clairs (« travaille », « attend ta réponse », « en pause »), pas de spinner bloquant.
6. **Transparence sans bruit.** Le détail technique (appels d'outils, modèles, tokens) est disponible mais replié par défaut côté client ; il est déplié par défaut côté back-office.
7. **Sobre et professionnel.** Interface de travail quotidienne : dense mais aérée, lisible, sans effets décoratifs.

## 4. Identité visuelle
Référence : `brand/initiative-ia/brand-book.md`. Ce qui suit en est la traduction pour l'interface.

### 4.1 Marque et marque blanche
| Où | Marque affichée |
|----|-----------------|
| **Back-office** | Initiative IA : logo principal, favicon Initiative IA |
| **Espace client** | **Logo et nom du client** en haut de la barre latérale ; mention discrète « Propulsé par Initiative IA » en pied de barre latérale (désactivable par client depuis le back-office) |
| **Page de réponse depuis un email (C5)** et **emails** | Logo du client en tête, mention discrète Initiative IA en pied |

La personnalisation par client se limite au **logo** (versions claire et sombre), au **nom affiché** et, en option, à **une couleur d'accent** choisie parmi une palette contrôlée (contraste AA vérifié). Le reste du système (couleurs sémantiques, typographie, composants) ne change pas : c'est ce qui garantit la lisibilité des demandes et des niveaux de risque chez tous les clients.

### 4.2 Couleurs (tokens)
| Token | Valeur | Usage dans l'interface |
|-------|--------|------------------------|
| `ink` | `#0B2545` | Texte principal, barre latérale du back-office, boutons primaires |
| `paper` | `#F8F7F4` | Fond de page (blanc chaud) |
| `surface` | `#FFFFFF` | Cartes, panneaux, zone de saisie |
| `teal` | `#14B8A6` | Accent de marque : action principale secondaire, progression, « Akgent actif », élément « activation » |
| `lime` | `#A3E635` | Signal positif ponctuel : tâche terminée, livrable, objectif atteint. Jamais pour du texte |
| `action` | `#3B82F6` | Liens, focus, élément sélectionné |
| `graphite` | `#6B7280` | Texte secondaire, métadonnées |
| `line` | `#E5E7EB` | Bordures, séparateurs |

Proportions du brand book respectées : surtout du blanc chaud, le bleu encre pour la structure, le bleu vert en accent.

Couleurs **sémantiques** (hors palette de marque, réservées aux états, utilisées avec retenue) :
- attente d'une réponse humaine : ambre `#F59E0B` ;
- niveaux de risque : `read` graphite, `write_internal` bleu action, `write_external` orange `#F97316`, `irreversible` rouge `#DC2626` ;
- erreur : rouge `#DC2626` ; succès : lime sur fond encre ou vert `#16A34A` pour du texte.

Mode sombre : fond `ink` assombri (`#071A33`), surfaces `#0F2A4D`, texte `paper`, accents identiques (logo inverse sur fond encre).

### 4.3 Typographie
- Titres : **Plus Jakarta Sans** (700–800), courts et orientés décision.
- Interface et texte : **Inter**.
- Code, chemins, identifiants : une mono (JetBrains Mono ou IBM Plex Mono).

### 4.4 Formes et iconographie
- Rayons modérés (8 px cartes, 6 px champs, plein pour les pastilles).
- Motifs de marque utilisés avec parcimonie : le **pilier vertical arrondi** comme indicateur de sélection dans la navigation et comme barre de progression verticale ; le **triangle bleu vert** comme marqueur « action / résultat » (ex. livrable, décision prise).
- Icônes lucide, linéaires et simples.
- À proscrire (brand book) : robots, cerveaux, circuits, réseaux neuronaux, dégradés violets, esthétique « cyber », effets lumineux.

### 4.5 Représentation des Akgents
- Avatar **carré arrondi** (les humains ont un avatar **rond**) : distinction immédiate.
- Couleur d'avatar stable par Akgent, tirée d'une palette dérivée de la marque (teintes de bleu encre, bleu vert, bleu action, graphite) ; icône de rôle lucide ou initiale.
- Mention « Akgent » à côté du nom à la première apparition dans une vue et dans la fiche.
- **Nommage configurable par suite** (§6.4) : prénom + rôle (« Lina · Prospection ») ou rôle seul (« Akgent Prospection »).

### 4.6 Format
- Bureau d'abord (1280–1600 px). L'espace client doit rester utilisable sur mobile pour **converser et répondre aux demandes** ; le reste peut être simplifié. Back-office : bureau uniquement.
- Contrainte technique : React + TypeScript + Tailwind, composants **shadcn/ui** thémés avec les tokens ci-dessus, icônes **lucide-react** (ADR-002).

## 5. Vocabulaire de l'interface
| Terme technique (spec) | Libellé interface |
|------------------------|-------------------|
| TeamCard / équipe instanciée | **Suite** (modèle) / **Espace de travail** d'une suite |
| AgentCard / agent | **Akgent** (ex. « Lina · Prospection », ou « Akgent Prospection » si les prénoms sont désactivés) |
| HumanRequest `question` | **Question** |
| HumanRequest `tool_approval` / `message_approval` | **Validation** |
| Tâche du planning | **Tâche** |
| Événements | **Activité** |
| Pool de tokens | **Crédits IA** (affichés en tokens, D6) |
| HarnessProfile | **Comportement** (autonome / supervisé / strict) côté client ; **Harnais** côté back-office |
| Conversation (`conversation_id`) | **Conversation** |

---

## 6. Espace client

### 6.1 Navigation
Barre latérale gauche :
- Accueil
- Mes suites (une entrée par suite : ex. « Suite Commerciale ») ; sous la suite active, la liste de ses **conversations** récentes et le bouton « Nouvelle conversation »
- Demandes (badge du nombre en attente pour moi)
- Documents
- Activité
- Paramètres (responsable uniquement) : Utilisateurs, Consommation, Notifications

En haut de la barre latérale : **logo du client**. En haut de page : recherche globale (conversations, documents), cloche de notifications, menu utilisateur.

### 6.2 Écrans

**C1 — Accueil**
- Encart « En attente de toi » : les 3 demandes les plus urgentes (question ou validation), avec bouton de réponse direct.
- Cartes des suites : nom, agents (avatars avec statut), tâches en cours, dernière activité.
- « Ce qui a été fait cette semaine » : livrables récents (documents, mises à jour, PR).
- Jauge de crédits du mois (responsable uniquement) : utilisé / inclus, projection fin de mois, seuil 80 %.
- État vide (premier jour) : message d'accueil, présentation de la suite livrée, suggestion de première consigne.

**C2 — Espace de travail d'une suite : la conversation** (écran principal)
Voir le modèle de conversation au §6.3. Disposition :
- **Gauche** (dans la navigation) : conversations de la suite, groupées par date ; chaque entrée montre le titre (généré automatiquement, modifiable), les avatars des Akgents impliqués, un point ambre si une demande attend une réponse, un triangle bleu vert si un livrable est prêt.
- **Centre** : la conversation (§6.3).
- **Droite** (panneau repliable à onglets) :
  - **Équipe** : Akgents de la suite avec statut en direct ; clic → fiche (C3) ou « Écrire à Lina » (ouvre une conversation directe) ; bouton « Voir l'organisation » ;
  - **Tâches** de cette conversation (mini kanban) ;
  - **Fichiers** de cette conversation.

**C3 — Fiche agent** (panneau ou page)
- Identité : nom, rôle, description, département, comportement (autonome / supervisé / strict) en lecture seule.
- Ce qu'il peut faire : liste de ses outils en langage simple avec badge de risque et règle (« Envoie des emails — demande ta validation »).
- Activité récente, tâches en cours, crédits consommés ce mois.
- Bouton « Écrire à cet Akgent » (conversation directe).

**C4 — Demandes** (boîte de réception)
- Filtres : à moi / à mon équipe / toutes ; type (question, validation) ; statut (en attente, répondues, expirées).
- Liste triée par urgence puis échéance : agent, type, résumé, suite, échéance (« dans 3 h »), relances.
- Détail à droite : la carte de demande complète (K3) avec historique.
- Action groupée impossible pour les validations `irreversible` (une par une).

**C5 — Répondre à une demande depuis un email** (page autonome, mobile d'abord)
- Ouverte par le lien à usage unique reçu par email.
- Affiche uniquement la demande, son contexte, les options et la recommandation, et la réponse.
- Après réponse : confirmation et lien « Ouvrir l'espace de travail ».
- États : lien expiré, demande déjà traitée (par qui, quand), demande annulée.

**C6 — Documents**
- Tous les fichiers produits ou déposés, par suite, avec auteur (agent ou humain), date, tâche liée.
- Aperçu (markdown, PDF, image, code), téléchargement, lien vers le message d'origine.

**C7 — Activité**
- Chronologie filtrable (suite, agent, type d'événement, période) : tâches créées et terminées, demandes et décisions, livrables, erreurs.
- Vue « résumé de la semaine » pour le responsable.

**C8 — Paramètres responsable**
- Utilisateurs : inviter, rôle (responsable, membre), désactiver ; jusqu'à la limite du forfait.
- Consommation : crédits par mois, par suite, par agent ; historique ; seuils de notification ; bouton « Demander plus de crédits ».
- Notifications : canaux (application, email) par type d'événement ; à qui vont les demandes par défaut.
- Affichage : nommage des Akgents (prénom + rôle / rôle seul), si le back-office l'autorise pour ce client.

### 6.3 Converser avec son équipe d'Akgents

#### Le principe
Les utilisateurs viennent de ChatGPT ou de Claude : ils savent déjà « écrire et recevoir une réponse ». On garde ce geste, en y ajoutant ce qui fait la différence d'une équipe : **plusieurs Akgents travaillent, et on le voit sans être noyé.**

On organise donc le chat en **conversations par sujet** (comme ChatGPT), pas en un canal unique sans fin (comme Slack) :
- une conversation = un sujet ou une demande (« Proposition Dupont SA ») ; l'historique reste rangé et retrouvable ;
- par défaut, on écrit **à l'équipe** : le message part au **coordinateur** (point d'entrée de la suite), qui répond, répartit le travail et rend compte, comme un chef d'équipe ;
- on peut aussi écrire **directement à un Akgent** : conversation directe, ou mention `@Hugo` dans une conversation d'équipe.

#### Ce qui apparaît dans une conversation
| Élément | Rendu |
|---------|-------|
| Message de l'utilisateur | Bulle à droite, avatar rond |
| Réponse d'un Akgent | Bloc à gauche, avatar carré, nom et rôle ; markdown, tableaux, pièces jointes |
| **Bloc « Travail en cours »** | Quand le coordinateur délègue, un bloc compact montre qui fait quoi : « Hugo rédige la proposition · étape 3 · 2 min », « Nora consulte le CRM ✓ ». Mis à jour en direct, replié automatiquement à la fin. Clic → déplie les échanges entre Akgents et le détail technique |
| **Carte de demande** (K3) | Question ou validation, intégrée au fil à l'endroit où elle survient, mise en avant tant qu'elle attend |
| **Livrable** | Carte de document avec aperçu, marqueur triangle bleu vert, actions Ouvrir / Télécharger / Demander une modification |
| Tâche créée | Ligne discrète « Tâche créée : Proposition commerciale Dupont SA », cliquable |

#### Le rythme : pas de « chargement » bloquant
Un Akgent peut mettre de quelques secondes à plusieurs minutes. Le chat ne doit jamais avoir l'air figé :
1. **accusé de réception immédiat** du coordinateur (« Bien reçu, je confie la rédaction à Hugo ») ;
2. **statut vivant** dans le bloc « Travail en cours » (étape, outil utilisé, durée) plutôt qu'un texte qui s'écrit mot à mot ;
3. l'utilisateur peut **quitter la conversation, en ouvrir une autre, revenir** : rien n'est perdu ; une notification signale la réponse ou la demande ;
4. bouton **« Arrêter »** sur le travail en cours.

#### Zone de saisie
- Placeholder : « Écrire à l'équipe… » (ou « Écrire à Hugo… » en conversation directe).
- Mention `@` avec autocomplétion des Akgents de la suite ; ajout de fichiers par glisser-déposer.
- **Premières consignes suggérées** sous la zone de saisie dans une conversation vide (configurées par suite dans le back-office).
- Raccourci « Transformer en tâche » sur un message.

#### Mobile
Liste des conversations → conversation plein écran ; le bloc « Travail en cours » et les cartes de demande restent pleinement utilisables ; le panneau de droite devient une feuille glissante.

### 6.4 Marque blanche et nommage côté client
- Logo et nom du client en haut de la barre latérale, sur toutes les pages, y compris C5 et les emails.
- **Nommage des Akgents** (réglage par suite, back-office B5 › Interface client ; consultable par le responsable dans C8) :
  - « Prénom + rôle » : « Lina · Prospection » ;
  - « Rôle seul » : « Akgent Prospection ».
  Le rôle est toujours visible, et la nature d'Akgent toujours explicite (avatar carré, mention « Akgent ») : un Akgent ne doit jamais passer pour une personne.


---

## 7. Back-office

### 7.1 Navigation
Barre latérale : Tableau de bord · Clients · Modèles de suites · Catalogue (agents, outils, harnais, garde-fous) · Supervision · Journal d'audit · Paramètres plateforme.

### 7.2 Écrans

**B1 — Tableau de bord**
- Indicateurs : clients actifs, suites publiées, demandes humaines en attente (tous clients), coût LLM réel du mois vs revenus, marge.
- Alertes : clients > 80 % de crédits, erreurs en hausse, taux de fallback anormal, demandes expirées.
- Raccourcis : nouveau client, nouvelle suite.

**B2 — Liste des clients**
- Tableau : nom, forfait, utilisateurs / limite, suites, crédits utilisés (%), coût réel, statut (actif, suspendu, essai), dernière activité.

**B3 — Fiche client**
Onglets :
- Aperçu : forfait, contacts, consommation, alertes.
- Suites : suites du client, version publiée, brouillon en cours, bouton « Nouvelle suite ».
- Utilisateurs : liste, rôles, invitation.
- Consommation : détail par suite, agent, modèle ; coût réel vs crédits ; fallbacks.
- Configuration : alias de modèles du client (D3, préparé), plafonds spécifiques.
- Accès support : « Ouvrir l'espace du client en lecture » (motif obligatoire, accès journalisé, bandeau visible en permanence).

**B4 — Modèles de suites**
- Bibliothèque : Technique, Commercial, Service client, RH, Administratif… avec description, agents, outils requis, nombre de clients qui l'utilisent.
- Fiche modèle : composition, versions, notes de conception.

**B5 — Éditeur de suite** (écran central du back-office)
Pour un client donné, à partir d'un modèle ou de zéro. Bandeau supérieur : client, suite, version, statut **Brouillon / Publiée**, boutons *Tester*, *Comparer*, *Publier*.
Onglets :
1. **Organisation** : vue graphe des agents (nœuds) et des routes autorisées (flèches `routes_to`), point d'entrée, superviseur, embauches possibles (`can_hire`). Glisser-déposer pour ajouter un agent depuis le catalogue ; clic sur une flèche pour la retirer.
2. **Agents** : liste ; clic → éditeur d'agent (B6).
3. **Validations** : règles `approval_gates` (de, vers, intention, motif) sous forme de tableau éditable.
4. **Interface client** : logo du client (clair et sombre), nom affiché de la suite, couleur d'accent optionnelle (palette contrôlée), mention « Propulsé par Initiative IA » (oui / non), **nommage des Akgents** (prénom + rôle / rôle seul), prénoms et avatars des Akgents, vues activées (conversations, tâches, documents, activité), message d'accueil, premières consignes suggérées. Aperçu en direct de l'espace client.
5. **Budget** : budget par exécution, rappel du forfait.
6. **Historique** : versions publiées, auteur, date, notes ; restaurer une version.

**B6 — Éditeur d'agent**
Deux colonnes : formulaire à gauche, aperçu à droite (prompt final résolu et harnais effectif).
Sections :
- Identité : nom affiché, rôle, description, département, avatar.
- Rôle (prompt) : modèle de prompt, variables, éditeur avec coloration des variables `{{ }}`.
- Outils : liste cochable depuis le catalogue avec classe de risque ; connecteurs requis.
- Communication : destinataires autorisés, embauches possibles, nombre max d'instances.
- **Harnais** : choix du profil (autonome / supervisé / strict) puis surcharges, groupées en blocs dépliables :
  - Modèle (alias, température, effort de raisonnement) ;
  - Boucle (étapes max par tour, tokens de sortie max, appels parallèles) ;
  - Contexte (seuil de compaction, échanges conservés, résumé d'équipe) ;
  - Budget (tokens max par tâche) ;
  - Autonomie : **matrice classe de risque × politique** (auto / demander / interdit) — composant K7 ;
  - Humain dans la boucle (destinataire par défaut, canaux, relance, échéance, comportement à l'échéance, escalade, demandes ouvertes max) ;
  - Garde-fous (activer, paramétrer).
- Chaque champ surchargé est marqué (« surcharge du profil supervisé ») avec un bouton pour revenir à la valeur héritée. Les dépassements de plafond sont signalés immédiatement.

**B7 — Bac à sable de test**
- Lance la suite en brouillon avec un LLM réel ou simulé, sur un espace de test isolé.
- Même conversation que l'espace client (C2) + panneau d'inspection : contexte envoyé, appels d'outils, coût, harnais effectif.
- Scénarios enregistrés (consigne + résultat attendu) pour rejouer avant publication.

**B8 — Publication**
- Diff entre version publiée et brouillon : agents, prompts, harnais, validations, interface.
- Avertissements (ex. « un outil irreversible passe en automatique »).
- Notes de version, puis *Publier*. Effet : s'applique au prochain tour des agents en cours.

**B9 — Catalogue**
Onglets Agents types, Outils (avec classe de risque et schéma), Profils de harnais, Garde-fous, Modèles de prompt. Lecture seule pour le global (vient du dépôt Git), édition pour les variantes.

**B10 — Supervision**
- Coûts par jour, par client, par modèle ; part du cache ; fallbacks ; latences.
- Équipes actives, files d'attente, erreurs récentes avec lien vers le journal.

**B11 — Journal d'une équipe (vue support)**
- Rejeu chronologique de tous les événements : messages, appels LLM (avec tokens et coût), outils, demandes humaines, changements de harnais.
- Lecteur pas à pas (lecture, pause, avancer, reculer), à la manière d'Akgentic.
- Inspection d'un appel LLM : contexte envoyé, réponse, modèle effectif.

**B12 — Journal d'audit**
- Qui a modifié quoi (suites, harnais, plafonds, accès support), quand, pourquoi.

---

## 8. Composants clés
| ID | Composant | Contenu et états |
|----|-----------|------------------|
| K1 | **Avatar agent / humain** | Carré arrondi (agent) ou cercle (humain), couleur stable, pastille de statut |
| K2 | **Message** | Auteur, heure, contenu markdown, pièces jointes, détail technique repliable ; variante bulle (humain) et bloc (Akgent) |
| K2b | **Bloc « Travail en cours »** | Akgents impliqués, étape et outil en cours, durée, coches de fin, bouton Arrêter ; replié à la fin ; dépliable vers les échanges internes |
| K2c | **Liste de conversations** | Titre, avatars des Akgents, point ambre (demande), triangle bleu vert (livrable), date |
| K3 | **Carte de demande humaine** | Trois variantes : *Question* (question, contexte repliable, options en boutons, recommandation mise en avant, texte libre, bloquante ou non) ; *Validation d'action* (outil, badge de risque, **aperçu de l'effet**, arguments éditables, Approuver / Modifier puis approuver / Refuser avec commentaire) ; *Validation de message* (message retenu, destinataire, règle déclenchée). États : en attente, relancée, escaladée, répondue (par qui, quand), expirée, annulée. Échéance visible |
| K4 | **Badge de risque** | read, write_internal, write_external, irreversible, avec libellé clair et infobulle |
| K5 | **Jauge de crédits** | Utilisé / inclus, seuil 80 %, projection, état dépassé |
| K6 | **Carte tâche** | Titre, assigné, statut, critères d'acceptation, dépendances, crédits consommés |
| K7 | **Matrice d'autonomie** | Lignes = classes de risque, colonnes = auto / demander / interdit ; héritage du profil visible ; plafonds verrouillés avec cadenas |
| K8 | **Champ hérité / surchargé** | Valeur, origine (profil, client, agent, équipe), bouton « rétablir », alerte plafond |
| K9 | **Graphe d'organisation** | Nœuds agents, flèches de routage, point d'entrée et superviseur marqués ; édition en back-office, lecture en client |
| K10 | **Statut d'agent** | travaille (animé discret), attend une réponse (ambre), inactif, en pause, erreur |
| K11 | **Diff de version** | Ajouts, suppressions, modifications par section |

## 9. Parcours prioritaires
1. **Première conversation** (Sophie) : Accueil → « Nouvelle conversation » dans la Suite Commerciale → écrit « Prépare une proposition pour Dupont SA à partir de notre dernier échange » et joint le compte rendu → Lina (coordinatrice) accuse réception → bloc « Travail en cours » : Hugo rédige, Nora vérifie le CRM → question de Lina sur la remise (carte K3, réponse en un clic) → livrable PDF dans la conversation → Sophie demande une modification par message.
2. **Question d'un agent** (Sophie) : email « Lina a une question » → C5 sur mobile → choisit l'option recommandée → confirmation → l'agent reprend (visible ensuite dans la conversation).
3. **Validation d'une action irréversible** (Marc) : notification → C4 → carte « Envoyer un email à client@dupont.be » avec aperçu complet → corrige une phrase → *Modifier puis approuver* → email envoyé, trace dans la conversation.
4. **Suivi de consommation** (Marc) : alerte 80 % → C8 Consommation → voit la suite la plus consommatrice → *Demander plus de crédits*.
5. **Nouvelle suite pour un client** (Léa) : B3 → *Nouvelle suite* → modèle « Commercial » → B5 Organisation → ajuste un agent en B6 (prompt, harnais en *strict* pour l'envoi d'emails) → B7 test sur un scénario → B8 publication → le client voit sa suite.
6. **Ajuster un agent trop bavard** (Léa) : B10 signale « 6 demandes par tâche » pour un agent → B6 → baisse `max_open_requests`, passe un outil en auto → publication.
7. **Support** (admin) : client signale un problème → B3 *Accès support* avec motif → B11 rejeu de la tâche → identifie un fallback suivi d'une erreur.

## 10. États à concevoir systématiquement
Pour chaque écran : chargement (squelettes), vide (avec action proposée), erreur (message clair + réessayer), accès refusé, données longues (troncature, pagination). Pour le temps réel : nouvel événement arrivant pendant la lecture (indicateur « 3 nouveaux messages »), perte de connexion (bandeau discret, reconnexion automatique).

## 11. Hors périmètre de cette première maquette
Facturation et paiement en ligne, configuration des connecteurs (F-007), import d'historique (F-008), accès via MCP depuis Claude ou ChatGPT (F-009), application mobile native, multilingue effectif.

## 12. Ce que j'attends en retour de Figma Make
- Le **code exporté** (projet complet en zip, ou dépôt GitHub si tu le connectes) : un pour l'espace client, un pour le back-office, ou un seul projet avec les deux, selon ce qui est le plus simple dans Figma Make.
- Le lien vers le fichier Figma Make, pour les captures et la discussion.
- Règles pour faciliter l'intégration (déjà incluses dans les prompts) : composants de présentation sans appel réseau, données reçues en props, types issus de `contrat-donnees.ts`, données fictives isolées dans un dossier `mocks/`.

À l'intégration, je brancherai ces composants sur l'API temps réel (F-005) et le back-office (F-006), sans reprendre le design.

## 13. Décisions prises (2026-10-03)
- Nom du produit : **Initiative IA** ; agents : **Akgents** ; brand book dans `brand/initiative-ia/`.
- Espace client en **marque blanche** : logo et nom du client ; mention Initiative IA discrète et désactivable.
- **Prénoms des Akgents** : option par suite (prénom + rôle / rôle seul).
- **Un seul projet Figma Make** pour les deux espaces.
- **Carte de demande humaine** (K3) validée.
- **Chat** : conversations par sujet, écriture à l'équipe via le coordinateur ou directement à un Akgent, travail visible via le bloc « Travail en cours » (§6.3).

## 14. Questions ouvertes
- Fichiers de marque manquants : lockup vertical et exports PNG (référencés dans le README de marque). Les variantes inverse et monochrome ont été dérivées de la planche d'identité, à valider.
