# Prompts Figma Make — Initiative IA

Version 0.2 · 2026-10-03
À utiliser avec `brief-ux.md` (le pourquoi et le détail) et `contrat-donnees.ts` (les types et données fictives).

## Mode d'emploi
- **Un seul projet Figma Make** contenant les deux applications, sur deux zones de routes : `/app/...` (espace client) et `/admin/...` (back-office). Le système de design est ainsi partagé et le code revient en un seul bloc.
- Joindre dès le prompt P0 : `contrat-donnees.ts`, le logo `brand/initiative-ia/logo/initiative-ia-logo-primary.svg`, l'icône `initiative-ia-logo-icon.svg` et la planche `brand/initiative-ia/identity/initiative-ia-visual-identity-board.svg`. Joindre `brief-ux.md` aussi si Figma Make accepte les fichiers.
- Avancer **un prompt à la fois** et vérifier le résultat avant de passer au suivant. Les petites corrections se font par messages courts (« la carte de validation doit montrer le badge de risque en haut à droite »).
- Si un écran dérive du brief, corriger tout de suite : plus on avance, plus il est coûteux de rattraper.

---

## P0 — Contexte, marque et fondations
```
Tu conçois une application web SaaS appelée « Initiative IA ».
Elle permet à une PME d'utiliser une « suite » d'agents IA dédiée à un métier (commercial, service client, RH, technique). Les agents travaillent en équipe, de façon asynchrone, et sollicitent des humains quand ils ont un doute ou avant une action risquée. Dans l'interface, on parle simplement d'« agents ».

Il y a deux applications dans ce même projet, qui partagent le même système de design :
1. l'espace client, sous /app : les collaborateurs du client conversent et travaillent avec leurs agents. Cet espace est en marque blanche : logo et nom du client en haut de la barre latérale, mention discrète « Propulsé par Initiative IA » en pied de barre latérale ;
2. le back-office, sous /admin : notre équipe crée les clients, conçoit les suites et règle le comportement des agents. Il porte la marque Initiative IA (logo joint).

Contraintes techniques :
- React + TypeScript strict + Tailwind CSS, composants shadcn/ui thémés avec nos tokens, icônes lucide-react ;
- composants de présentation uniquement : aucune requête réseau, toutes les données arrivent en props ;
- utiliser exclusivement les types du fichier contrat-donnees.ts joint ; placer les données fictives dans un dossier mocks/ ;
- interface en français, libellés regroupés dans un fichier de traductions (fr par défaut) ;
- mode clair et mode sombre.

Identité visuelle Initiative IA (voir la planche jointe) :
- couleurs de marque : bleu encre #0B2545 (texte principal, structure, boutons primaires), blanc chaud #F8F7F4 (fond de page), blanc #FFFFFF (cartes), bleu vert #14B8A6 (accent, progression, agent actif), lime doux #A3E635 (signal positif ponctuel uniquement, jamais pour du texte), bleu action #3B82F6 (liens, focus, sélection), graphite #6B7280 (texte secondaire), bordures #E5E7EB ;
- proportions : surtout du blanc chaud, bleu encre pour la structure, bleu vert en accent ;
- couleurs sémantiques réservées aux états : attente d'une réponse humaine ambre #F59E0B ; niveaux de risque read graphite, write_internal bleu action, write_external orange #F97316, irreversible rouge #DC2626 ;
- mode sombre : fond #071A33, surfaces #0F2A4D, texte #F8F7F4 ;
- typographie : Plus Jakarta Sans (700–800) pour les titres, Inter pour l'interface, une mono pour le code et les identifiants ;
- formes : rayons modérés (8 px cartes), pilier vertical arrondi bleu vert comme indicateur de sélection dans la navigation, petit triangle bleu vert comme marqueur de livrable ou de décision ;
- ton : sérieux sans être froid, sobre, orienté résultat ;
- interdit : robots, cerveaux, circuits, réseaux neuronaux, dégradés violets, esthétique « cyber », effets lumineux.

Les agents ont un avatar carré arrondi avec une couleur stable (teintes de bleu encre, bleu vert, bleu action, graphite) et une icône de rôle ; les humains ont un avatar rond. On doit toujours distinguer un agent d'une personne. Le nom affiché d'un agent dépend du réglage de la suite (fonction agentLabel du contrat) : « Lina · Prospection » ou « Agent Prospection ».

Commence par créer uniquement les fondations : thème (tokens ci-dessus, typographie, espacements, rayons), mode clair/sombre, et une page /design qui présente ces composants avec les données fictives :
- K1 Avatar agent / humain avec pastille de statut (working, waiting_human, idle, paused, error) ;
- K4 Badge de risque (4 niveaux, libellé clair et infobulle) ;
- K5 Jauge de crédits (utilisé / inclus, seuil 80 %, projection fin de mois, état dépassé) ;
- K10 Statut d'agent (libellés : « Travaille », « Attend une réponse », « Inactif », « En pause », « Erreur »).
```

