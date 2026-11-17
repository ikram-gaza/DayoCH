/*
 * La coquille (barre laterale, entete, zone de page) est l ASSEMBLAGE de
 * l application : elle vit dans app/, la seule couche autorisee a dependre
 * de plusieurs domaines (pilotage pour le menu, filiales pour le selecteur).
 * shared/ui, lui, ne connait aucun domaine.
 */
import {
  Boxes,
  ClipboardList,
  Contact,
  LayoutDashboard,
  LogOut,
  Network,
  ScrollText,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { NOM_APPLICATION } from '@/app/application';
import { useModules } from '@/fonctionnalites/pilotage/hooks';
import { useAuth } from '@/shared/auth/useAuth';
import { Bouton } from '@/shared/ui/Bouton';
import { Squelette } from '@/shared/ui/Squelette';
import { TransitionPage } from '@/shared/ui/Transition';
import { cn } from '@/shared/utils/cn';

import { SelecteurFiliale } from './SelecteurFiliale';

/**
 * Une icone par module. La table est ici, cote front : le backend decrit les
 * droits, pas l habillage. Melanger les deux obligerait a redeployer l API
 * pour changer un pictogramme.
 */
const ICONES: Record<string, LucideIcon> = {
  pilotage: LayoutDashboard,
  trombinoscope: Contact,
  organigramme: Network,
  agents: Users,
  organisation: ClipboardList,
  stocks: Boxes,
  comptes: Users,
  audit: ScrollText,
};

/**
 * Cadre commun des pages protegees.
 *
 * Le menu n est PAS ecrit en dur : il vient de /pilotage/modules, donc du
 * serveur, qui connait les roles et les permissions du compte. Un menu code
 * en dur se desynchronise des droits reels des la premiere evolution du
 * RBAC. Cela reste du confort d affichage : la protection est celle des
 * routes serveur.
 */
export function Coquille() {
  const { utilisateur, deconnecter } = useAuth();
  const emplacement = useLocation();

  const modules = useModules();

  return (
    <div className="grid min-h-screen grid-cols-[232px_1fr]">
      <aside className="flex flex-col gap-6 border-r border-filet bg-white p-4">
        <div>
          <p className="text-lg font-bold text-dayo-bleu">
            {NOM_APPLICATION}
          </p>
          <p className="text-xs text-encre-douce">Multi-filiales</p>
        </div>

        <SelecteurFiliale />

        <nav className="flex flex-col gap-1" aria-label="Navigation principale">
          {modules.isLoading && <Squelette lignes={5} />}

          {modules.data
            ?.filter((module) => module.disponible)
            .map((module) => {
              const Icone = ICONES[module.cle] ?? LayoutDashboard;
              return (
                // NavLink pose aria-current="page" sur le lien actif : le
                // style suit, et un lecteur d ecran l annonce.
                <NavLink
                  key={module.cle}
                  to={module.chemin}
                  title={module.description}
                  className={({ isActive }) => cn('lien-nav', isActive && 'lien-nav-actif')}
                >
                  <Icone className="size-4" aria-hidden="true" />
                  {module.libelle}
                </NavLink>
              );
            })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="text-sm">
            <p className="font-semibold">{utilisateur?.nomComplet}</p>
            <p className="text-xs text-encre-douce">{utilisateur?.roles.join(', ')}</p>
          </div>
          <Bouton
            variante="secondaire"
            taille="sm"
            onClick={() => void deconnecter()}
            icone={<LogOut className="size-4" aria-hidden="true" />}
          >
            Se deconnecter
          </Bouton>
        </div>
      </aside>

      <main className="min-w-0 p-6">
        {/* La cle force le remontage a chaque navigation : sans elle,
            l animation d entree ne rejouerait pas d une page a l autre. */}
        <TransitionPage key={emplacement.pathname}>
          <Outlet />
        </TransitionPage>
      </main>
    </div>
  );
}
