# FitZone

Application web e-commerce pour salle de sport généraliste — TFE.

Permet aux utilisateurs de souscrire à des abonnements, réserver des cours et suivre leur activité sportive.

## Stack technique

**Backend** — Django 5 + Django REST Framework + JWT + PostgreSQL + Stripe
**Frontend** — React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query

## Structure du projet

```
TFE/
├── backend/          # API Django REST
│   ├── fitzone/      # Projet Django (settings, urls)
│   ├── apps/         # Apps métier (users, courses, ...)
│   └── manage.py
├── frontend/         # Application React
│   ├── src/
│   └── package.json
└── README.md
```

## Démarrage rapide

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

API disponible sur `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Application disponible sur `http://localhost:5173`

## Acteurs

- **Visiteur** — consulte cours et coachs, s'inscrit
- **Membre** — souscrit, réserve, gère son profil
- **Coach** — crée cours, planifie séances
- **Administrateur** — gère la plateforme

## Fonctionnalités principales

- Authentification JWT multi-rôles
- 4 formules d'abonnement (Basic/Premium × Mensuel/Annuel)
- Catalogue de cours et planning de séances
- Réservations avec gestion de capacité
- Paiement Stripe (mode test)
- Dashboard membre avec recommandations
- Notation des coachs
- Back-office administrateur
- Multilingue FR / EN

## Documentation

- Documentation API : `http://localhost:8000/api/docs/` (Swagger)
- Voir [docs/](./docs/) pour l'architecture, le schéma BDD, etc.
