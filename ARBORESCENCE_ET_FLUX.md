# Dayo PulseInfra — Architecture et flux

**Puls Infra / Groupe Dayo** — Front-end de gestion du Capital Humain

Document de référence pour comprendre l'organisation du front, les contrats consommés et les parcours utilisateurs.

> État : novembre 2026, après migration vers l'architecture cible.
> Le cadrage complet est conservé dans [`docs/CADRAGE-DEV-LEAD-FRONT.txt`](./docs/CADRAGE-DEV-LEAD-FRONT.txt).
> Les maquettes JavaScript/localStorage sont archivées sur la branche `archive/maquettes-localstorage`.

---

## Lecture rapide

- Le front consomme l'API NestJS ; il ne contient plus de données métier simulées.
- L'utilisateur, ses rôles et ses permissions viennent du backend et ne sont pas stockés dans le navigateur.
- Chaque domaine possède un dossier dans `src/fonctionnalites/`, avec ses types, son client API, ses hooks et ses écrans.
- `src/shared/` fournit le socle technique et ne dépend d'aucun domaine.
- Le menu est calculé par le serveur ; le front ne fait que l'afficher.

---

## 1. Principes directeurs

### Le backend est la source de vérité

L'ordre de priorité est :

```text
backend NestJS > cadrage > maquettes front de référence
```

Quand un écran et une route backend se contredisent, c'est l'écran qui est corrigé.

### Pas de mocks dans le code livré

Les modes `VITE_USE_MOCK_AUTH` et `VITE_USE_MOCK_DATA`, les jeux de données de démonstration, les permissions locales et le calcul TOTP côté navigateur ont été supprimés.

### TypeScript strict

Le contrat API est recopié dans des types TypeScript. Un champ renommé côté backend doit provoquer une erreur de compilation, pas une page blanche en production.

### Une URL d'API, un seul endroit

Les composants n'appellent jamais Axios directement. Les routes sont déclarées dans les fichiers `api.ts` de chaque domaine.

### Aucun écran sans route backend

Un module dont le contrat serveur n'existe pas n'est pas routé. Une tuile « à venir » est préférable à un écran qui tombe en erreur.

---

## 2. Arborescence

```text
.
├── docs/
│   ├── CADRAGE-DEV-LEAD-FRONT.txt
│   └── historique/
│       ├── PRESENTATION.md
│       └── RECAP.md
├── public/
├── src/
│   ├── app/
│   │   ├── application.ts          # nom de l'application
│   │   ├── providers.tsx           # QueryClient + Auth
│   │   ├── queryClient.ts
│   │   ├── router.tsx              # routes lazy
│   │   └── coquille/
│   │       ├── Coquille.tsx        # barre latérale, header, contenu
│   │       └── SelecteurFiliale.tsx
│   ├── fonctionnalites/
│   │   ├── authentification/
│   │   │   └── PageConnexion.tsx
│   │   ├── pilotage/
│   │   │   ├── PageTableauDeBord.tsx
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── agents/
│   │   │   ├── PageAgents.tsx
│   │   │   ├── PageFicheAgent.tsx
│   │   │   ├── FiltresAgents.tsx
│   │   │   ├── FriseCarriere.tsx
│   │   │   ├── PaveSignature.tsx
│   │   │   ├── PhotoAgent.tsx
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   └── useImageProtegee.ts
│   │   ├── trombinoscope/
│   │   │   ├── PageTrombinoscope.tsx
│   │   │   ├── CarteAgent.tsx
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── organigramme/
│   │   │   ├── PageOrganigramme.tsx
│   │   │   ├── NoeudOrganisation.tsx
│   │   │   ├── disposition.ts
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   └── organisation/
│   │       ├── filiales/
│   │       ├── departements/
│   │       ├── services/
│   │       └── referentiels/
│   ├── shared/
│   │   ├── api/
│   │   │   ├── client.ts           # Axios, refresh, headers
│   │   │   ├── erreurs.ts
│   │   │   ├── jetons.ts
│   │   │   └── types-api.ts
│   │   ├── auth/
│   │   │   ├── api-auth.ts
│   │   │   ├── contexte.ts
│   │   │   ├── contexte-auth.tsx
│   │   │   ├── RouteProtegee.tsx
│   │   │   ├── types.ts
│   │   │   └── useAuth.ts
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── useFiltresUrl.ts
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Bouton.tsx
│   │   │   ├── BoutonsExport.tsx
│   │   │   ├── Champ.tsx
│   │   │   ├── EnTetePage.tsx
│   │   │   ├── Etats.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Squelette.tsx
│   │   │   └── Transition.tsx
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── format.ts
│   ├── styles/
│   │   └── index.css               # Tailwind 4 + thème Dayo
│   ├── assets/
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### Règles de dépendance

```text
app/  ───────►  fonctionnalites/  ───────►  shared/
```

- `app/` assemble les domaines : providers, routeur, coquille.
- `fonctionnalites/` contient le métier : contrat API, hooks, écrans.
- `shared/` ne connaît aucun domaine métier.
- Un domaine peut dépendre du domaine `agents` ; l'inverse est interdit.

---

## 3. Flux d'authentification

### Connexion simple

```text
PageConnexion
  → apiAuth.connexion(identifiant, motDePasse)
  → POST /auth/login
  → accessToken + refreshToken + utilisateur
  → jetons.enregistrer()
  → queryClient.clear()
  → redirection vers la page demandée
