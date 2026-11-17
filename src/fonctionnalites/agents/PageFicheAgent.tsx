import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Image as ImageIcon, PenLine } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { messageLisible } from '@/shared/api/erreurs';
import { useAuth } from '@/shared/auth/useAuth';
import { Badge } from '@/shared/ui/Badge';
import { Bouton } from '@/shared/ui/Bouton';
import { EnTetePage } from '@/shared/ui/EnTetePage';
import { MessageErreur } from '@/shared/ui/Etats';
import { Squelette } from '@/shared/ui/Squelette';
import { formaterDate, formaterDateHeure } from '@/shared/utils/format';

import { apiAgents } from './api';
import { BoutonsExport } from '@/shared/ui/BoutonsExport';
import { FriseCarriere } from './FriseCarriere';
import { useAgent, useCarriere, useInvalidationAgent } from './hooks';
import { PaveSignature } from './PaveSignature';
import { PhotoAgent } from './PhotoAgent';
import { avecVersion, useImageProtegee } from './useImageProtegee';

/**
 * Fiche d un agent : identite, photo, signature, carriere.
 *
 * useParams rend l identifiant de l URL, typé string | undefined : TypeScript
 * oblige a traiter le cas ou il manque, ce qui evite un appel vers
 * /agents/undefined.
 */
export function PageFicheAgent() {
  const { id } = useParams<{ id: string }>();
  const { peut } = useAuth();

  const agent = useAgent(id);
  const carriere = useCarriere(id);
  const [signatureOuverte, setSignatureOuverte] = useState(false);

  if (agent.isLoading) {
    return (
      <div className="carte p-6" aria-busy="true">
        <Squelette lignes={6} />
      </div>
    );
  }
  if (agent.isError || !agent.data) return <MessageErreur erreur={agent.error} />;

  const fiche = agent.data;
  const peutModifier = peut('agent:update');

  return (
    <>
      <EnTetePage
        titre={`${fiche.prenom} ${fiche.nom}`}
        sousTitre={
          <span className="flex flex-wrap items-center gap-2">
            {fiche.matricule} &middot; {fiche.fonction ?? 'Fonction non precisee'}
            <Badge ton={fiche.actif ? 'vert' : 'gris'}>{fiche.actif ? 'Actif' : 'Sorti'}</Badge>
            {fiche.estGerant && <Badge ton="rouge">Gerant</Badge>}
            {!fiche.email && <Badge ton="gris">Sans email</Badge>}
          </span>
        }
        actions={
          <Link
            to="/agents"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-filet bg-white px-3 text-sm font-semibold text-dayo-bleu-fonce hover:bg-dayo-bleu-clair"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour a la liste
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        <section className="carte flex flex-wrap items-center gap-6 p-4">
          <PhotoAgent
            agentId={fiche.id}
            prenom={fiche.prenom}
            nom={fiche.nom}
            aPhoto={Boolean(fiche.photoFichier)}
            version={fiche.photoMajAt}
            taille={96}
          />

          <dl className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Donnee libelle="Departement" valeur={fiche.departement?.nom} />
            <Donnee libelle="Service" valeur={fiche.service?.nom} />
            <Donnee libelle="Email" valeur={fiche.email} />
            <Donnee libelle="Telephone" valeur={fiche.telephone} />
            <Donnee libelle="Date d embauche" valeur={formaterDate(fiche.dateEmbauche)} />
            <Donnee
              libelle="Compte de connexion"
              valeur={fiche.userId ? 'Oui' : 'Non (connexion impossible)'}
            />
          </dl>

          {peutModifier && <TeleverserPhoto agentId={fiche.id} majAt={fiche.photoMajAt} />}
        </section>

        <section className="carte flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Signature</h2>
            {peutModifier && (
              <Bouton
                variante="secondaire"
                taille="sm"
                onClick={() => setSignatureOuverte((ouverte) => !ouverte)}
                icone={<PenLine className="size-4" aria-hidden="true" />}
              >
                {signatureOuverte ? 'Fermer' : fiche.signatureFichier ? 'Remplacer' : 'Signer'}
              </Bouton>
            )}
          </div>

          {fiche.signatureFichier ? (
            <SignatureEnregistree agentId={fiche.id} majAt={fiche.signatureMajAt} />
          ) : (
            <p className="text-sm text-encre-douce">Aucune signature enregistree.</p>
          )}

          {signatureOuverte && (
            <PaveSignature agentId={fiche.id} surEnregistrement={() => setSignatureOuverte(false)} />
          )}
        </section>

        <section className="carte flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Carriere</h2>
              <p className="text-sm text-encre-douce">
                Historique des postes, du plus recent au plus ancien.
              </p>
            </div>
            <BoutonsExport
              formats={['xlsx', 'pdf']}
              onExport={(format) => apiAgents.exporterCarriere(fiche.id, format)}
            />
          </div>

          {carriere.isLoading && <Squelette lignes={4} />}
          {carriere.isError && <MessageErreur erreur={carriere.error} />}
          {carriere.data && <FriseCarriere affectations={carriere.data} />}
        </section>
      </div>
    </>
  );
}

function Donnee({ libelle, valeur }: { libelle: string; valeur?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-encre-douce">{libelle}</dt>
      <dd className="text-sm">{valeur || '-'}</dd>
    </div>
  );
}

function SignatureEnregistree({ agentId, majAt }: { agentId: string; majAt: string | null }) {
  // La date de mise a jour dans l adresse : remplacer la signature change
  // l adresse, donc l image affichee. Sans elle, l ancienne restait a l ecran.
  const { url, echec } = useImageProtegee(
    avecVersion(`/organisation/agents/${agentId}/signature`, majAt),
  );

  if (echec) return <p className="text-sm text-encre-douce">Signature illisible.</p>;
  if (!url) return <div className="h-20 w-60 animate-pulse rounded bg-filet/60" />;

  return (
    <figure className="m-0">
      <img
        src={url}
        alt="Signature de l agent"
        className="max-w-80 rounded border border-filet bg-white"
      />
      {majAt && (
        <figcaption className="text-xs text-encre-douce">
          Enregistree le {formaterDateHeure(majAt)}
        </figcaption>
      )}
    </figure>
  );
}

function TeleverserPhoto({ agentId, majAt }: { agentId: string; majAt: string | null }) {
  const champ = useRef<HTMLInputElement>(null);
  const invalider = useInvalidationAgent(agentId);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoi = useMutation({
    mutationFn: (fichier: File) => apiAgents.envoyerPhoto(agentId, fichier),
    onSuccess: () => invalider(),
  });

  async function surChoix(evenement: ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0];
    if (!fichier) return;

    setErreur(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(fichier.type)) {
      setErreur('Formats acceptes : JPEG, PNG ou WebP.');
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      setErreur('Photo trop lourde (2 Mio maximum).');
      return;
    }

    try {
      await envoi.mutateAsync(fichier);
    } catch (echec) {
      setErreur(messageLisible(echec));
    } finally {
      if (champ.current) champ.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={champ}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={surChoix}
        hidden
      />
      <Bouton
        variante="secondaire"
        taille="sm"
        chargement={envoi.isPending}
        onClick={() => champ.current?.click()}
        icone={<ImageIcon className="size-4" aria-hidden="true" />}
      >
        Changer la photo
      </Bouton>
      <span className="text-xs text-encre-douce">
        JPEG, PNG ou WebP, 2 Mio maximum.
        {majAt ? ` Mise a jour le ${formaterDateHeure(majAt)}.` : ''}
      </span>
      {erreur && <MessageErreur>{erreur}</MessageErreur>}
    </div>
  );
}