## P1 — Espace client : structure et accueil
```
Crée la structure de l'espace client sous /app.

Barre latérale gauche : logo et nom du client en haut (Suite.branding), puis Accueil, Mes suites (une entrée par suite ; sous la suite active, ses conversations récentes et un bouton « Nouvelle conversation »), Demandes (badge du nombre en attente), Documents, Activité, Paramètres (visible seulement pour le rôle owner). En pied de barre latérale : « Propulsé par Initiative IA » si branding.showPoweredBy. En haut de page : recherche (conversations, documents), cloche de notifications, menu utilisateur.

Page Accueil (/app) :
- en tête, un encart ambre « En attente de vous » avec les 3 demandes humaines les plus urgentes (HumanRequest), chacune avec un bouton « Répondre » ;
- des cartes de suites : nom, avatars des agents avec statut, nombre de tâches en cours, dernière activité, bouton « Nouvelle conversation » ;
- « Livré cette semaine » : documents et résultats récents ;
- la jauge de crédits du mois (owner uniquement).
Prévois l'état vide du premier jour : message d'accueil de la suite (welcomeMessage) et boutons de premières consignes (suggestedPrompts).
Prévois aussi les états chargement (squelettes) et erreur.
Utilise mockSuite, mockRequests, mockUsage, mockUsers et mockConversations.
```

## P2 — Converser avec son équipe d'agents (écran principal)
```
Crée la page /app/suites/[id]/conversations/[conversationId], l'écran principal de l'espace client.

Principe : l'utilisateur vient de ChatGPT, il doit retrouver la simplicité « j'écris, on me répond ». La différence : il converse avec une équipe d'agents, et il voit qui travaille, sans être noyé dans les échanges internes.

Structure :
- les conversations sont rangées par sujet (type Conversation), listées dans la barre latérale sous la suite active, groupées par date. Chaque entrée : titre, avatars des agents impliqués, point ambre si hasPendingRequest, petit triangle bleu vert si hasNewDeliverable ;
- une conversation est soit « à l'équipe » (kind = team : les messages vont au coordinateur, Suite.entryPoint, qui répond et répartit le travail), soit « directe » avec un agent (kind = direct).

Dans la conversation (colonne centrale, largeur de lecture confortable) :
- messages de l'utilisateur : bulles à droite, avatar rond ;
- réponses des agents : blocs à gauche, avatar carré, nom (agentLabel) et rôle, contenu markdown, pièces jointes ;
- bloc « Travail en cours » (type WorkInProgress) quand le coordinateur délègue : une ligne par agent (« Hugo rédige la proposition · étape 3 », « Nora vérifie le CRM ✓ », « Lina attend votre réponse » en ambre), durée écoulée, bouton « Arrêter ». Il se met à jour en direct et se replie à la fin ; clic → déplie les échanges entre agents et le détail technique ;
- livrables : carte de document avec aperçu, triangle bleu vert, actions Ouvrir / Télécharger / Demander une modification ;
- tâches créées : ligne discrète cliquable ;
- les demandes humaines apparaissent à l'endroit où elles surviennent : pour l'instant mets un emplacement simple, le composant complet arrive au prompt suivant.
Pas de texte qui s'écrit mot à mot ni de spinner bloquant : accusé de réception rapide du coordinateur, puis statut vivant dans le bloc « Travail en cours ».

Zone de saisie en bas : placeholder « Écrire à l'équipe… » (ou « Écrire à Hugo… » en conversation directe), mention @ avec autocomplétion des agents, ajout de fichiers par glisser-déposer. Dans une conversation vide : message d'accueil de la suite et premières consignes suggérées (suggestedPrompts) en boutons.

Panneau de droite repliable, à onglets :
- Équipe : agents de la suite avec statut en direct ; clic → fiche ou « Écrire à cet agent » (crée une conversation directe) ;
- Tâches de cette conversation (mini kanban : à faire, en cours, bloqué, en revue, fait) ;
- Fichiers de cette conversation.

Mobile : liste des conversations → conversation plein écran ; le panneau de droite devient une feuille glissante.
Prévois aussi : indicateur « nouveaux messages » si on a remonté le fil, bandeau discret en cas de perte de connexion.
Utilise mockSuite, mockConversations, mockMessages, mockWorkInProgress, mockTasks.
```

