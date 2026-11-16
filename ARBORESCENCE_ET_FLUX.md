# DayoPI — Arborescence et flux de l'application

**Puls Infra / Groupe Dayo** — Front-end de gestion du Capital Humain
Document de vulgarisation technique à destination du responsable hiérarchique.

> État du document : novembre 2026.
> Il décrit l'organisation actuelle du dépôt et le fonctionnement des écrans, sans entrer dans le détail de chaque ligne de code.

---

## Lecture rapide

- L'application est un front-end **React** organisé en **pages**, **composants**, **hooks**, **services** et **configuration**.
- Les pages affichent l'interface ; les services centralisent les appels API et les données de démonstration.
- L'authentification et plusieurs modules récents peuvent fonctionner soit avec le **backend réel**, soit avec des **mocks locaux**.
- Les modules historiques (congés, stock, fournitures, sollicitations, utilisateurs) utilisent encore **localStorage** et attendent leur branchement API.
- Les nouveaux modules (agents, trombinoscope, pilotage, organigramme du groupe) sont conçus pour appeler directement l'API.

---

## 1. Arborescence commentée

```text
DayoCH/
├── public/                         # Fichiers statiques servis par Vite
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                            # Code source de l'application
│   ├── main.jsx                    # Point d'entrée React + configuration TanStack Query
│   ├── App.jsx                     # Routes, guards d'accès et assemblage général
│   ├── index.css                   # Styles globaux et design system
│   ├── App.css                     # Styles complémentaires
│   │
│   ├── assets/                     # Images et ressources importées par Vite
│   │
│   ├── config/                     # Configuration métier et jeux de démonstration
│   │   ├── filiales.js             # Les 4 filiales du groupe
│   │   ├── permissions.js          # Permissions et droits par rôle
│   │   ├── donnees.js              # Activation/désactivation des mocks
│   │   ├── agentsDemo.js           # Agents de démonstration et historique
│   │   └── organigrammeDemo.js     # Collaborateurs et arbre d'organigramme mock
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Session, rôle, filiale active, permissions
│   │
│   ├── hooks/                      # Logique React réutilisable
│   │   ├── useAgents.js            # Requêtes/mutations agents + trombinoscope
│   │   ├── usePilotage.js          # Requête du tableau de bord pilotage
│   │   ├── usePerimetre.js         # Filiale active ou périmètre "groupe"
│   │   ├── useFiltresUrl.js        # Filtres synchronisés avec l'URL
│   │   ├── useDebounce.js          # Retard de saisie pour les recherches
│   │   └── useImageProtegee.js     # Chargement des photos/signatures protégées
│   │
│   ├── services/                   # Accès aux données et logique métier
│   │   ├── apiClient.js            # Axios, JWT, filiale, gestion des erreurs 401
│   │   ├── jetons.js               # Access token, refresh token, filiale courante
│   │   ├── apiAuth.js              # Endpoints d'authentification
│   │   ├── authMappers.js          # Normalisation utilisateur/roles/permissions
│   │   ├── authService.js          # Connexion, 2FA, session, mock auth
│   │   ├── queryClient.js          # Configuration du cache TanStack Query
│   │   ├── agentsService.js        # Agents, carrière, photos, signatures, exports
│   │   ├── pilotageService.js      # Indicateurs, modules, points d'attention
│   │   ├── apiOrganigramme.js      # Arbre, synthèse et export de l'organigramme
│   │   ├── congesService.js        # Congés (mock localStorage)
│   │   ├── fournituresService.js   # Fournitures/stock (mock localStorage)
│   │   ├── sollicitationsService.js# Sollicitations RH (mock localStorage)
│   │   └── utilisateursService.js  # Comptes utilisateurs (mock localStorage)
│   │
│   ├── pages/                      # Écrans de l'application
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── TwoFactorPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── agents/
│   │   │   ├── AgentsPage.jsx
│   │   │   └── AgentDetailPage.jsx
│   │   ├── trombinoscope/
│   │   │   └── TrombinoscopePage.jsx
│   │   ├── pilotage/
│   │   │   └── PilotagePage.jsx
│   │   ├── admin/
│   │   │   ├── OrganigrammePage.jsx
│   │   │   ├── FilialesPage.jsx
│   │   │   └── UtilisateursPage.jsx
│   │   ├── conges/
│   │   │   └── CongesPage.jsx
│   │   ├── fournitures/
│   │   │   ├── FournituresPage.jsx
│   │   │   ├── StockPage.jsx
│   │   │   ├── TracabilitePage.jsx
│   │   │   ├── DemandesStockPage.jsx
│   │   │   └── AlertesStockPage.jsx
│   │   ├── sollicitations/
│   │   │   └── SollicitationsPage.jsx
│   │   ├── profil/
│   │   │   └── ProfilPage.jsx
│   │   └── equipe/
│   │       └── EquipePage.jsx
│   │
│   ├── components/                 # Composants réutilisables
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx      # Structure sidebar + header + contenu
│   │   │   ├── Header.jsx          # Barre supérieure + sélecteur de filiale
│   │   │   └── Sidebar.jsx         # Menu latéral dépendant du rôle
│   │   ├── ui/                     # Boutons, badges, cartes, modales, animations
│   │   ├── common/
│   │   │   └── ExportButtons.jsx   # Boutons CSV/Excel/PDF
│   │   ├── agents/
│   │   │   ├── AgentsFilters.jsx
│   │   │   ├── FriseCarriere.jsx
│   │   │   ├── PaveSignature.jsx
│   │   │   └── PhotoAgent.jsx
│   │   ├── trombinoscope/
│   │   │   └── CarteAgent.jsx
│   │   ├── organigramme/            # Arbre interactif et vues groupe
│   │   ├── conges/
│   │   ├── fournitures/
│   │   ├── sollicitations/
│   │   ├── utilisateurs/
│   │   ├── equipe/
│   │   └── profil/
│   │
│   └── utils/                      # Fonctions utilitaires pures
│       ├── format.js               # Dates, durées, initiales
│       ├── export.js               # Génération d'exports côté client
│       ├── organigramme.js         # Helpers multi-filiales
│       └── totp.js                 # Génération et vérification TOTP
│
├── .env.example                    # Modèle de configuration environnement
├── package.json                    # Dépendances et scripts npm
├── vite.config.js                  # Serveur Vite et proxy vers le backend
├── README.md                       # Présentation générale
├── PRESENTATION.md                 # Support de présentation
├── RECAP.md                        # Ancien récapitulatif de synthèse
└── ARBORESCENCE_ET_FLUX.md         # Le présent document
```

