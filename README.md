# DayoPI

**PulseInfra** — Application web de gestion du Capital Humain pour le Groupe Dayo.

## Stack Technique

- **React 19.3.1** - Framework UI
- **Vite 8.3.5** - Build tool
- **Tailwind CSS v4.3.4** - Framework CSS
- **React Router v7** - Routing
- **TanStack Query v5** - Cache et états des requêtes serveur
- **ReactFlow** - Organigramme interactif
- **Lucide React** - Icônes
- **Axios** - HTTP client
- **qrcode.react** - QR code de configuration 2FA

## Design System

Design premium inspiré d'Apple avec :
- Glassmorphism & backdrop-blur
- Ombres multi-layered
- Animations fluides
- Typographie SF Pro Display / Inter
- Couleurs officielles Groupe Dayo

## Filiales

- 🇧🇯 Dayo Bénin (BEN)
- 🇬🇳 Dayo Guinée (GIN)
- 🇧🇫 Dayo Burkina Faso (BFA)
- 🇨🇮 Dayo Côte d'Ivoire (CIV)

## Développement

```bash
# Installation des dépendances
npm install

# Serveur de développement
npm run dev

# Build production
npm run build

# Lint
npm run lint
```

## Documentation

- [Arborescence et flux de l'application](./ARBORESCENCE_ET_FLUX.md) - vue d'ensemble pour comprendre l'organisation du code et les parcours utilisateurs.
- [Version PDF](./ARBORESCENCE_ET_FLUX.pdf) - document mis en page pour diffusion.

## Modules

1. **Dashboard** - Vue d'ensemble
2. **Agents** - Liste, fiche, carrière, photo, signature et mutations
3. **Trombinoscope** - Annuaire illustré groupé par filiale
4. **Pilotage** - Indicateurs RH et points d'attention
5. **Organigramme** - Hiérarchie interactive, vue par filiale et vue groupe
6. **Congés** - Gestion des absences
7. **Fournitures** - Gestion du stock
8. **Sollicitations** - Demandes diverses
9. **Administration** - Filiales, utilisateurs et configuration

Modules à venir : Statistiques, Évaluations, Formations et Paramètres.

## Authentification

- Connexion avec email/matricule et mot de passe
- 2FA TOTP (2FAS / Google Authenticator)
- 4 rôles : employe, manager, gestionnaire_stock, super_admin
- Mode démo disponible via `VITE_USE_MOCK_AUTH` et `VITE_USE_MOCK_DATA`