## P3 — Demandes humaines : le composant le plus important
```
Crée le composant K3 « Carte de demande humaine », avec trois variantes selon HumanRequest.type :

1. Question (QuestionRequest) :
- Agent qui demande, question en gros, contexte repliable ;
- recommandation de l'agent mise en avant ;
- options en boutons (un clic suffit), plus un champ de texte libre ;
- mention « bloquante » si blocking = true (« Lina attend votre réponse pour continuer »).

2. Validation d'action (ToolApprovalRequest) :
- nom de l'action, badge de risque en évidence ;
- aperçu précis de l'effet (effectPreview : titre + champs) ; les champs editable deviennent modifiables quand on clique « Modifier » ;
- boutons : « Approuver », « Modifier puis approuver », « Refuser » (commentaire obligatoire pour refuser) ;
- pour le niveau irreversible, une confirmation supplémentaire et aucune action groupée.

3. Validation de message (MessageApprovalRequest) : message retenu, destinataire, motif de la règle, mêmes boutons.

Pour toutes : échéance visible (« dans 3 h »), nombre de relances, et états pending, reminded, escalated, answered (par qui, quand), expired, cancelled.

Ensuite :
- remplace les emplacements de la conversation par ce composant ;
- crée la page Demandes /app/demandes : filtres (à moi / à mon équipe / toutes, type, statut), liste triée par urgence puis échéance, détail à droite ;
- crée la page autonome /app/r/[token], pensée mobile d'abord, ouverte depuis un lien reçu par email : uniquement la demande et la réponse, puis une confirmation ; états « lien expiré », « déjà traitée par … le … », « annulée ».
Utilise mockRequests.
```

## P4 — Documents, activité, paramètres
```
Crée dans l'espace client :
- /app/documents : liste par suite (titre, auteur agent ou humain, date, tâche liée), aperçu à droite (markdown, PDF, image, code), téléchargement, lien vers le message d'origine ;
- /app/activite : chronologie filtrable (suite, agent, type, période) d'ActivityEvent, et une vue « Résumé de la semaine » ;
- /app/parametres (owner uniquement), avec trois onglets :
  · Utilisateurs : liste, rôle, invitation, désactivation, limite du forfait (maxUsers) ;
  · Consommation : crédits par mois, par suite, par agent (graphiques simples), seuils de notification, bouton « Demander plus de crédits » ;
  · Notifications : canaux (application, email) par type d'événement, destinataire par défaut des demandes ;
  · Affichage : nommage des agents (« Prénom · rôle » ou « Agent rôle »).
Ajoute aussi la fiche agent (panneau latéral ouvert depuis l'équipe) : identité, comportement (autonome / supervisé / strict) en lecture seule, liste de ses outils en langage simple avec badge de risque et règle (ex. « Envoie des emails — demande votre validation »), activité récente, crédits du mois, bouton « Écrire à cet agent ».
```

## P5 — Back-office : structure, tableau de bord, clients
```
Crée le back-office sous /admin, même système de design, à la marque Initiative IA (logo joint, barre latérale bleu encre avec logo inverse), densité plus élevée et détails techniques visibles par défaut.

Barre latérale : Tableau de bord, Clients, Modèles de suites, Catalogue, Supervision, Journal d'audit, Paramètres.

- /admin : indicateurs (clients actifs, suites publiées, demandes en attente tous clients, coût LLM réel du mois vs revenus, marge), alertes (clients au-delà de 80 % de crédits, hausse d'erreurs, taux de fallback anormal, demandes expirées), raccourcis « Nouveau client » et « Nouvelle suite ».
- /admin/clients : tableau (nom, forfait, utilisateurs / limite, suites, % de crédits, coût réel, statut, dernière activité), recherche et filtres.
- /admin/clients/[id] : onglets Aperçu, Suites (version publiée, brouillon, bouton « Nouvelle suite »), Utilisateurs, Consommation (par suite, agent, modèle ; coût réel ; fallbacks ; part du cache), Configuration (alias de modèles, plafonds), et un bouton « Accès support » qui demande un motif puis ouvre l'espace du client en lecture seule avec un bandeau permanent « Accès support — journalisé ».
- /admin/modeles : bibliothèque de modèles de suites (Technique, Commercial, Service client, RH, Administratif) avec description, agents, outils requis, nombre de clients.
```