```

### Double authentification

Si le backend répond avec `twoFactorRequired: true` :

```text
PageConnexion
  → challengeToken
  → saisie du code TOTP
  → apiAuth.verifier2fa(challengeToken, code)
  → POST /auth/2fa/verifier
  → jetons + utilisateur
```

Le secret TOTP reste côté serveur. Le navigateur ne génère aucun code.

### Reprise de session

Au démarrage :

```text
refresh token présent
  → POST /auth/refresh
  → nouveau access token
  → GET /auth/profil
  → utilisateur en mémoire
```

Le profil est normalisé dans `api-auth.ts` : les rôles peuvent arriver en codes ou en objets, le reste de l'application ne voit qu'une seule forme.

### Conservation des jetons

- L'access token reste en mémoire : un script injecté ne peut pas le lire dans `localStorage`.
- Le refresh token est conservé dans `localStorage` sous `dayopi.refreshToken`, pour survivre au rechargement.
- La filiale de travail est conservée sous `dayopi.filialeCourante`.
- Une évolution vers un cookie `httpOnly` + protection CSRF est le compromis recommandé à terme.

### Déconnexion

```text
POST /auth/logout avec le refresh token
  → effacement des jetons
  → effacement de la filiale courante
  → queryClient.clear()
  → retour à /connexion
