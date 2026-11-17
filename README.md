# Dayo PulseInfra — Front

Front-end React/TypeScript de l'application de gestion du Capital Humain du groupe Dayo.

Le projet est organisé pour consommer directement l'API NestJS : aucune donnée métier n'est simulée dans le code livré.

## Principes

- Le backend est la source de vérité : routes, rôles, permissions, menus et indicateurs.
- Aucun mock d'authentification ni de données métier dans l'application.
- TypeScript strict pour transformer les écarts de contrat API en erreurs de compilation.
- Une URL d'API ne s'écrit que dans un fichier `api.ts`.
- Une clé de cache TanStack Query contient toujours le périmètre de filiale.
- Un module dont les routes backend n'existent pas n'a pas d'écran.

## Stack

- React 19
- Vite 8
- TypeScript strict
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- Axios
- ReactFlow (`@xyflow/react`)
- Lucide React
- Motion

## Démarrage

Prérequis : Node 22, backend NestJS accessible sur `http://localhost:3000`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Le serveur Vite relaie `/api` vers `http://localhost:3000`. Aucune URL de serveur n'est écrite dans le code.

Variables disponibles :

```env
VITE_API_URL=/api/v1
VITE_NOM_APPLICATION="DAYO PulseInfra"
```

Toute variable `VITE_` est exposée au navigateur. Aucun secret ne doit y être placé.

## Scripts

```bash
npm run dev       # serveur de développement
npm run build     # vérification TypeScript puis build Vite
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # prévisualisation du build
```

## Architecture

```text
src/
├── app/                  # assemblage : providers, routeur, coquille
├── shared/               # socle technique, sans métier
│   ├── api/              # Axios, jetons, erreurs, types API
│   ├── auth/             # session, profil, guards
│   ├── ui/               # composants d'interface génériques
│   ├── hooks/            # hooks partagés
│   └── utils/            # formatage, classes CSS
├── fonctionnalites/      # un dossier par domaine backend
│   ├── authentification/
│   ├── pilotage/
│   ├── agents/
│   ├── trombinoscope/
│   ├── organigramme/
│   └── organisation/
└── styles/               # Tailwind 4 et charte Dayo
```

Règles de dépendance :

```text
app/  ->  fonctionnalites/  ->  shared/
```

- `shared/` ne connaît aucun domaine métier.
- `app/` est la seule couche qui assemble plusieurs domaines.
- Un domaine peut importer le domaine `agents`, jamais l'inverse.

## Routes livrées

| Route | Écran | Accès |
|---|---|---|
| `/connexion` | Connexion + 2FA | Public |
| `/tableau-de-bord` | Pilotage | Connecté |
| `/agents` | Liste des agents | Connecté |
| `/agents/:id` | Fiche agent, carrière, photo, signature | Connecté |
| `/trombinoscope` | Annuaire illustré | Connecté |
| `/organigramme` | Organigramme daté, lecture seule | Connecté |

Les droits fins sont vérifiés par le backend ; le guard front ne protège que l'affichage.

Le menu latéral n'est pas codé en dur : il vient de `GET /pilotage/modules`, filtré par le serveur selon les rôles et permissions du compte.

## Authentification et sécurité

- L'utilisateur et ses permissions ne sont pas stockés dans le navigateur.
- Seuls le refresh token (`dayopi.refreshToken`) et la filiale de travail (`dayopi.filialeCourante`) sont persistés.
- Au démarrage, la session est reprise par `/auth/refresh` puis `/auth/profil`.
- Les permissions affichées viennent du serveur ; les contrôles réels restent côté backend.
- Le cache TanStack Query est vidé à chaque connexion et déconnexion.

## Documentation

- [Architecture et flux](./ARBORESCENCE_ET_FLUX.md)
- [Architecture et flux — version PDF](./ARBORESCENCE_ET_FLUX.pdf)
- [Cadrage de migration](./docs/CADRAGE-DEV-LEAD-FRONT.txt)
- [Documents historiques](./docs/historique/)

## Historique

Les anciennes maquettes JavaScript/localStorage sont conservées sur la branche Git :

```text
archive/maquettes-localstorage
```