## P6 — Back-office : éditeur de suite et éditeur d'agent (harnais)
```
Crée l'éditeur de suite /admin/clients/[id]/suites/[suiteId].
Bandeau supérieur : client, nom de la suite, version, statut Brouillon ou Publiée, boutons « Tester », « Comparer », « Publier ».
Onglets :
1. Organisation : graphe des agents (nœuds) et des routes autorisées (flèches), point d'entrée et superviseur marqués ; ajout d'un agent par glisser-déposer depuis un panneau catalogue ; suppression d'une route au clic.
2. Agents : liste, clic → éditeur d'agent.
3. Validations : tableau éditable des règles (de, vers, intention, motif).
4. Interface client : logo du client (clair et sombre), nom affiché, couleur d'accent optionnelle choisie dans une palette contrôlée, interrupteur « Propulsé par Initiative IA », nommage des agents (prénom + rôle / rôle seul), prénoms et avatars des agents, vues activées (conversations, tâches, documents, activité), message d'accueil, premières consignes suggérées, avec un aperçu en direct de l'espace client.
5. Budget : budget par exécution, rappel du forfait.
6. Historique : versions (SuiteVersion), auteur, date, notes, bouton « Restaurer ».

Crée l'éditeur d'agent, en deux colonnes : formulaire à gauche, aperçu à droite (prompt final résolu et harnais effectif avec son empreinte).
Sections : Identité ; Rôle (éditeur de prompt avec variables {{ }} colorées) ; Outils (cases à cocher avec badge de risque) ; Communication (destinataires autorisés, embauches possibles, instances max) ; Harnais.

Pour le Harnais, utilise le type HarnessView :
- choix du profil en tête (autonome / supervisé / strict) avec une phrase qui explique chacun ;
- blocs dépliables : Modèle, Boucle, Contexte, Budget, Autonomie, Humain dans la boucle, Garde-fous ;
- chaque champ est un composant K8 « hérité / surchargé » : valeur, origine (profil, client, agent, équipe), bouton « Rétablir la valeur héritée », alerte si le plafond (cap) est dépassé, cadenas si locked ;
- le bloc Autonomie contient le composant K7 : une matrice dont les lignes sont les 4 niveaux de risque et les colonnes auto / demander / interdit ; la case irreversible + auto est verrouillée avec un cadenas et l'infobulle « Autorisation administrateur plateforme requise ».
Utilise des données fictives cohérentes avec mockSuite.
```

## P7 — Back-office : test, publication, supervision, journal
```
Crée dans le back-office :
- le bac à sable (/admin/.../tester) : la même conversation que l'espace client, plus un panneau d'inspection à droite (contexte envoyé au modèle, appels d'outils, coût, harnais effectif) ; liste de scénarios enregistrés (consigne + résultat attendu) avec bouton « Rejouer » ;
- la publication : diff entre version publiée et brouillon (K11 : ajouts, suppressions, modifications par section : agents, prompts, harnais, validations, interface), avertissements (ex. « un outil irreversible passe en automatique »), champ notes de version, bouton « Publier », mention « s'applique au prochain tour des agents » ;
- /admin/supervision : coûts par jour, par client, par modèle ; part du cache ; taux de fallback ; latences ; équipes actives ; erreurs récentes avec lien vers le journal ;
- le journal d'une équipe : rejeu chronologique de tous les événements (messages, appels LLM avec tokens et coût, outils, demandes humaines, changements de harnais), lecteur pas à pas (lecture, pause, avancer, reculer), inspection d'un appel LLM (contexte, réponse, modèle effectif) ;
- /admin/audit : qui a modifié quoi, quand, pourquoi.
```

---

## Retour du code
Quand les écrans te conviennent :
1. Exporte le code du projet (zip), ou connecte Figma Make au dépôt GitHub si l'option est disponible, sur une branche `ux/figma-make-v1`.
2. Envoie-moi le zip ou le nom de la branche, avec le lien du fichier Figma Make.
3. J'intègre dans `frontend/` en conservant le design, je remplace les mocks par l'API (F-005 / F-006) et j'ouvre une PR.