```

Même si l'appel réseau échoue, la session locale est fermée.

---

## 4. Flux API

### Instance Axios

`src/shared/api/client.ts` crée une instance unique :

```text
baseURL = VITE_API_URL ou /api/v1
timeout = 20 s
Accept: application/json
```

Chaque requête reçoit automatiquement :

```http
Authorization: Bearer <accessToken>
X-Filiale-Id: <filialeCourante>
```

### Rafraîchissement concurrent

Si plusieurs requêtes reçoivent `401` en parallèle :

1. une seule promesse de rafraîchissement est créée ;
2. les autres requêtes l'attendent ;
3. chaque requête est rejouée une seule fois ;
4. en cas d'échec, les jetons sont effacés et la session est déclarée perdue.

Ce verrou évite de présenter plusieurs fois le même refresh token au backend, qui le ferait tourner et pourrait interpréter cela comme un vol de session.

### Paramètres de requête

`nettoyerParametres()` retire `undefined`, `null` et les chaînes vides. Un filtre vide n'est pas envoyé au backend, qui le refuserait en `400`.

### Téléchargements

Les exports sont protégés par le jeton. Le front :

1. appelle la route avec `responseType: 'blob'` ;
2. crée une URL temporaire ;
3. déclenche le téléchargement ;
4. révoque l'URL.

### Images protégées

Les photos et signatures ne sont pas chargées par une simple balise `<img src="/api/...">` : le navigateur n'y ajouterait pas l'en-tête `Authorization`.

`useImageProtegee()` récupère le binaire via Axios, crée une URL `blob:` puis la révoque au démontage. La date de mise à jour est ajoutée à l'URL pour forcer le renouvellement après remplacement.

---

## 5. Périmètre et RBAC

### Comptes de filiale

Le backend impose la filiale. Le sélecteur n'est pas affiché.

### Comptes de niveau groupe

Un compte sans filiale doit choisir une filiale de travail. Le sélecteur apparaît dans la coquille. Le choix est envoyé dans `X-Filiale-Id`.

### Cache et filiale

Le périmètre fait partie de chaque clé TanStack Query :

```text
['agents', perimetre, 'liste', filtres]
['agents', perimetre, 'detail', id]
['pilotage', 'tableau-de-bord', perimetre]
```

Sans cette dimension, changer de filiale réafficherait le cache de la précédente : les données seraient vraies, mais pas pour le bon périmètre.

### Permissions

- `peut(permission)` vérifie une permission du profil.
- `aRole(...roles)` vérifie un rôle.
- `SUPER_ADMIN` est considéré comme autorisé à tout.
- Le menu vient de `GET /pilotage/modules`, filtré côté serveur.
- `RouteProtegee` protège l'affichage, pas les données. Le backend reste la seule protection réelle.

---

## 6. Routes livrées

| Route | Écran | Guard |
|---|---|---|
| `/connexion` | Connexion et second facteur | Public |
| `/tableau-de-bord` | Indicateurs, points d'attention, modules | Connecté |
| `/agents` | Liste, filtres, tri, pagination, export | Connecté |
| `/agents/:id` | Fiche, photo, signature, carrière, export | Connecté |
| `/trombinoscope` | Cartes groupées par filiale, export | Connecté |
| `/organigramme` | Arbre ReactFlow, date de référence, synthèse, export | Connecté |
| `/` | Redirection vers `/tableau-de-bord` | — |
| `*` | Page introuvable | — |

Toutes les pages protégées sont chargées en `lazy`. L'organigramme, qui embarque ReactFlow, n'est pas téléchargé par un utilisateur qui consulte seulement la liste des agents.

---

## 7. Modules livrés

### Authentification

- Connexion par identifiant et mot de passe.
- Défi 2FA avec `challengeToken`.
- Reprise de session et déconnexion.
- Normalisation du profil.

### Pilotage

- `GET /pilotage/tableau-de-bord` : un seul appel alimente la page.
- Indicateurs, points d'attention, effectif par filiale, modules.
- `GET /pilotage/modules` : source unique du menu.

### Agents

- Liste paginée avec filtres dans l'URL.
- Recherche, département, service, fonction, statut, gérance, email, compte, dates.
- Tri par colonnes.
- Export `xlsx`, `pdf`, `csv`.
- Fiche agent, historique de carrière, export carrière.
- Photo et signature protégées.
- Signature tracée au canvas, envoyée en data URL.

### Trombinoscope

- Groupes par filiale, non paginé.
- Photos protégées et initiales de repli.
- Export.

### Organigramme

- Arbre récursif filiale → département → service → agent.
- Date de référence pour consulter un organigramme passé.
- Filtres département, agents, actifs.
- Vue groupe pour les comptes concernés.
- Synthèse et exports.
- Disposition calculée dans `disposition.ts`.

### Organisation

- Référentiel des filiales.
- Référentiel des départements.
- Référentiel des services, filtrable par département.

### Socle partagé

- Boutons, champs, badges, cartes, pagination, squelettes, états vides et erreurs.
- `useFiltresUrl()` : les filtres survivent au rechargement et au partage d'URL.
- `useDebounce()` : recherche sans requête à chaque frappe.
- `formaterDate()`, `initiales()`.
- `cn()` pour composer les classes Tailwind.

### Modules non livrés dans ce socle

Les domaines historiques non extraits dans la Partie VII du cadrage restent à créer selon le plan d'intégration :

- comptes et profils ;
- administration des filiales, départements, services et audit ;
- équipe ;
- congés ;
- fournitures et stocks ;
- sollicitations ;
- statistiques, évaluations, formations et paramètres.

Ils ne doivent être routés qu'après validation de leur contrat backend.

---

## 8. Contrats backend consommés

### Authentification

| Méthode | Route | Usage |
|---|---|---|
| `POST` | `/auth/login` | Connexion, éventuel défi 2FA |
| `POST` | `/auth/2fa/verifier` | Validation du code TOTP |
| `POST` | `/auth/refresh` | Renouvellement des jetons |
| `GET` | `/auth/profil` | Profil, rôles, permissions |
| `POST` | `/auth/logout` | Révocation du refresh token |

### Pilotage

| Méthode | Route | Usage |
|---|---|---|
| `GET` | `/pilotage/tableau-de-bord` | Indicateurs et modules |
| `GET` | `/pilotage/modules` | Menu filtré par droits |

### Organisation

| Méthode | Route | Usage |
|---|---|---|
| `GET` | `/organisation/agents` | Liste paginée |
| `GET` | `/organisation/agents/:id` | Fiche agent |
| `GET` | `/organisation/agents/:id/historique` | Carrière |
| `PATCH` | `/organisation/agents/:id/mutation` | Mutation |
| `POST` | `/organisation/agents/:id/photo` | Téléversement photo |
| `GET` | `/organisation/agents/:id/photo` | Photo protégée |
| `POST` | `/organisation/agents/:id/signature/fichier` | Signature fichier |
| `PUT` | `/organisation/agents/:id/signature` | Signature tracée |
| `GET` | `/organisation/agents/:id/signature` | Signature protégée |
| `GET` | `/organisation/agents/export` | Export liste |
| `GET` | `/organisation/agents/:id/historique/export` | Export carrière |
| `GET` | `/organisation/trombinoscope` | Groupes par filiale |
| `GET` | `/organisation/trombinoscope/export` | Export annuaire |
| `GET` | `/organisation/organigramme` | Arbre |
| `GET` | `/organisation/organigramme/synthese` | Synthèse |
| `GET` | `/organisation/organigramme/export` | Export PDF/XLSX |
| `GET` | `/organisation/departements` | Référentiel |
| `GET` | `/organisation/services` | Référentiel |
| `GET` | `/filiales` | Référentiel filiales |

### Enveloppes

Les listes utilisent la même pagination :

```ts
interface PageApi<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
```

Les erreurs suivent le filtre NestJS :

```ts
interface CorpsErreurApi {
  success: false;
  code: string;
  message: string | string[];
  path: string;
  timestamp: string;
}
```

---

## 9. Environnement et exécution

```bash
npm install
cp .env.example .env.local
npm run dev
```

Le proxy Vite envoie `/api` vers `http://localhost:3000`.

