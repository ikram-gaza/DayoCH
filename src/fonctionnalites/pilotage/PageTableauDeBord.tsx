import { ArrowRight, Info, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/shared/auth/useAuth';
import { EnTetePage } from '@/shared/ui/EnTetePage';
import { MessageErreur } from '@/shared/ui/Etats';
import { Squelette } from '@/shared/ui/Squelette';
import { AnimationCarte } from '@/shared/ui/Transition';
import { cn } from '@/shared/utils/cn';

import { useTableauDeBord } from './hooks';
import type { Indicateur, PointAttention } from './types';

/**
 * Page d accueil.
 *
 * Un SEUL appel alimente toute la page. La tentation serait d en faire un par
 * compteur : six requetes paralleles au chargement, six etats a gerer, et un
 * ecran qui se remplit par a-coups.
 */
export function PageTableauDeBord() {
  const { utilisateur } = useAuth();

  const tableau = useTableauDeBord();

  const prenom = utilisateur?.nomComplet?.split(' ')[0] ?? '';

  return (
    <>
      <EnTetePage
        titre={`Bonjour ${prenom}`}
        sousTitre={tableau.data?.perimetre.libelle ?? 'Chargement du perimetre...'}
      />

      {tableau.isLoading && (
        <div className="carte p-6" aria-busy="true">
          <Squelette lignes={6} />
        </div>
      )}
      {tableau.isError && <MessageErreur erreur={tableau.error} />}

      {tableau.data && (
        <div className="flex flex-col gap-6">
          <section aria-label="Indicateurs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tableau.data.indicateurs.map((indicateur, index) => (
              <AnimationCarte key={indicateur.cle} index={index}>
                <Tuile indicateur={indicateur} />
              </AnimationCarte>
            ))}
          </section>

          {tableau.data.pointsAttention.length > 0 && (
            <section className="carte p-4" aria-label="Points d attention">
              <h2 className="mb-3 text-base font-bold">A traiter</h2>
              <ul className="flex flex-col gap-2">
                {tableau.data.pointsAttention.map((point) => (
                  <LignePoint key={point.message} point={point} />
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Modules">
            <h2 className="mb-3 text-base font-bold">Modules</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tableau.data.modules.map((module, index) => (
                <AnimationCarte key={module.cle} index={index}>
                  {module.disponible ? (
                    <Link
                      to={module.chemin}
                      className="carte flex h-full flex-col gap-1 border-l-4 border-l-dayo-bleu p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <span className="font-semibold">{module.libelle}</span>
                      <span className="text-sm text-encre-douce">{module.description}</span>
                    </Link>
                  ) : (
                    // Pas de lien : une tuile annoncee "a venir" est moins
                    // deroutante qu un lien qui tombe sur page introuvable.
                    <div
                      aria-disabled="true"
                      className="carte flex h-full flex-col gap-1 border-l-4 border-l-filet p-4 opacity-60"
                    >
                      <span className="font-semibold">
                        {module.libelle}{' '}
                        <span className="rounded-full bg-fond px-2 py-0.5 text-xs text-encre-douce">
                          A venir
                        </span>
                      </span>
                      <span className="text-sm text-encre-douce">{module.description}</span>
                    </div>
                  )}
                </AnimationCarte>
              ))}
            </div>
          </section>

          {tableau.data.effectifParFiliale.length > 1 && (
            <section className="carte p-4" aria-label="Effectif par filiale">
              <h2 className="mb-3 text-base font-bold">Effectif par filiale</h2>
              <div className="flex flex-col gap-3">
                {tableau.data.effectifParFiliale.map((ligne) => (
                  <BarreFiliale
                    key={ligne.code}
                    {...ligne}
                    maximum={Math.max(
                      ...tableau.data!.effectifParFiliale.map((f) => f.effectif),
                      1,
                    )}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function Tuile({ indicateur }: { indicateur: Indicateur }) {
  const estPourcentage = indicateur.cle === 'photos';

  return (
    <article className="carte flex flex-col gap-0.5 p-4">
      <span className="text-sm text-encre-douce">{indicateur.libelle}</span>
      <strong className="text-3xl leading-tight text-dayo-bleu-fonce">
        {indicateur.valeur}
        {estPourcentage ? ' %' : ''}
      </strong>
      {indicateur.precision && (
        <span className="text-xs text-encre-douce">{indicateur.precision}</span>
      )}
    </article>
  );
}

function LignePoint({ point }: { point: PointAttention }) {
  const Icone = point.niveau === 'alerte' ? TriangleAlert : Info;

  const contenu = (
    <>
      <Icone
        className={cn(
          'size-4 shrink-0',
          point.niveau === 'alerte' ? 'text-dayo-rouge' : 'text-dayo-bleu',
        )}
        aria-hidden="true"
      />
      <span className="text-sm">{point.message}</span>
      {point.chemin && <ArrowRight className="ml-auto size-4 text-encre-douce" aria-hidden="true" />}
    </>
  );

  return (
    <li>
      {point.chemin ? (
        <Link
          to={point.chemin}
          className="flex items-center gap-2 rounded-md bg-fond p-2 transition-colors hover:bg-dayo-bleu-clair"
        >
          {contenu}
        </Link>
      ) : (
        <span className="flex items-center gap-2 rounded-md bg-fond p-2">{contenu}</span>
      )}
    </li>
  );
}

/**
 * Barre proportionnelle en CSS pur. Installer une bibliotheque de graphiques
 * pour cinq barres pese plus lourd que toute la page.
 */
function BarreFiliale({
  code,
  nom,
  effectif,
  avecPhoto,
  maximum,
}: {
  code: string;
  nom: string;
  effectif: number;
  avecPhoto: number;
  maximum: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="min-w-40">
        <strong>{code}</strong> <span className="text-encre-douce">{nom}</span>
      </span>
      <div
        className="h-2.5 min-w-20 flex-1 overflow-hidden rounded-full bg-fond"
        role="img"
        aria-label={`${effectif} agents`}
      >
        <div
          className="h-full rounded-full bg-dayo-bleu transition-[width] duration-500"
          style={{ width: `${(effectif / maximum) * 100}%` }}
        />
      </div>
      <span className="min-w-36 text-xs text-encre-douce">
        {effectif} agent(s), {avecPhoto} photo(s)
      </span>
    </div>
  );
}
