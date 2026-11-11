# DevOps Calculator — B3 Ynov Campus Maroc

Application calculatrice web avec backend Node.js et frontend React, entièrement conteneurisée et déployée via un pipeline CI/CD automatisé (GitLab CI/CD + Jenkins).

---

## Project Overview

Ce projet implémente un workflow DevOps complet autour d'une calculatrice web :

- **Frontend** React moderne qui envoie les opérations au backend
- **Backend** Node.js/Express qui effectue les calculs et conserve un historique
- **Conteneurisation** Docker avec build multi-stage pour chaque service
- **CI/CD** pipeline GitLab automatisé (install → test → build → deploy)
- **Jenkins** pipeline alternatif déclaratif avec build et push des images Docker

L'application expose 3 routes backend : `GET /health`, `POST /api/calculate`, `GET /api/history`.

---

## Technologies Used

| Technologie | Rôle | Version |
|---|---|---|
| Node.js + Express | Backend API REST | 20 LTS |
| React (CRA) | Frontend calculatrice | 18 |
| Jest + Supertest | Tests unitaires backend (8 tests) | 29 |
| Docker | Conteneurisation multi-stage | 24 |
| Docker Compose | Orchestration multi-services | 3.9 |
| Nginx | Serveur frontend en production | 1.27 |
| GitLab CI/CD | Pipeline principal | `.gitlab-ci.yml` |
| GitLab Container Registry | Stockage des images Docker | — |
| Jenkins | Pipeline alternatif | LTS |

---

## Project Structure

```
devops-calc/
├── backend/
│   ├── server.js           # API Express (calculate, history, health)
│   ├── server.test.js      # 8 tests Jest avec Supertest
│   ├── package.json
│   └── Dockerfile          # Multi-stage: node:20-alpine → runtime
├── frontend/
│   ├── src/
│   │   ├── App.js          # Calculatrice React complète
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   ├── nginx.conf          # Config reverse proxy Nginx
│   └── Dockerfile          # Multi-stage: build React → Nginx
├── jenkins/
│   ├── Dockerfile          # Jenkins custom + Node.js 20 + Docker CLI
│   └── plugins.txt         # Plugins Jenkins requis
├── scripts/
│   └── deploy.sh           # Script Bash de déploiement automatisé
├── docs/
│   └── DOCUMENTATION.md    # Documentation complète Phase 5
├── .gitlab-ci.yml          # Pipeline GitLab 4 stages
├── Jenkinsfile             # Pipeline Jenkins déclaratif
├── docker-compose.yml      # Orchestration backend + frontend
└── README.md
```

---

## CI/CD Pipeline Details

### GitLab CI/CD (`.gitlab-ci.yml`)

Le pipeline se déclenche automatiquement à chaque `git push` sur `main` ou `develop`.

```
install → test → build → deploy
```

| Stage | Job | Description |
|---|---|---|
| `install` | `install_backend` | `npm ci` pour le backend |
| `install` | `install_frontend` | `npm ci` pour le frontend |
| `test` | `test_backend` | Jest — 8 tests, rapport JUnit |
| `build` | `build_and_push_backend` | Build + push image backend vers GitLab Registry |
| `build` | `build_and_push_frontend` | Build + push image frontend vers GitLab Registry |
| `deploy` | `deploy_echo` | `echo "Deployment successful"` |

> **Note :** Le build et le push sont fusionnés dans le même job pour garantir que l'image buildée est disponible au moment du push (les runners GitLab sont éphémères).

**Variables CI/CD configurées** dans GitLab → Settings → CI/CD → Variables :

| Variable | Description |
|---|---|
| `SSH_PRIVATE_KEY` | Clé SSH privée du serveur cible |
| `DEPLOY_HOST` | IP ou hostname du serveur |
| `DEPLOY_USER` | Utilisateur SSH |

`CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` sont injectés automatiquement par GitLab.

### Jenkins (`Jenkinsfile`)

