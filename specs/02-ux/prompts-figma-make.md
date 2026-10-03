# Prompts Figma Make — Agentic Agency

Version 0.1 · 2026-10-03
À utiliser avec `brief-ux.md` (le pourquoi et le détail) et `contrat-donnees.ts` (les types et données fictives).

## Mode d'emploi
- **Un seul projet Figma Make** contenant les deux applications, sur deux zones de routes : `/app/...` (espace client) et `/admin/...` (back-office). Le système de design est ainsi partagé et le code revient en un seul bloc.
- Joindre `contrat-donnees.ts` dès le prompt P0 (ou coller son contenu). Joindre `brief-ux.md` aussi si Figma Make accepte les fichiers.
- Avancer **un prompt à la fois** et vérifier le résultat avant de passer au suivant. Les petites corrections se font par messages courts (« la carte de validation doit montrer le badge de risque en haut à droite »).
- Si un écran dérive du brief, corriger tout de suite : plus on avance, plus il est coûteux de rattraper.

---

## P0 — Contexte et fondations
```
Tu conçois une application web SaaS appelée provisoirement « Agentic Agency » (le nom changera).
Elle permet à une PME d'utiliser une « suite » d'agents IA dédiée à un métier (commercial, service client, RH, technique). Les agents travaillent en équipe, de façon asynchrone, et sollicitent des humains quand ils ont un doute ou avant une action risquée.

Il y a deux applications dans ce même projet, qui partagent le même système de design :
1. l'espace client, sous /app : les collaborateurs du client travaillent avec leur suite ;
2. le back-office, sous /admin : notre équipe crée les clients, conçoit les suites et règle le comportement des agents.

Contraintes techniques :
- React + TypeScript strict + Tailwind CSS, composants shadcn/ui, icônes lucide-react ;
- composants de présentation uniquement : aucune requête réseau, toutes les données arrivent en props ;
- utiliser exclusivement les types du fichier contrat-donnees.ts joint ; placer les données fictives dans un dossier mocks/ ;
- interface en français, libellés regroupés dans un fichier de traductions (fr par défaut) ;
- mode clair et mode sombre.

Direction visuelle : « salle de coordination calme ». Interface de travail quotidienne, sobre, dense mais aérée. Fond neutre, une seule couleur d'accent pour les actions. Couleurs sémantiques réservées aux états :
- attente d'une réponse humaine : ambre ;
- niveaux de risque des actions : read gris, write_internal bleu, write_external orange, irreversible rouge ;
- succès vert, erreur rouge.
Les agents ont un avatar carré arrondi avec une couleur stable et la mention « Agent IA » ; les humains ont un avatar rond. On doit toujours distinguer un agent d'une personne.

Commence par créer uniquement les fondations : thème (tokens de couleur, typographie, espacements, rayons), mode clair/sombre, et une page /design qui présente ces composants avec les données fictives :
- K1 Avatar agent / humain avec pastille de statut (working, waiting_human, idle, paused, error) ;
- K4 Badge de risque (4 niveaux, libellé clair et infobulle) ;
- K5 Jauge de crédits (utilisé / inclus, seuil 80 %, projection fin de mois, état dépassé) ;
- K10 Statut d'agent (libellés : « Travaille », « Attend une réponse », « Inactif », « En pause », « Erreur »).
```

## P1 — Espace client : structure et accueil
```
Crée la structure de l'espace client sous /app.

Barre latérale gauche : Accueil, Mes suites (une entrée par suite), Demandes (badge du nombre en attente), Documents, Activité, Paramètres (visible seulement pour le rôle owner). En haut : recherche, cloche de notifications, menu utilisateur.

Page Accueil (/app) :
- en tête, un encart ambre « En attente de vous » avec les 3 demandes humaines les plus urgentes (HumanRequest), chacune avec un bouton « Répondre » ;
- des cartes de suites : nom, avatars des agents avec statut, nombre de tâches en cours, dernière activité ;
- « Livré cette semaine » : documents et résultats récents ;
- la jauge de crédits du mois (owner uniquement).
Prévois l'état vide du premier jour : message d'accueil de la suite (welcomeMessage) et boutons de premières consignes (suggestedPrompts).
Prévois aussi les états chargement (squelettes) et erreur.
Utilise mockSuite, mockRequests, mockUsage et mockUsers.
```

## P2 — Espace de travail d'une suite (écran principal)
```
Crée la page /app/suites/[id], l'écran principal de l'espace client, en trois zones :

1. Gauche, étroite : l'équipe. Liste des agents (avatar, prénom, rôle, statut) puis des humains. Un bouton « Voir l'organisation ».

2. Centre : le fil de la suite, à la manière d'un canal d'équipe (pas d'un chatbot) :
- messages humains et agents (AgentMessage), groupés par fil de discussion via inReplyTo ;
- l'intention du message affichée discrètement (demande, réponse, notification, instruction, accusé de réception) ;
- les échanges entre agents sont repliables : « Lina a échangé 4 messages avec Hugo » ;
- sous chaque message d'agent, un détail technique replié par défaut (trace : étapes, outils utilisés, durée, crédits) ;
- pièces jointes en cartes cliquables ;
- zone de saisie en bas : texte, mention @agent avec autocomplétion, pièce jointe, bouton « Nouvelle tâche ». Par défaut le message va à l'agent point d'entrée (entryPoint), indiqué dans la zone de saisie ;
- indicateur « 3 nouveaux messages » quand des messages arrivent pendant la lecture, et bandeau discret en cas de perte de connexion.

3. Droite : panneau à onglets Tâches (mini kanban : à faire, en cours, bloqué, en revue, fait), Documents, Détails de l'agent sélectionné.

Les demandes humaines apparaissent aussi dans le fil, sous forme de cartes : pour l'instant mets un emplacement simple, le composant complet arrive au prompt suivant.
Utilise mockSuite, mockMessages, mockTasks.
```

## P3 — Demandes humaines : le composant le plus important
```
Crée le composant K3 « Carte de demande humaine », avec trois variantes selon HumanRequest.type :

1. Question (QuestionRequest) :
- agent qui demande, question en gros, contexte repliable ;
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
- remplace les emplacements du fil par ce composant ;
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
  · Notifications : canaux (application, email) par type d'événement, destinataire par défaut des demandes.
Ajoute aussi la fiche agent (panneau latéral ouvert depuis l'équipe) : identité, comportement (autonome / supervisé / strict) en lecture seule, liste de ses outils en langage simple avec badge de risque et règle (ex. « Envoie des emails — demande votre validation »), activité récente, crédits du mois, bouton « Lui écrire ».
```

## P5 — Back-office : structure, tableau de bord, clients
```
Crée le back-office sous /admin, même système de design, densité plus élevée et détails techniques visibles par défaut.

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
4. Interface client : vues activées (fil, tâches, documents, activité), nom affiché, logo, message d'accueil, premières consignes suggérées, avec un aperçu en direct de l'accueil client.
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
- le bac à sable (/admin/.../tester) : le même fil que l'espace client, plus un panneau d'inspection à droite (contexte envoyé au modèle, appels d'outils, coût, harnais effectif) ; liste de scénarios enregistrés (consigne + résultat attendu) avec bouton « Rejouer » ;
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