> `node_modules/`, `dist/` et les fichiers de cache ne sont pas détaillés : ils sont générés automatiquement.

---

## 2. Architecture en trois couches

```text
┌─────────────────────────────────────────────────────────┐
│  PAGES ET COMPOSANTS                                    │
│  Interface, formulaires, tableaux, modales              │
│  src/pages  ·  src/components                           │
└───────────────────────┬─────────────────────────────────┘
                        │ hooks / appels de service
┌───────────────────────▼─────────────────────────────────┐
│  HOOKS ET SERVICES MÉTIER                               │
│  Cache, filtres, appels API, règles d'accès             │
│  src/hooks  ·  src/services                             │
└───────────────────────┬─────────────────────────────────┘
                        │ Axios + JWT + X-Filiale-Id
┌───────────────────────▼─────────────────────────────────┐
│  BACKEND API OU MOCK LOCAL                              │
│  /api/v1/...  ou  localStorage                          │
└─────────────────────────────────────────────────────────┘
```

### Pourquoi cette séparation ?

- **Les pages ne parlent pas directement à Axios.** Elles passent par des hooks ou des services.
- **Le contrat API est centralisé.** Un changement d'endpoint ne nécessite pas de modifier chaque écran.
- **Le mode démo est isolé.** Les mêmes écrans peuvent utiliser un mock ou le backend selon les variables d'environnement.
- **Les règles de rôle et de filiale sont transverses.** Elles sont appliquées dans `AuthContext`, `App.jsx`, `Sidebar.jsx` et les guards de routes.

---

## 3. Démarrage de l'application

```text
main.jsx
  └── QueryClientProvider       (cache des requêtes)
        └── App
              └── AuthProvider  (session + permissions + filiale)
                    └── BrowserRouter
                          └── Routes
                                ├── /login et /2fa  (publiques)
                                └── MainLayout      (protégé)
                                      ├── Sidebar
                                      ├── Header
                                      └── page courante
```

1. `main.jsx` crée le client TanStack Query.
2. `AuthProvider` lit la session existante et restaure éventuellement le jeton.
3. `App.jsx` vérifie si l'utilisateur est connecté.
4. `MainLayout` affiche la navigation et le contenu.
5. `Sidebar` adapte le menu au rôle ; `Header` affiche la filiale active.

---

## 4. Flux d'authentification

### 4.1 Connexion

```text
LoginPage
  → AuthContext.login(identifiant, motDePasse)
    → authService.login()
      ├── VITE_USE_MOCK_AUTH=true
      │     → comptes de démonstration + 2FA locale
      └── VITE_USE_MOCK_AUTH=false
            → POST /api/v1/auth/login
  → réponse avec ou sans double authentification
      ├── sans 2FA : session enregistrée → /dashboard
      └── avec 2FA : utilisateur en attente → /2fa
```

