import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Squelette } from '@/shared/ui/Squelette';

import { useAuth } from './useAuth';

interface Props {
  /** Permission exigee ; absente, la seule connexion suffit. */
  permission?: string;
}

/**
 * Garde de navigation.
 *
 * A retenir : ceci protege l AFFICHAGE, pas les donnees. Un utilisateur peut
 * modifier le JavaScript de la page et faire apparaitre n importe quel ecran.
 * La seule protection reelle est celle du backend ; ce composant sert au
 * confort, en evitant d ouvrir une page qui renverrait 403.
 */
export function RouteProtegee({ permission }: Props) {
  const { utilisateur, chargement, peut } = useAuth();
  const emplacement = useLocation();

  if (chargement) {
    return (
      <div className="p-6" aria-busy="true">
        <Squelette lignes={4} />
      </div>
    );
  }

  if (!utilisateur) {
    // `state` garde la page demandee : apres connexion, on y revient.
    return <Navigate to="/connexion" replace state={{ depuis: emplacement.pathname }} />;
  }

  if (permission && !peut(permission)) {
    return (
      <div className="p-6">
        <div className="carte border-dayo-rouge bg-red-50 p-4 text-sm" role="alert">
          <strong>Acces refuse.</strong> Cette page demande la permission{' '}
          <code className="font-mono">{permission}</code>.
        </div>
      </div>
    );
  }

  return <Outlet />;
}
