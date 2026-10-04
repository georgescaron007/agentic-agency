# Reliquat à corriger à l'intégration du code Figma Make

Revue finale des maquettes : 2026-10-04 (soir). Ces points sont mineurs et seront corrigés dans le code lors de F-005 (espace client) et F-006 (back-office), plutôt que par de nouveaux prompts.

## Scénario de démonstration (données fictives)
- La question « Quelle remise appliquer ? » est à la fois **répondue** (ligne repliée « 5 % — répondu par Marc à 16:20 ») et **en attente** (accueil, statut de Lina, bloc « Travail en cours »). Retenir une seule version : **en attente**, qui illustre mieux le parcours.
- La validation « Envoyer la proposition à jean.leroy@dupont-sa.be » ne peut pas exister tant que la proposition est un brouillon dont la remise n'est pas tranchée : la remplacer par une autre validation (ex. relance d'un prospect).
- La carte du brouillon porte le badge « Livrable » : afficher « Brouillon ». Sur l'accueil, « Livré cette semaine » ne doit pas lister un brouillon.
- Gmail : l'accès accordé est « Lecture seule » alors que Hugo doit envoyer des emails → « Lecture et écriture » pour la connexion de Sophie.

## Libellés
- Pluriels : « 1 événement », « 1 client », « 1 client » (modèles), « Plafond » (et non « Plafonds ») dans l'éditeur d'agent.
- Supervision : « Équipes actives : 5 » alors que chaque équipe affiche « 0 actifs » ; une équipe d'un client suspendu ne doit pas être active.
- Compteur « Demandes en attente » du back-office (3) et du client (4, connexion incluse) : définir une règle commune (proposé : les demandes de connexion comptent).

## Comportements
- Assistant « Nouvelle suite », étape 3 : afficher l'état des connecteurs chez le client choisi (HubSpot déjà connecté chez Dupont → pas d'invitation) et l'état des documents (« déjà disponible »).
- Modèle « Technique » : connecteur requis GitHub (et non SharePoint seul).
- Paramètres › Utilisateurs : le responsable ne peut pas se désactiver lui-même.
- Le bouton « Utiliser ce modèle » ne réagit pas au premier clic dans certains cas (vérifier la zone cliquable).
- Alias de modèles : sujet en attente (affichent encore des modèles hors Scaleway).
