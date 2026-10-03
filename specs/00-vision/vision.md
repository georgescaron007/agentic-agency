# Vision produit — Initiative IA

Version 0.2 · 2026-10-03 · Statut : **en revue**

Nom du produit : **Initiative IA**. Les agents sont appelés **Akgents** (« Akgents, nos agents IA collaboratifs »), terme propriétaire défini dans `brand/initiative-ia/brand-book.md`. Les espaces clients sont en marque blanche (logo du client).

## 1. Problème
Les PME (10 à 25 personnes) veulent « faire de l'IA » mais ne savent pas par où commencer. Les outils actuels sont des assistants individuels : chacun les utilise dans son coin, rien n'est intégré aux processus de l'entreprise, rien n'est tracé, et rien ne s'améliore collectivement.

## 2. Proposition
Aider un client à **créer sa première suite agentique** : une équipe d'agents IA ciblée sur **un processus ou un métier** (commercial, service client, RH, technique…), qui travaille dans ses outils et lui livre des résultats concrets (documents, réponses, mises à jour CRM, PR GitHub…).

Le modèle est hybride :
- **nous** concevons et configurons la suite avec le client (accompagnement, depuis notre back-office) ;
- **le client** l'utilise au quotidien dans son interface : il donne des consignes, valide, suit l'activité.

Une suite = une TeamCard + ses agents + ses outils et connecteurs + la configuration de son interface client. Tout est déclaratif (voir F-001 §4), ce qui permet de réutiliser une suite d'un client à l'autre sous forme de **modèle**.

La plateforme applique elle-même le SDD dans la suite Technique : le Tech Lead IA produit une spec et la soumet à validation humaine avant tout développement.

## 3. Cibles et déploiement
| Phase | Cible | Mode |
|-------|-------|------|
| 0 | Notre propre structure (tenant interne) | Même plateforme, tenant n° 1 |
| 1 | Premiers clients PME | SaaS **multi-tenant dockerisé**, Scaleway (Paris) |
| 2 | Clients exigeant l'isolation | Déploiement dédié par client avec les **mêmes images** (option, hors MVP) |

L'architecture doit permettre la phase 2 sans réécriture (voir ADR-005).

## 4. Modèles de suites
| Suite | Agents envisagés | Outils clés |
|-------|------------------|-------------|
| Technique | Tech Lead / Architecte, Dev Frontend, Dev Backend, QA | Sandbox Docker, GitHub |
| Commercial | Prospection, qualification, rédaction de propositions, suivi CRM | CRM (HubSpot, Odoo…), email, web |
| Service client | Tri des demandes, réponse, escalade, base de connaissances | Helpdesk, email, base documentaire |
| RH | Rédaction d'offres, présélection, onboarding | Documents, ATS, email |
| Administratif | Devis / facturation, contrats | Documents, PDF, comptabilité |

Ajouter une suite ou un agent se fait par **configuration standardisée** (catalogue), sans modifier le code du moteur.

## 5. Les deux interfaces
### 5.1 Interface client
Utilisée par les collaborateurs du client. Son contenu dépend de la suite (configurable) : fil de conversation avec l'équipe, tableau des tâches, validations en attente, documents produits, consommation du forfait.

### 5.2 Back-office (nous)
Utilisé par notre équipe pour livrer et exploiter les suites :
- gérer les tenants : création, forfait, utilisateurs, suspension ;
- créer une suite pour un client à partir d'un modèle, puis l'adapter : agents, prompts, outils, connecteurs, validations, budgets ;
- configurer l'interface client de la suite : vues activées, libellés, logo ;
- versionner, tester (bac à sable), puis publier une suite ; revenir à la version précédente ;
- superviser : consommation par tenant, erreurs, fallbacks, coûts réels vs forfait ;
- support : consulter le journal d'une équipe client, avec accès tracé.

## 6. Périmètre MVP
Département Technique réduit à **Tech Lead, Dev Backend et QA**. Flux cible :

1. L'utilisateur décrit un besoin.
2. Le Tech Lead produit `spec.md`, qui passe en **validation humaine**.
3. Le Tech Lead découpe le travail en tâches et embauche Dev Backend et QA.
4. Dev Backend implémente dans une sandbox Docker éphémère, puis QA écrit et exécute les tests.
5. Une **PR GitHub** est ouverte dans le dépôt du client.