### 4.2 Double authentification

```text
/2fa
  → AuthContext.verify2FA(code)
    → authService.verify2FA()
      ├── mock : vérification TOTP locale
      └── réel : POST /api/v1/auth/2fa/verifier
  → création de la session authentifiée
  → redirection vers /dashboard
```

En mode mock, la 2FA est obligatoire pour `super_admin` et `manager`.
En mode réel, c'est le backend qui décide si la 2FA est requise.

### 4.3 Session et jetons

| Élément | Rôle |
|---|---|
| `dayoch_session_v1` | Session utilisateur sérialisée |
| `dayopi.refreshToken` | Jeton de rafraîchissement |
| `dayopi.filialeCourante` | Filiale sélectionnée |
| `dayoch_2fa_secrets_v1` | Secrets TOTP validés, mode mock |
| `dayoch_2fa_pending_v1` | Secret TOTP en attente de validation |

L'access token est conservé en mémoire. Le refresh token est persisté pour permettre la reconnexion.
`apiClient.js` intercepte les réponses `401` et tente un rafraîchissement avant de déconnecter l'utilisateur.

---

## 5. Flux d'un appel API

```text
Composant
  → hook (ex. useAgents)
    → service (ex. apiAgents.lister)
      → apiClient (Axios)
          headers :
            Authorization: Bearer <accessToken>
            X-Filiale-Id: <filialeCourante>
        ├── backend disponible → réponse API
        └── mode mock → calcul/filtrage sur les données locales
```

### Nouveaux modules

Agents, trombinoscope et pilotage utilisent **TanStack Query** :

- mise en cache des réponses ;
- clé de cache incluant le périmètre/filiale ;
- invalidation après création, mutation, photo ou signature ;
- états `isLoading`, `isError`, `isFetching` gérés dans les pages.

### Modules historiques

Congés, fournitures, stock, sollicitations et utilisateurs appellent directement leurs services.
Ces services lisent et écrivent dans `localStorage`.
Ils restent fonctionnels en démonstration, mais ne sont pas encore branchés au backend.

---

## 6. Flux des rôles et permissions

### 6.1 Rôles

Quatre rôles sont utilisés dans l'interface :

- `employe`
- `manager`
- `gestionnaire_stock`
- `super_admin`

Le backend peut envoyer des codes différents (`SUPER_ADMIN`, `GERANT`, `AGENT`, etc.).
`authMappers.js` les traduit vers ces quatre rôles internes.

### 6.2 Permissions

Les permissions sont définies dans `config/permissions.js` :

| Permission | super_admin | manager | gestionnaire_stock | employe |
|---|---:|---:|---:|---:|
| `pilotage:read` | oui | oui | non | non |
| `agent:read` | oui | oui | oui | oui |
| `agent:update` | oui | non | non | non |
| `trombinoscope:read` | oui | oui | oui | oui |
| `organigramme:read` | oui | oui | non | non |
| `organigramme:export` | oui | oui | non | non |

`super_admin` reçoit toujours toutes les permissions.

### 6.3 Application des droits

```text
App.jsx
  ├── PrivateRoute     → utilisateur connecté ?
  ├── RoleRoute        → rôle autorisé ?
  └── PermissionRoute  → permission autorisée ?
Sidebar.jsx            → menu adapté au rôle
AuthContext.peut()     → vérification unitaire dans les pages
```

> Les guards du front améliorent l'expérience utilisateur, mais la sécurité réelle doit être assurée par le backend.

---

## 7. Flux de la filiale et du périmètre

```text
Header : sélecteur de filiale
  → AuthContext.changerFiliale(id)
    → jetons.setFiliale(id)
      → apiClient ajoute X-Filiale-Id
      → les clés TanStack Query changent
      → les données de la nouvelle filiale sont rechargées
```

- Un utilisateur rattaché à une seule filiale voit sa filiale imposée.
- Un compte groupe (`filialeId` absent) peut changer de filiale.
- La première filiale est sélectionnée par défaut pour un compte groupe.
- Le trombinoscope du groupe reste volontairement transversal pour un compte groupe.
- Le pilotage et la liste des agents sont limités au périmètre sélectionné.

---

## 8. Flux métier par module

### 8.1 Pilotage

```text
PilotagePage
  → usePilotage()
    → apiPilotage.tableauDeBord(perimetre, role, permissions)
      ├── backend : GET /pilotage/tableau-de-bord
      └── mock : calcul depuis les agents de démonstration
  → affichage :
      - indicateurs clés
      - points d'attention
      - modules accessibles
      - effectif par filiale
```