Pipeline déclaratif Jenkins connecté au dépôt GitLab, avec accès Docker via TCP (`tcp://host.docker.internal:2375`).

```
Checkout → Install → Tests → Build & Push → Post Actions
```

| Stage | Description |
|---|---|
| `📥 Checkout` | Clone le dépôt GitLab |
| `📦 Install` | `npm install` backend + frontend |
| `🧪 Tests` | Jest 8/8 tests backend |
| `🐳 Build & Push` | Build images Docker + push vers GitLab Registry |
| `Post Actions` | Nettoyage workspace + message résultat |

**Résultat Jenkins :** Build #2 — `Finished: SUCCESS` ✅

---

## Deployment Process

### Option 1 — Docker Compose (recommandé)

```bash
docker compose up --build -d
docker ps
docker compose logs -f
```

- Frontend : http://localhost:3002
- Backend  : http://localhost:5000

### Option 2 — Développement local (sans Docker)

```bash
# Terminal 1 — Backend
cd backend
npm install
node server.js
# ✅ Server running on port 5000

# Terminal 2 — Frontend
cd frontend
npm install
npm start
# Ouvre automatiquement http://localhost:3000
```

### Option 3 — Script Bash automatisé

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Le script : pull la dernière image → stop l'ancien container → lance le nouveau → health check → cleanup.

### Option 4 — Images Docker manuelles

```bash
# Backend
cd backend
docker build -t devops-calc-backend .
docker run -d -p 5000:5000 devops-calc-backend

# Frontend
cd frontend
docker build -t devops-calc-frontend .
docker run -d -p 3002:80 devops-calc-frontend
```

### Push vers GitLab Container Registry

```bash
docker login registry.gitlab.com
docker tag devops-calc-backend registry.gitlab.com/khadija-ibisk-group/devops-calc/backend:latest
docker push registry.gitlab.com/khadija-ibisk-group/devops-calc/backend:latest
```

---

## Git Branching Strategy

```
main      → production  (pipeline complet : install → test → build → deploy)
develop   → staging     (install + test + build uniquement)
feature/* → dev local   (tests uniquement)
```

### Conventional Commits

```bash
git commit -m "feat: add history endpoint"
git commit -m "fix: division by zero error"
git commit -m "fix: merge build and push in same job"
git commit -m "ci: update gitlab-ci.yml pipeline structure"
git commit -m "docs: update README to reflect final pipeline"
git commit -m "chore: ignore parasitic docker file"
```

---

## Running Tests

```bash
cd backend
npm install
npm test
```

**Résultats :**
```
PASS ./server.test.js
  Calculator API
    ✓ GET /health → 200
    ✓ POST /api/calculate addition
    ✓ POST /api/calculate soustraction
    ✓ POST /api/calculate multiplication
    ✓ POST /api/calculate division
    ✓ POST /api/calculate division par zéro → 400
    ✓ GET /api/history retourne tableau
    ✓ Paramètres manquants → 400

Tests: 8 passed, 8 total
```

---

## API Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Info API |
| `GET` | `/health` | Health check |
| `POST` | `/api/calculate` | Effectuer un calcul |
| `GET` | `/api/history` | Historique des 20 derniers calculs |
| `DELETE` | `/api/history` | Effacer l'historique |

### Exemple POST /api/calculate

```json
// Request
{ "a": 10, "b": 5, "operator": "+" }

// Response
{ "id": 1234567890, "expression": "10 + 5", "result": 15, "timestamp": "2025-01-01T00:00:00.000Z" }
```

Opérateurs supportés : `+` `-` `*` `/` `%` `**`

---

## Docker Images — GitLab Container Registry

Les images sont automatiquement buildées et pushées à chaque pipeline sur `main` :

| Image | Tags |
|---|---|
| `registry.gitlab.com/khadija-ibisk-group/devops-calc/backend` | `latest`, commit SHA |
| `registry.gitlab.com/khadija-ibisk-group/devops-calc/frontend` | `latest`, commit SHA |

---