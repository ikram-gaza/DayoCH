# Support de présentation — DayoPI (Front-end)

**Durée cible : 15–20 min** · Public : responsable backend · Format : slides + démo live

---

## Slide 1 — Titre
**DayoPI — PulseInfra**
Plateforme de gestion du Capital Humain · Volet Front-end · Présentation d'avancement
Nom · Date · Groupe Dayo

> Notes : rappeler le binôme front/back et l'objectif de la réunion : aligner sur l'existant et les points d'intégration API.

---

## Slide 2 — Objectif du projet
- Digitaliser la gestion RH du Groupe Dayo.
- Couvrir les 4 filiales (Bénin, Guinée, Burkina Faso, Côte d'Ivoire).
- 4 profils utilisateurs : employé, manager, gestionnaire stock, super admin.
- Une expérience moderne, cohérente avec la charte Dayo.

> Notes : insister sur le multi-filiale et la gestion fine des rôles.

---

## Slide 3 — Stack & architecture
- React 19 · Vite 8 · React Router 7 · Tailwind v4
- Motion, Lucide, ReactFlow, @dnd-kit, Axios (JWT)
- Architecture en couches : `pages` → `components` → `services` → API
- ~12 000 lignes · 15 pages · 20 composants · 5 services

> Notes : montrer que la couche services isole le mock de l'UI, ce qui facilite le branchement backend.

---

## Slide 4 — Design system
- Charte Dayo (`#007FE1` et déclinaisons), Lora/Inter
- Style premium : glassmorphism, dégradés, ombres, animations
- Composants réutilisables (Button, Input, modales, toasts)
- Responsive et états vides soignés

> Notes : la cohérence visuelle est un point fort à valoriser.

---

## Slide 5 — Authentification & sécurité
- Connexion email ou matricule + mot de passe
- Double authentification (OTP 6 chiffres)
- Session persistée + injection du token JWT
- Mode mock/démo activable par variable d'environnement

> Notes : transition naturelle vers le backend (endpoints auth déjà branchés).

---

## Slide 6 — Accès par rôle
- 4 rôles, menus et routes dédiés
- Guards de routes + redirections automatiques
- Vue adaptée à chaque métier (employé, manager, stock, admin)

> Notes : rappeler que les gardes sont finalisées (work en cours non commité à ce jour).

---

## Slide 7 — Modules RH livrés (1/2)
- **Dashboard** : KPIs, activité récente, actions rapides
- **Congés** : soldes, demandes, validation, planning, export CSV
- **Sollicitations RH** : 6 types, priorités, workflow, timeline
- **Profil** : infos, photo, mot de passe, 2FA, notifications

> Notes : c'est le cœur métier côté collaborateur.

---

## Slide 8 — Modules RH livrés (2/2)
- **Fournitures** : catalogue, commandes multi-articles, emprunts
- **Stock** : inventaire, réappro, alertes, export CSV
- **Traçabilité** : entrées / sorties / retours
- **Demandes stock** : workflow complet jusqu'à la livraison

> Notes : montrer que la livraison déstocke automatiquement et trace le mouvement.

---

## Slide 9 — Modules organisation
- **Organigramme** interactif (ReactFlow) + drag & drop + historique
- **Filiales** : 4 cartes, effectifs, implantation géographique
- **Mon Équipe** : KPIs, collaborateurs, congés et demandes
- **Utilisateurs** : CRUD, rôles, statuts, 2FA, reset mot de passe

> Notes : valoriser la gestion hiérarchique et l'administration.

---

## Slide 10 — État d'avancement
- **Commité** : auth, layout, UI, organigramme, filiales, profil, congés, fournitures
- **Finalisé non commité** : guards rôles, sollicitations, utilisateurs, mon équipe, auth avancée
- **Restant** : formations, évaluations, statistiques, paramètres

> Notes : être transparent sur ce qui est prêt vs en cours.

---

## Slide 11 — Intégration backend (le point clé)
- Seul `authService` appelle déjà l'API (toggle mock/API)
- Les autres services sont en `localStorage` et attendent les endpoints
- Endpoints proposés par domaine : auth, users, congés, articles/stock, supply-requests, sollicitations, filiales/orgchart
- Champs utilisateur requis : id, nom, prénom, email, matricule, rôle, filiale, poste, managerId, statut, 2FA, photo

> Notes : slide de travail commune — valider ensemble les contrats d'API et les formats de réponse.

---

## Slide 12 — Prochaines étapes
1. Brancher les services sur l'API réelle
2. Finaliser formations, évaluations, statistiques, paramètres
3. Notifications temps réel + recherche globale
4. Upload serveur, pagination, tests

> Notes : proposer un ordre de priorité et un planning de branchement.

---

## Slide 13 — Démo live
- Connexion par rôle : `super_admin`, `manager`, `employe`, `stock`, `2fa`
- Parcours : dashboard → demande de congé → validation manager
- Parcours : stock → demande fourniture → livraison → traçabilité

> Notes : prévoir un jeu de données de démo propre ; mots de passe ignorés en mock.

---

## Slide 14 — Conclusion / échanges
- Front-end fonctionnel et prêt à être branché
- Architecture pensée pour l'intégration API
- Questions / points de synchro avec le backend

> Notes : terminer sur les décisions à prendre ensemble (contrats API, priorités, planning).

---

## Astuces de présentation
- Annoncer le plan dès l'intro (2 min), garder la démo pour la fin.
- Mettre en avant la cohérence design et la couverture fonctionnelle.
- Sur l'intégration : présenter une slide de contrat d'API, pas du code.
- Garder 5 min de marge pour les questions.
