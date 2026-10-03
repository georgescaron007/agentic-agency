# Brief UX / UI — Agentic Agency

Version 0.1 · 2026-10-03 · Statut : **en revue**
Destinataire : conception dans Figma Make, puis retour du code pour intégration (F-005 interface client, F-006 back-office).
Sources : `00-vision/vision.md` v0.2, `features/F-001-moteur-equipe/spec.md` v0.2.

Fichiers associés :
- `prompts-figma-make.md` : prompts prêts à coller, dans l'ordre ;
- `contrat-donnees.ts` : types TypeScript et données fictives à fournir à Figma Make pour que le code généré colle aux APIs.

---

## 1. Ce qu'on conçoit
Deux applications web qui partagent un même système de design :

| Application | Utilisateurs | Rôle |
|-------------|--------------|------|
| **Espace client** | Collaborateurs et responsable du client | Travailler avec sa suite d'agents : donner des consignes, répondre aux questions, valider, suivre |
| **Back-office** | Notre équipe | Créer les clients, concevoir et publier les suites, régler les harnais, superviser, assister |

Nom du produit : provisoire (« Agentic Agency »), à remplacer. Langue de l'interface : français ; prévoir des libellés externalisés (anglais et néerlandais plus tard).

## 2. Personas
| Persona | Contexte | Ce qu'il veut | Écrans clés |
|---------|----------|---------------|-------------|
| **Sophie, commerciale** (utilisatrice client) | PME de 15 personnes, utilise ChatGPT de son côté, peu de temps | Déléguer une tâche en une phrase, répondre vite aux agents, retrouver ce qu'ils ont produit | Accueil, Fil de la suite, Demandes |
| **Marc, gérant** (responsable client) | Acheteur de la plateforme, veut voir le retour sur investissement | Savoir ce que fait la suite, garder le contrôle sur les actions sensibles, maîtriser le forfait | Accueil, Activité, Consommation, Utilisateurs |
| **Léa, consultante** (notre équipe) | Conçoit les suites avec les clients | Partir d'un modèle, adapter rapidement, tester avant de livrer, ajuster après coup | Suites, Éditeur d'agent, Bac à sable, Publication |
| **Admin plateforme** (nous) | Exploitation | Voir les coûts réels, les erreurs, les clients proches de leur quota ; assister un client | Supervision, Clients, Journal |

