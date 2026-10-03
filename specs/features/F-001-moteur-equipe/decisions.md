# F-001 — Décisions à arbitrer

Chaque point bloque une partie de la spec. Une recommandation est proposée ; il suffit de répondre « ok » ou de choisir une autre option.

## D1 — Que se passe-t-il quand le pool mensuel du tenant est épuisé ?
- (a) Blocage : les agents s'arrêtent jusqu'au mois suivant ou à l'achat d'un pack.
- (b) Dégradation : bascule automatique sur les modèles les moins chers (`gpt-oss-120b`, `mistral-small`) jusqu'à un plafond de 120 %, puis blocage.
- (c) Dépassement facturé au million de tokens.

**Recommandation : (a) en MVP**, avec achat de pack hors plateforme. C'est le plus simple et le plus prévisible. (c) viendra avec la facturation (F-003).

## D2 — Modèle du Tech Lead (`ak-reason`)
- (a) Tout sur `deepseek-v4-flash-0731` au départ, on mesure, puis on monte en gamme si la qualité des specs est insuffisante.
- (b) Directement un modèle plus fort et plus cher : `qwen3.5-397b-a17b`, `mistral-medium-3.5` ou `glm-5.2` (de 4 à 9× le prix en sortie).

**Recommandation : (a).** Le Tech Lead consomme peu par rapport au Dev, donc monter en gamme plus tard aura un impact limité sur la marge.

## D3 — Modèles hors Scaleway et abonnements existants du client
Trois cas distincts :
1. **Abonnement grand public ou personnel** (ChatGPT Plus, Claude Pro, Copilot…) : ce n'est pas un accès API. Leurs conditions d'utilisation interdisent de s'en servir dans un produit tiers. **Non intégrable.**
2. **Clé API du client** (OpenAI, Anthropic, Mistral…) ou **instance cloud du client** (Azure OpenAI, AWS Bedrock, son propre compte Scaleway) : **intégrable (BYOK)**. LiteLLM gère des identifiants par tenant ; les alias `ak-*` du tenant pointent alors vers ses modèles. Conséquences : coût LLM payé par le client (forfait plateforme réduit ou pool non décompté), résidence des données sous sa responsabilité (avenant contractuel), fallback à configurer chez lui.
3. **Modèle premium vendu par nous** (ex. Claude) : option par tenant, facturée en plus.

**Recommandation : MVP 100 % Scaleway.** Prévoir dès F-001 que la table des alias soit **surchargeable par tenant** (aucun coût supplémentaire), et spécifier BYOK et l'option premium en F-003.

### D3-bis — Import de l'historique d'un compte personnel
ChatGPT et Claude permettent d'exporter ses données (archive JSON des conversations). Pas d'API d'import en direct : l'utilisateur fait l'export et nous le dépose.
- Utilité réelle : pas de « reprendre la conversation », mais (a) **découverte** : repérer les tâches que les collaborateurs délèguent déjà à l'IA, ce qui alimente la conception de la suite ; (b) **connaissance** : extraire prompts efficaces, modèles de documents et faits métier vers la base de connaissances de la suite.
- Contraintes : un export personnel mélange vie privée et travail. Il faut le consentement de la personne, un tri (classification par `ak-light` puis sélection humaine), la suppression de l'archive brute après traitement, et aucun import automatique de l'ensemble.

**Recommandation : hors MVP**, à proposer comme outil d'onboarding du back-office (feature dédiée).

## D4 — Validation humaine de la spec avant développement
- (a) Toujours obligatoire dans le Département Technique (gate fixe `tech-lead → dev-backend`, intention `instruction`).
- (b) Configurable par équipe, active par défaut.

**Recommandation : (b).** Le mécanisme `approval_gates` le permet sans code supplémentaire.

## D5 — Qui peut créer ou modifier des agents ?
Le back-office (vision §5.2) implique que nous configurions une suite **par client**, sans redéployer. Le catalogue par tenant en base devient donc nécessaire dès le MVP.
- (a) Catalogue global en YAML (modèles de suites, maintenus dans le dépôt) **+** catalogue par tenant en base, édité **uniquement par notre équipe** via le back-office.
- (b) Idem, et le client peut ajuster prompts et paramètres de ses agents.
- (c) Le client peut créer ses propres agents.

**Recommandation : (a) pour le MVP**, avec versionnement et publication des cartes tenant. (b) et (c) plus tard, le modèle de données le permet déjà.

## D6 — Unité du pool de tokens vendu aux clients
Le coût réel varie d'un facteur 10 selon le type de token : 0,08 € en cache, 0,40 € en entrée, 0,80 € en sortie, par million.
- (a) Tokens bruts (entrée + sortie). Simple à comprendre, mais la marge varie avec l'usage.
- (b) « Tokens équivalents » pondérés par le coût. Le ledger décompte en € et l'affichage convertit en tokens au prix de référence de l'entrée non cachée.
- (c) Crédits en € (« 15 € de crédit IA inclus »).

**Recommandation : (b).** Le client voit des tokens, la marge est garantie, et le cache bénéficie au client puisqu'il consomme moins de pool.