Les indicateurs mock sont calculés à partir des agents : effectif actif, couverture photo, comptes manquants, emails manquants, gérants, filiales couvertes.

### 8.2 Agents

```text
/agents
  → filtres stockés dans l'URL
  → useAgents(filtres)
  → apiAgents.lister()
      ├── GET /organisation/agents
      └── mock filtrage/tri/pagination
  → tableau paginé + exports
```

```text
/agents/:id
  → useAgent() + useCarriere()
  → apiAgents.detail() + apiAgents.historique()
  → actions disponibles :
      - photo
      - signature tracée ou fichier
      - mutation de poste/service
      - export de la carrière
```

### 8.3 Trombinoscope

```text
/trombinoscope
  → useTrombinoscope(filtres, compteGroupe)
  → apiAgents.agentsPourTrombinoscope()
      ├── GET /organisation/trombinoscope
      └── mock regroupement par filiale
  → cartes agents regroupées par filiale
  → export PDF / Excel / CSV
```

### 8.4 Organigramme

Deux vues coexistent :

1. **Par filiale** : organigramme interactif avec ReactFlow, drag & drop et historique local.
2. **Organigramme du groupe** : arbre consolidé, lecture seule, avec filtres et exports.
   - En mode mock : arbre de démonstration.
   - En mode réel : `GET /organisation/organigramme`.

Les managers peuvent consulter l'organigramme, mais seuls les super administrateurs peuvent modifier la vue par filiale.

### 8.5 Modules historiques

| Module | Service | Stockage actuel |
|---|---|---|
| Congés | `congesService.js` | `localStorage` |
| Fournitures | `fournituresService.js` | `localStorage` |
| Stock / traçabilité | `fournituresService.js` | `localStorage` |
| Sollicitations | `sollicitationsService.js` | `localStorage` |
| Utilisateurs | `utilisateursService.js` | `localStorage` |

Ces modules sont fonctionnels pour la démonstration. Le branchement API consiste principalement à remplacer l'intérieur des services sans modifier les pages.

---

## 9. Cartographie des routes

| Route | Écran | Accès |
|---|---|---|
| `/login` | Connexion | Public |
| `/2fa` | Double authentification | Session en attente |
| `/dashboard` | Tableau de bord | Tous les rôles |
| `/agents` | Liste des agents | Tous les rôles |
| `/agents/:id` | Fiche agent | Tous les rôles |
| `/trombinoscope` | Annuaire illustré | Tous les rôles |
| `/pilotage` | Indicateurs de pilotage | Manager, super admin |
| `/conges` | Congés et absences | Employé, manager, super admin |
| `/sollicitations` | Sollicitations RH | Employé, manager, super admin |
| `/fournitures` | Demandes de fournitures | Employé, manager, super admin |
| `/stock` | Inventaire | Gestionnaire stock, super admin |
| `/tracabilite` | Mouvements de stock | Gestionnaire stock, super admin |
| `/demandes-fournitures` | Demandes de stock | Gestionnaire stock, super admin |
| `/alertes` | Alertes stock | Gestionnaire stock, super admin |
| `/profil` | Mon profil | Tous les rôles |
| `/organigramme` | Organigramme | Manager, super admin |
| `/filiales` | Gestion des filiales | Super admin |
| `/utilisateurs` | Gestion des comptes | Super admin |
| `/equipe` | Mon équipe | Manager, super admin |
| `/formations` | Formations | Employé, manager, super admin — à venir |
| `/evaluations` | Évaluations | Manager, super admin — à venir |
| `/statistiques` | Statistiques | Super admin — à venir |
| `/parametres` | Paramètres | Super admin — à venir |

---

## 10. Mode mock et mode backend

### Variables d'environnement

| Variable | Valeur par défaut | Effet |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Préfixe des appels API |
| `VITE_USE_MOCK_AUTH` | `true` | Authentification locale simulée |
| `VITE_USE_MOCK_DATA` | `true` | Données métier simulées |

### Comptes de démonstration

En mode mock, l'identifiant détermine le rôle (le mot de passe est ignoré) :

| Identifiant | Rôle |
|---|---|
| `super_admin` | Super administrateur |
| `admin` | Super administrateur |
| `manager` | Manager |
| `employe` | Employé |
| `stock` | Gestionnaire de stock |
| `2fa` | Parcours de double authentification |

### Backend réel

```bash
# 1. Démarrer le backend sur le port 3000
# 2. Configurer le front
VITE_USE_MOCK_AUTH=false
VITE_USE_MOCK_DATA=false

# 3. Relancer le serveur Vite
npm run dev
```