Le MVP inclut aussi un **back-office minimal** : création de tenants et d'utilisateurs, instanciation d'une suite depuis un modèle, édition des prompts et paramètres, suivi de la consommation.

Hors MVP : Dev Frontend, suites Commercial / Service client / RH / Administratif, connecteurs métier (CRM, helpdesk), facturation en ligne, SSO, déploiement dédié, clés API apportées par le client (BYOK), import d'historique.

> ⚠️ **Point d'attention.** La suite Technique valide le moteur et nous sert en interne, mais les premières suites vendues seront probablement Commercial ou Service client. Celles-ci dépendent surtout de **connecteurs** (CRM, email, helpdesk), pas de la sandbox de code. Les connecteurs (via MCP) doivent donc être spécifiés juste après le MVP, voire en parallèle de F-002.

## 7. Offre commerciale (hypothèse de travail)
| Forfait | Utilisateurs | Prix | Pool de tokens mutualisé / mois |
|---------|--------------|------|----------------------------------|
| Small Team | ≤ 10 | 149 € / mois | 15 M |
| Business | ≤ 25 | 349 € / mois | 40 M |

### 7.1 Vérification du coût LLM (tarifs Scaleway Generative APIs, Paris, relevés le 2026-10-02)
Modèle principal : `deepseek-v4-flash-0731`, à 0,40 €/M tokens en entrée, 0,08 €/M en entrée mise en cache et 0,80 €/M en sortie. La Batches API offre −50 %.

Hypothèse de répartition : 80 % entrée / 20 % sortie, typique des boucles d'agents.

| Forfait | Pire cas (0 % cache) | Cas typique (60 % de l'entrée en cache) |
|---------|----------------------|------------------------------------------|
| Small, 15 M | 7,20 € | 4,90 € |
| Business, 40 M | 19,20 € | 13,10 € |

Les estimations de ~14 € et ~37 € sont donc prudentes pour la partie LLM. Il faut y ajouter la **quote-part d'infrastructure** : instance de production, base de données, stockage, sauvegardes et conteneurs de sandbox. Cette part est mutualisée mais n'est pas nulle.

### 7.2 ⚠️ Points aveugles signalés
1. **« DeepSeek 671B » n'est pas proposé en serverless chez Scaleway.** Le catalogue serverless propose `deepseek-v4-flash-0731`. Héberger un modèle de 671B en déploiement dédié demande une instance de type H100-SXM-8 (~21 944 €/mois), ce qui est incompatible avec ces forfaits. Le libellé de l'offre doit devenir générique, par exemple « modèles open-weight hébergés en France ».
2. **Le volume de tokens est le vrai risque, pas le coût.** Une boucle d'agent de développement renvoie son contexte à chaque étape. Une seule tâche de dev peut consommer de 0,5 à 3 M tokens (ordre de grandeur, à mesurer dès F-001). 15 M ≈ 5 à 30 tâches par mois, ce qui risque de décevoir. Comme le coût unitaire est faible, on pourrait monter le pool à 50 M en Small (pire cas ≈ 24 €, marge ≈ 84 %).
3. **Unité du pool.** Un token en cache coûte 5× moins cher qu'un token d'entrée normal, et un token de sortie 2× plus. Décompter des tokens « bruts » fausse la marge (voir F-001, décision D6).
4. **Claude Sonnet**, prévu dans le brief initial pour l'architecture et le juridique, ne fait pas partie du catalogue Scaleway. Il sortirait du modèle « tout en UE à prix fixe » (voir F-001, décision D3).

## 8. Exigences non fonctionnelles globales
- Résidence des données en UE : hébergement et inférence chez Scaleway, à Paris.
- Isolation stricte entre tenants, au niveau de l'API et de la base de données.
- Traçabilité complète : chaque message, appel LLM, appel d'outil et décision humaine est journalisé (event sourcing).
- Maîtrise des coûts : quotas par tenant, budgets par tâche, fallback vers des modèles moins chers.
- Ajout d'agents et de départements par configuration seule.

## 9. Indicateurs de succès du MVP
- Une demande simple (endpoint CRUD avec tests) aboutit à une PR mergeable sans retouche humaine du code dans ≥ 60 % des cas.
- Consommation médiane par tâche de dev mesurée et documentée, pour recalibrer les forfaits.
- Aucune fuite de données entre tenants lors des tests d'isolation.
- Coût LLM réel ≤ 15 % du prix du forfait.
