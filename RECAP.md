# Récapitulatif Projet DayoPI — Volet Front-end

> **Puls Infra** — Application web de gestion du Capital Humain du Groupe Dayo.
> Document de synthèse pour la présentation au responsable backend.

## 1. Contexte & stack technique

Application de gestion du **Capital Humain** du Groupe Dayo (courtage en assurances, 4 filiales : Bénin, Guinée, Burkina Faso, Côte d'Ivoire).

- **React 19** + **Vite 8** + **React Router 7**
- **Tailwind CSS v4** + design system custom
- **Motion** pour les animations, **Lucide React** pour les icônes
- **ReactFlow** pour l'organigramme interactif, **@dnd-kit** pour le drag & drop
- **Axios** avec intercepteur JWT
- ~**12 000 lignes** de front réparties sur **15 pages**, **20 composants** et **5 services**

## 2. Ce qui est déjà livré

### Authentification & sécurité
- Page de connexion premium (email ou matricule + mot de passe, affichage/masquage du mot de passe, gestion d'erreurs, loading).
- **2FA TOTP** compatible 2FAS (QR code, clé manuelle, vérification à 6 chiffres), obligatoire pour `super_admin` et `manager`.
- Session persistée (`localStorage`), contexte `AuthContext` (login / verify2FA / updateUser / logout).
- **Mode mock multi-rôles** activable/désactivable via `.env` (`VITE_USE_MOCK_AUTH`), avec bascule automatique vers la vraie API.
- Intercepteur Axios qui injecte le token JWT.

### Gestion des accès par rôle
- 4 rôles : `employe`, `manager`, `gestionnaire_stock`, `super_admin`.
- **Route guards** (`PrivateRoute`, `RoleRoute`) + menus latéraux et redirections adaptés à chaque rôle.
- Sidebar dynamique, avatar, filiale, badge de rôle, déconnexion.

### Tableau de bord
- Bandeau de bienvenue personnalisé (salutation selon l'heure, filiale, rôle).
- **KPIs animés** : jours de congé restants, demandes en cours, emprunts/ruptures, formations.
- Activité récente (congés + fournitures), actions rapides, compteurs animés.

### Module Congés & Absences
- 4 onglets : **Mes demandes**, **À valider**, **Calendrier d'équipe**, **Règles & droits**.
- Soldes CP / RTT / maladie / en attente.
- Création de demande : type, dates, demi-journées, motif, justificatif.
- Calcul automatique des **jours ouvrés** (week-ends exclus).
- Validation / refus avec motif, annulation, recherche, filtres, **export CSV**.
- Planning d'équipe et politique de congés.

### Module Fournitures (employé)
- Catalogue avec catégories, recherche, disponibilité du stock.
- Commande multi-articles, distinction **consommable** / **emprunt** (date de restitution).
- Suivi de mes demandes, annulation, KPIs.

### Module Stock (gestionnaire)
- Inventaire complet avec KPIs : références, ruptures, alertes, valeur totale.
- Filtres (filiale, catégorie, état), création/modification d'article, réapprovisionnement.
- **Export CSV** de l'inventaire.
- Déstockage automatique à la livraison + écriture en traçabilité.

### Traçabilité
- Historique des mouvements : **entrées (réassort)**, **sorties (livraison)**, **retours d'emprunt**.
- Stock avant/après, bénéficiaire, référence document, filtres et export CSV.

### Demandes de fournitures (gestionnaire)
- Workflow complet : `En attente → Approuvé → En préparation → Livré` ou `Refusé` avec motif.
- La livraison met à jour le stock et génère un mouvement automatiquement.

### Alertes stock
- Détection **rupture** et **seuil critique**, recherche, réapprovisionnement rapide.

### Module Sollicitations RH
- 6 types : attestation de travail, attestation de salaire, avance sur salaire, ordre de mission, formation, autre.
- Priorités (basse/normale/haute), statuts, création, détail avec **timeline d'historique**.
- Traitement manager/admin : prise en charge, approbation, clôture, refus motivé ; annulation par le demandeur.
- KPIs et filtres.

### Mon Profil
- Édition des informations, **upload photo**, changement de mot de passe avec indicateur de robustesse.
- Statut 2FA, préférences de notifications, infos de poste en lecture seule.

### Mon Équipe
- KPIs : effectif, actifs, en congé aujourd'hui, demandes en attente.
- Recherche/filtres, cartes collaborateurs avec statut congé, fiche détaillée (congés + sollicitations).

### Gestion des utilisateurs (super_admin)
- CRUD complet, attribution rôle/filiale/manager, activation/suspension.
- **Toggle 2FA**, réinitialisation de mot de passe, statistiques, recherche et filtres multi-critères.

### Organigramme & Filiales
- Organigramme interactif **ReactFlow** : zoom, recherche, filtre filiale.
- **Drag & drop** pour réorganiser la hiérarchie + **historique des changements**.
- Ajout/édition de collaborateur.
- Page Filiales : 4 cartes (ville, pays, date d'ouverture, effectif), bannière géographique, KPIs.

## 3. Design system

- Charte Dayo (`#007FE1` et déclinaisons), typographie Lora/Inter.
- Style premium inspiré Apple/Bailo : **glassmorphism**, dégradés, ombres multi-couches, animations fluides `motion`.
- Composants réutilisables : `Button`, `Input`, `ui.jsx`, `motion.jsx`.
- Modales dédiées par module, toasts, états vides, responsive en grilles.

## 4. Architecture front

```
src/
├── components/   (layout, ui, conges, fournitures, sollicitations, utilisateurs, equipe, organigramme)
├── pages/        (auth, dashboard, conges, fournitures, sollicitations, admin, equipe, profil)
├── services/     (auth, conges, fournitures, sollicitations, utilisateurs)
├── context/      (AuthContext)
└── config/       (filiales)
```

Couche `services/` isolée de l'UI : chaque module a ses constantes métier (types, statuts), sa logique et son stockage — prêt à remplacer le mock par l'API.

## 5. État d'avancement (git)

**Déjà commité :** initialisation, auth/2FA, layout + organigramme + filiales, refonte UI complète, module Profil, modules Congés & Fournitures complets.

**Finalisé mais pas encore commité :** guards par rôle, modules **Sollicitations**, **Utilisateurs**, **Mon Équipe**, améliorations auth (mock multi-rôles, session, 2FA) et services congés.

## 6. Intégration backend — points à brancher

> État actuel : seul `authService` appelle réellement l'API (via `VITE_USE_MOCK_AUTH`). Les autres services sont en **localStorage** et attendent les endpoints.

| Domaine | Endpoints à définir |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/verify-2fa`, `POST /auth/2fa/setup`, `POST /auth/2fa/enable`, `POST /auth/2fa/disable`, `POST /auth/logout`, `GET /auth/me` |
| Utilisateurs | `GET/POST /users`, `PUT/DELETE /users/:id`, `PATCH /users/:id/status`, `PATCH /users/:id/2fa`, `POST /users/:id/reset-password`, `GET /users/:id/team` |
| Congés | `GET/POST /conges`, `PATCH /conges/:id/validate`, `/refuse`, `/cancel`, `GET /conges/balances` |
| Articles / Stock | `GET/POST /articles`, `PUT /articles/:id`, `POST /articles/:id/restock`, `GET /stock/movements` |
| Demandes fournitures | `GET/POST /supply-requests`, `PATCH /supply-requests/:id/status` |
| Sollicitations | `GET/POST /solicitations`, `PATCH /solicitations/:id/status` |
| Filiales / Organigramme | `GET /filiales`, `GET/PATCH /orgchart` |

Champs backend nécessaires côté utilisateur : `id, nom, prenom, email, matricule, role, filiale, poste, managerId, statut, twoFactorEnabled, photo`.

## 7. Prochaines étapes

1. Brancher les 5 services sur l'API réelle (remplacer les mocks localStorage).
2. Finaliser les modules **Formations**, **Évaluations**, **Statistiques**, **Paramètres** (routes déjà réservées).
3. Notifications temps réel + recherche globale fonctionnelle.
4. Upload de fichiers côté serveur (aujourd'hui en base64), pagination, tests.

## 8. Scénario de démo (comptes mock)

Mots de passe ignorés en mode mock, l'identifiant détermine le rôle :

- `super_admin` → accès complet (utilisateurs, organigramme, filiales)
- `manager` → congés équipe, sollicitations, mon équipe
- `employe` → congés, fournitures, sollicitations
- `stock` → stock, traçabilité, demandes, alertes
- `2fa` → déclenche le parcours de double authentification
```