## 3. Principes de conception
1. **Une équipe, pas un chatbot.** On voit qui fait quoi : chaque agent a un nom, un rôle, un statut et une activité. Le fil ressemble à un canal d'équipe (type Slack), pas à une fenêtre de chat unique.
2. **L'humain d'abord quand il est attendu.** Les demandes qui attendent une personne (questions, validations) sont toujours visibles en un coup d'œil : badge global, encart en tête de l'accueil, notification.
3. **Répondre en un clic.** Chaque question affiche la recommandation de l'agent et ses options sous forme de boutons ; le texte libre reste possible.
4. **Montrer l'effet avant de valider.** Une validation d'action affiche précisément ce qui va se passer (destinataire, contenu, montant, dépôt). Le niveau de risque est visible. On peut modifier avant d'approuver.
5. **Le travail asynchrone est normal.** Les agents travaillent pendant qu'on fait autre chose : statuts clairs (« travaille », « attend ta réponse », « en pause »), pas de spinner bloquant.
6. **Transparence sans bruit.** Le détail technique (appels d'outils, modèles, tokens) est disponible mais replié par défaut côté client ; il est déplié par défaut côté back-office.
7. **Sobre et professionnel.** Interface de travail quotidienne : dense mais aérée, lisible, sans effets décoratifs.

## 4. Direction visuelle (proposition)
- Ambiance : « salle de coordination calme ». Fond neutre clair, une couleur d'accent unique pour les actions, couleurs sémantiques réservées aux états.
- Couleurs sémantiques :
  - attente humaine : ambre ;
  - risque `irreversible` : rouge ; `write_external` : orange ; `write_internal` : bleu ; `read` : gris ;
  - succès : vert ; erreur : rouge.
- Chaque agent a une couleur d'avatar stable et une initiale ou une icône de rôle ; les humains ont leur photo ou initiales dans un cercle, les agents dans un carré arrondi (distinction immédiate humain / agent).
- Typographie : une sans-serif lisible pour l'interface, une mono pour les extraits de code, chemins et identifiants.
- Mode clair et mode sombre.
- Bureau d'abord (1280–1600 px). L'espace client doit rester utilisable sur mobile pour **répondre aux demandes** (lien depuis un email) ; le reste peut être simplifié sur mobile. Le back-office est bureau uniquement.

Contrainte technique : React + TypeScript + Tailwind, composants **shadcn/ui**, icônes **lucide-react** (stack cible Next.js, ADR-002).

## 5. Vocabulaire de l'interface
| Terme technique (spec) | Libellé interface |
|------------------------|-------------------|
| TeamCard / équipe instanciée | **Suite** (modèle) / **Espace de travail** d'une suite |
| AgentCard / agent | **Agent** (ex. « Lina — Prospection ») |
| HumanRequest `question` | **Question** |
| HumanRequest `tool_approval` / `message_approval` | **Validation** |
| Tâche du planning | **Tâche** |
| Événements | **Activité** |
| Pool de tokens | **Crédits IA** (affichés en tokens, D6) |
| HarnessProfile | **Comportement** (autonome / supervisé / strict) côté client ; **Harnais** côté back-office |

---

## 6. Espace client

### 6.1 Navigation
Barre latérale gauche :
- Accueil
- Mes suites (une entrée par suite : ex. « Suite Commerciale »)
- Demandes (badge du nombre en attente pour moi)
- Documents
- Activité
- Paramètres (responsable uniquement) : Utilisateurs, Consommation, Notifications

En haut : sélecteur d'espace si plusieurs suites, recherche globale, cloche de notifications, menu utilisateur.

### 6.2 Écrans

**C1 — Accueil**
- Encart « En attente de toi » : les 3 demandes les plus urgentes (question ou validation), avec bouton de réponse direct.
- Cartes des suites : nom, agents (avatars avec statut), tâches en cours, dernière activité.
- « Ce qui a été fait cette semaine » : livrables récents (documents, mises à jour, PR).
- Jauge de crédits du mois (responsable uniquement) : utilisé / inclus, projection fin de mois, seuil 80 %.
- État vide (premier jour) : message d'accueil, présentation de la suite livrée, suggestion de première consigne.

**C2 — Espace de travail d'une suite** (écran principal)
Disposition en trois zones :
- **Gauche (étroite)** : l'équipe — liste des agents avec avatar, nom, rôle, statut (`travaille`, `attend une réponse`, `inactif`, `en pause`, `erreur`) ; humains de l'équipe ; bouton « Voir l'organisation ».
- **Centre** : le **fil** de la suite.
  - Messages humains et agents, regroupés par fil de discussion (`in_reply_to`).
  - Mention `@agent` pour adresser un agent précis ; par défaut au point d'entrée de la suite.
  - Type d'intention visible discrètement (demande, réponse, notification, instruction).
  - Messages entre agents visibles, repliables (« Lina a échangé 4 messages avec Hugo »).
  - Demandes humaines intégrées dans le fil sous forme de cartes (voir composant K3).
  - Pièces jointes et documents produits sous forme de cartes cliquables.
  - Détail repliable sous un message d'agent : étapes, outils utilisés, durée, crédits consommés.
  - Zone de saisie : texte, pièce jointe, mention, raccourci « Nouvelle tâche ».
- **Droite (panneau à onglets)** : Tâches (kanban compact : à faire, en cours, bloqué, en revue, fait), Documents de la suite, Détails de l'agent sélectionné.

**C3 — Fiche agent** (panneau ou page)
- Identité : nom, rôle, description, département, comportement (autonome / supervisé / strict) en lecture seule.
- Ce qu'il peut faire : liste de ses outils en langage simple avec badge de risque et règle (« Envoie des emails — demande ta validation »).
- Activité récente, tâches en cours, crédits consommés ce mois.
- Bouton « Lui écrire ».

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
4. **Interface client** : vues activées (fil, tâches, documents, activité), nom affiché de la suite, logo, message d'accueil, suggestions de premières consignes. Aperçu en direct de l'espace client.
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
- Même fil que l'espace client (C2) + panneau d'inspection : contexte envoyé, appels d'outils, coût, harnais effectif.
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
| K2 | **Message** | Auteur, heure, intention, contenu markdown, pièces jointes, réponses groupées, détail technique repliable |
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
1. **Première consigne** (Sophie) : Accueil → suite → écrit « Prépare une proposition pour Dupont SA à partir de notre dernier échange » → le point d'entrée accuse réception → tâche créée → agents travaillent → document livré dans le fil.
2. **Question d'un agent** (Sophie) : email « Lina a une question » → C5 sur mobile → choisit l'option recommandée → confirmation → l'agent reprend (visible ensuite dans le fil).
3. **Validation d'une action irréversible** (Marc) : notification → C4 → carte « Envoyer un email à client@dupont.be » avec aperçu complet → corrige une phrase → *Modifier puis approuver* → email envoyé, trace dans le fil.
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

## 13. Questions ouvertes
- **Nom et identité** du produit : as-tu un nom, un logo, des couleurs ? Sinon, la direction §4 sert de point de départ neutre.
- **Marque blanche** : les clients verront-ils notre marque, la leur, ou les deux (« Suite Commerciale — Dupont SA, propulsé par … ») ? Le back-office prévoit déjà nom et logo par suite.
- **Prénoms des agents** : leur donne-t-on des prénoms humains (« Lina — Prospection ») ou seulement des rôles (« Agent Prospection ») ? La proposition retient des prénoms, avec le rôle toujours visible et le statut d'agent IA toujours explicite (avatar carré, mention « Agent IA ») pour ne jamais faire passer un agent pour une personne.
