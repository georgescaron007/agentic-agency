# Mise en place du VPS de développement

Objectif : un serveur où Claude Code travaille directement sur le dépôt (terminal, Docker, tests, branches, pull requests), sans jamais toucher à la production.

## 0. Le serveur
- Ubuntu 24.04 LTS (Claude Code demande Ubuntu 20.04+ ou Debian 10+, 4 Go de RAM minimum).
- Recommandé pour ce projet : **4 vCPU, 16 Go de RAM, 80 Go de disque** (Postgres, Redis, LiteLLM, conteneurs de sandbox et builds tournent en même temps). 8 Go est un minimum.
- Hébergé chez Scaleway (Paris), séparé de la future production.

## 1. Sécuriser l'accès (en root, une seule fois)
```bash
adduser dev && usermod -aG sudo dev
mkdir -p /home/dev/.ssh && cp ~/.ssh/authorized_keys /home/dev/.ssh/ && chown -R dev:dev /home/dev/.ssh
# Désactiver la connexion root et par mot de passe
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/; s/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
apt update && apt -y upgrade && apt -y install ufw fail2ban unattended-upgrades
ufw allow OpenSSH && ufw --force enable
```
Ensuite, on se connecte toujours en `dev` : `ssh dev@<ip>`.

## 2. Outils de développement (en `dev`)
```bash
sudo apt -y install git make curl tmux build-essential ca-certificates gnupg
# Docker Engine + Compose (dépôt officiel Docker)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker dev && newgrp docker
# Python 3.12 + uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# Node 22 + pnpm (pour le frontend)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt -y install nodejs
sudo corepack enable && corepack prepare pnpm@latest --activate
# CLI GitHub
sudo apt -y install gh
```

## 3. Accès GitHub limité au dépôt
1. Sur GitHub : **Settings › Developer settings › Fine-grained tokens › Generate new token**.
   - Repository access : **Only select repositories › agentic-agency**.
   - Permissions : Contents (lecture/écriture), Pull requests (lecture/écriture), Metadata (lecture).
   - Expiration : 90 jours.
2. Sur le VPS : `gh auth login` → GitHub.com → HTTPS → coller le jeton. Puis `gh auth setup-git`.
3. Dans le dépôt GitHub : **Settings › Branches › protection de `main`** (pull request obligatoire). Claude Code ne peut alors que pousser des branches et ouvrir des PR, jamais modifier `main` directement.
4. Identité des commits : `git config --global user.name "Georges Caron"` et `git config --global user.email "<ton email>"`.

## 4. Claude Code
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
claude doctor
```
Première connexion : lancer `claude` et suivre les instructions de connexion avec ton compte Claude (Pro, Max, Team ou Enterprise). Sur un serveur sans navigateur, ouvre le lien affiché depuis ton ordinateur.

## 5. Le dépôt
```bash
mkdir -p ~/code && cd ~/code
git clone https://github.com/georgescaron007/agentic-agency.git
cd agentic-agency
cp .env.example .env   # créé par la tâche 01 du plan F-001 ; y mettre la clé Scaleway de DÉVELOPPEMENT
```

## 6. Travailler avec Claude Code
```bash
tmux new -s agency        # la session survit à la déconnexion SSH (revenir : tmux attach -t agency)
cd ~/code/agentic-agency
claude
```
Claude Code lit automatiquement `CLAUDE.md` (règles SDD, stack, conventions). Première consigne type :

> Lis CLAUDE.md, specs/01-architecture/architecture.md, specs/decisions.md et specs/features/F-001-moteur-equipe/. Exécute la tâche 01 de plan.md sur une branche dédiée et ouvre une pull request.

Une tâche = une branche = une pull request, que tu relis et merges sur GitHub.

## Règles de sécurité
- Aucune donnée client réelle ni secret de production sur ce VPS.
- Clé Scaleway dédiée au développement, avec un plafond de dépense bas.
- Le jeton GitHub ne donne accès qu'à ce dépôt et expire.
- Pas de port ouvert autre que SSH ; pour voir l'interface en développement, utiliser un tunnel : `ssh -L 5173:localhost:5173 dev@<ip>` puis http://localhost:5173 sur ton ordinateur.