Vite redirige `/api` vers `http://localhost:3000` grâce à `vite.config.js`.

### Endpoints déjà prévus pour les nouveaux modules

- **Auth** : `/auth/login`, `/auth/2fa/verifier`, `/auth/2fa/setup`, `/auth/2fa/enable`, `/auth/2fa/disable`, `/auth/profil`, `/auth/refresh`, `/auth/logout`
- **Agents** : `/organisation/agents`, `/organisation/agents/:id`, `/organisation/agents/:id/historique`, `/organisation/agents/:id/historique/export`, `/organisation/agents/:id/mutation`, `/organisation/agents/:id/photo`, `/organisation/agents/:id/signature`, `/organisation/agents/:id/signature/fichier`, `/organisation/agents/export`
- **Référentiels agents** : `/organisation/departements`, `/organisation/services`
- **Trombinoscope** : `/organisation/trombinoscope`, `/organisation/trombinoscope/export`
- **Pilotage** : `/pilotage/tableau-de-bord`, `/pilotage/modules`
- **Organigramme** : `/organisation/organigramme`, `/organisation/organigramme/synthese`, `/organisation/organigramme/export`

---

## 11. État d'avancement

### Finalisé et utilisable

- Authentification, session, 2FA et comptes de démonstration.
- Layout général, navigation, sidebar, header et sélecteur de filiale.
- Guards de routes par rôle et par permission.
- Module agents : liste, fiche, filtres, carrière, photo, signature, mutation, exports.
- Trombinoscope groupé : recherche, filtre photo, regroupement par filiale, exports.
- Pilotage : indicateurs, points d'attention, modules, effectif par filiale.
- Organigramme par filiale et organigramme du groupe.
- Modules historiques de démonstration : congés, fournitures, stock, sollicitations, utilisateurs, profil, équipe.

### Partiel ou à finaliser

- Branchement API complet des modules historiques.
- Bascule complète de l'organigramme par filiale sur les données serveur.
- Modules Formations, Évaluations, Statistiques et Paramètres.
- Notifications temps réel et recherche globale.
- Tests automatisés et validation visuelle navigateur.

### Dettes techniques visibles

- Certains modules conservent des données locales dans `localStorage`.
- La vue par filiale de l'organigramme utilise encore un modèle de démonstration.
- Le bundle principal dépasse légèrement le seuil d'alerte de Vite ; un découpage par route pourra être ajouté.
- Les guards front ne remplacent pas les contrôles d'accès côté backend.

---

## 12. Par où commencer pour comprendre le code

Ordre de lecture recommandé :

1. `src/App.jsx` — quelles pages existent et qui peut y accéder.
2. `src/components/layout/Sidebar.jsx` — menu visible par rôle.
3. `src/context/AuthContext.jsx` — session, permissions, filiale active.
4. `src/services/authService.js` — connexion et 2FA.
5. `src/services/apiClient.js` — comment un appel API est envoyé.
6. `src/pages/agents/AgentsPage.jsx` — exemple complet d'une page connectée à l'API.
7. `src/hooks/useAgents.js` — exemple de cache et d'invalidation TanStack Query.
8. `src/pages/pilotage/PilotagePage.jsx` — exemple de tableau de bord consolidé.

---

## 13. Glossaire

| Terme | Définition |
|---|---|
| **Agent** | Collaborateur du groupe, rattaché à une filiale, un département et un service. |
| **Filiale** | Entité géographique du groupe (Bénin, Guinée, Burkina Faso, Côte d'Ivoire). |
| **Périmètre** | Données visibles selon la filiale active ou le compte groupe. |
| **Mock** | Données simulées localement, utilisées sans backend. |
| **JWT** | Jeton d'authentification envoyé à l'API. |
| **2FA / TOTP** | Double authentification avec code à 6 chiffres renouvelé toutes les 30 secondes. |
| **Guard** | Contrôle qui empêche l'accès à une page si l'utilisateur n'est pas autorisé. |
| **TanStack Query** | Bibliothèque qui gère le cache et les états des requêtes serveur. |
| **localStorage** | Stockage local du navigateur, utilisé pour la démonstration. |

---

## Conclusion

Le projet est structuré pour que l'interface reste indépendante de la source de données.
Les modules récents sont déjà pensés pour le backend ; les modules historiques peuvent être migrés progressivement en remplaçant leurs services, sans réécrire les écrans.

Cette organisation permet de présenter une application démontrable aujourd'hui, tout en gardant un chemin clair vers une version entièrement connectée à l'API.
