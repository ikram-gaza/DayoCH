import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { RouteProtegee } from '@/shared/auth/RouteProtegee';
import { Coquille } from './coquille/Coquille';

/**
 * Carte des adresses.
 *
 * React Router v7, API "data router" : les routes sont declarees en objet et
 * non en JSX. L interet n est pas esthetique, c est que le routeur connait
 * l arbre AVANT le rendu et peut donc precharger.
 *
 * Chaque page est chargee a la demande (`lazy`). Le code de l organigramme,
 * qui embarque la bibliotheque de graphes, n est pas telecharge par quelqu un
 * qui consulte la liste des agents.
 *
 * Ordre important : /agents/nouveau est declare AVANT /agents/:id, sinon
 * "nouveau" serait pris pour un identifiant.
 */
const router = createBrowserRouter([
  {
    path: '/connexion',
    lazy: async () => {
      const { PageConnexion } = await import('@/fonctionnalites/authentification/PageConnexion');
      return { Component: PageConnexion };
    },
  },
  {
    element: <RouteProtegee />,
    children: [
      {
        element: <Coquille />,
        children: [
          {
            path: '/tableau-de-bord',
            lazy: async () => {
              const { PageTableauDeBord } = await import(
                '@/fonctionnalites/pilotage/PageTableauDeBord'
              );
              return { Component: PageTableauDeBord };
            },
          },
          {
            path: '/trombinoscope',
            lazy: async () => {
              const { PageTrombinoscope } = await import(
                '@/fonctionnalites/trombinoscope/PageTrombinoscope'
              );
              return { Component: PageTrombinoscope };
            },
          },
          {
            path: '/agents',
            lazy: async () => {
              const { PageAgents } = await import('@/fonctionnalites/agents/PageAgents');
              return { Component: PageAgents };
            },
          },
          {
            path: '/agents/:id',
            lazy: async () => {
              const { PageFicheAgent } = await import('@/fonctionnalites/agents/PageFicheAgent');
              return { Component: PageFicheAgent };
            },
          },
          {
            path: '/organigramme',
            lazy: async () => {
              const { PageOrganigramme } = await import(
                '@/fonctionnalites/organigramme/PageOrganigramme'
              );
              return { Component: PageOrganigramme };
            },
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/tableau-de-bord" replace /> },
  {
    path: '*',
    element: (
      <main className="p-10">
        <h1 className="text-xl font-bold">Page introuvable</h1>
        <p className="text-sm text-encre-douce">L adresse demandee ne correspond a aucune page.</p>
      </main>
    ),
  },
]);

/**
 * Ce fichier n exporte QUE le composant : la table `router` reste privee.
 *
 * Exporter en plus une valeur non-composant suffit a priver le fichier du
 * rechargement a chaud — Vite ne sait alors plus remplacer le module seul et
 * recharge la page entiere, en perdant l etat en cours.
 */
export const Routeur = () => <RouterProvider router={router} />;