```env
VITE_API_URL=/api/v1
VITE_NOM_APPLICATION="DAYO PulseInfra"
```

Côté backend, `npm run seed` fournit un jeu de données de démonstration.

### Vérifications

```bash
npm run build   # tsc -b && vite build
npm run lint    # ESLint
npm run format  # Prettier
```

Le build et le lint passent sur le socle actuel. Les parcours API réels restent à valider avec le backend démarré.

---

## 10. Migration et historique

- Les maquettes JavaScript/localStorage sont conservées sur `archive/maquettes-localstorage`.
- Le code livré ne contient plus de service de démonstration, de permissions locales ni de TOTP navigateur.
- Les anciens documents `PRESENTATION.md` et `RECAP.md` sont déplacés dans `docs/historique/`.
- Le cadrage complet est dans `docs/CADRAGE-DEV-LEAD-FRONT.txt`.
- Le plan d'intégration détaillé (`PLAN-INTEGRATION-FRONT.txt`) et l'archive `dayo-pulseinfra-front.zip` restent à récupérer pour les modules non livrés.

---

## 11. Points de vigilance

1. **Backend indisponible** : les écrans compilent, mais les parcours réels ne sont pas testés.
2. **Refresh token** : `localStorage` est un compromis documenté ; viser un cookie `httpOnly` avec CSRF.
3. **Filiale** : un compte groupe sans `X-Filiale-Id` ne peut pas être servi correctement.
4. **Exports** : toujours passer par le client Axios pour conserver l'authentification.
5. **Images** : révoquer les URL `blob:` pour éviter les fuites mémoire.
6. **Mutations** : invalider les clés TanStack Query plutôt que modifier le cache à la main.
7. **Permissions** : ne jamais considérer le menu ou le guard front comme une sécurité.
8. **Modules à créer** : ne pas les router avant d'avoir le contrat backend et le plan d'intégration.
