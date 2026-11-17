import { Eraser, Save, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react';

import { messageLisible } from '@/shared/api/erreurs';
import { Bouton } from '@/shared/ui/Bouton';
import { MessageErreur } from '@/shared/ui/Etats';

import { apiAgents } from './api';
import { useInvalidationAgent, useSignatureTracee } from './hooks';

const LARGEUR = 480;
const HAUTEUR = 180;
const TAILLE_MAX_OCTETS = 1024 * 1024;
const TYPES_ACCEPTES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Signature : tracee a la main OU chargee depuis une image deja numerisee.
 *
 * Les deux voies existent parce que tracer a la souris donne un resultat
 * mediocre pour beaucoup de gens, et que certaines signatures existent deja
 * sur papier. Elles aboutissent au meme fichier cote serveur.
 *
 * Trois points techniques font la difference entre un trace propre et un
 * trace qui bave :
 *  1. les evenements "pointer" couvrent souris, stylet et doigt d un seul jeu
 *     d evenements — ecrire trois fois la meme logique est inutile ;
 *  2. le canvas a deux tailles, celle du CSS et celle en pixels : sur un
 *     ecran haute densite il faut multiplier la seconde par devicePixelRatio,
 *     sinon le trait est flou ;
 *  3. setPointerCapture garde le trace actif quand le doigt sort du cadre.
 */
export function PaveSignature({
  agentId,
  surEnregistrement,
}: {
  agentId: string;
  surEnregistrement?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const champFichier = useRef<HTMLInputElement>(null);
  const traceEnCours = useRef(false);

  const [vide, setVide] = useState(true);
  const [envoiFichier, setEnvoiFichier] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const mutation = useSignatureTracee(agentId);
  const invalider = useInvalidationAgent(agentId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const densite = window.devicePixelRatio || 1;
    canvas.width = LARGEUR * densite;
    canvas.height = HAUTEUR * densite;

    const contexte = canvas.getContext('2d');
    if (!contexte) return;

    contexte.scale(densite, densite);
    contexte.lineWidth = 2.5;
    contexte.lineCap = 'round';
    contexte.lineJoin = 'round';
    contexte.strokeStyle = '#1f2933';
  }, []);

  const position = (evenement: PointerEvent<HTMLCanvasElement>) => {
    const rectangle = evenement.currentTarget.getBoundingClientRect();
    // Coordonnees ecran ramenees dans le repere du canvas, en tenant compte
    // d un eventuel redimensionnement CSS.
    return {
      x: ((evenement.clientX - rectangle.left) / rectangle.width) * LARGEUR,
      y: ((evenement.clientY - rectangle.top) / rectangle.height) * HAUTEUR,
    };
  };

  const commencer = (evenement: PointerEvent<HTMLCanvasElement>) => {
    const contexte = canvasRef.current?.getContext('2d');
    if (!contexte) return;

    evenement.currentTarget.setPointerCapture(evenement.pointerId);
    const { x, y } = position(evenement);

    contexte.beginPath();
    contexte.moveTo(x, y);
    traceEnCours.current = true;
    setVide(false);
  };

  const tracer = (evenement: PointerEvent<HTMLCanvasElement>) => {
    if (!traceEnCours.current) return;
    const contexte = canvasRef.current?.getContext('2d');
    if (!contexte) return;

    const { x, y } = position(evenement);
    contexte.lineTo(x, y);
    contexte.stroke();
  };

  const effacer = useCallback(() => {
    const canvas = canvasRef.current;
    const contexte = canvas?.getContext('2d');
    if (!canvas || !contexte) return;

    contexte.clearRect(0, 0, canvas.width, canvas.height);
    setVide(true);
  }, []);

  async function enregistrerTrace() {
    const canvas = canvasRef.current;
    if (!canvas || vide) return;

    setErreur(null);
    try {
      // PNG : il conserve la transparence, ce qui permettra de poser la
      // signature sur un document sans rectangle blanc autour.
      await mutation.mutateAsync(canvas.toDataURL('image/png'));
      surEnregistrement?.();
    } catch (echec) {
      setErreur(messageLisible(echec));
    }
  }

  async function chargerImage(evenement: ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0];
    if (!fichier) return;

    setErreur(null);

    // Verification cote client AUSSI : non par confiance — un utilisateur
    // peut contourner tout ce qui tourne dans son navigateur — mais pour
    // eviter d envoyer un fichier trop lourd avant d apprendre qu il est
    // refuse. Le controle qui compte reste celui du serveur, qui reconnait
    // le type sur les premiers octets et non sur l extension.
    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur('Formats acceptes : PNG, JPEG ou WebP.');
      return;
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      setErreur(`Image trop lourde (${Math.round(fichier.size / 1024)} Kio pour 1024 Kio maximum).`);
      return;
    }

    setEnvoiFichier(true);
    try {
      await apiAgents.envoyerSignatureFichier(agentId, fichier);
      await invalider();
      surEnregistrement?.();
    } catch (echec) {
      setErreur(messageLisible(echec));
    } finally {
      setEnvoiFichier(false);
      // Remettre le champ a zero permet de reselectionner LE MEME fichier
      // apres une correction : sinon l evenement change ne part pas.
      if (champFichier.current) champFichier.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-encre-douce">
        Tracez la signature ci-dessous, ou chargez une image deja numerisee.
      </p>

      <canvas
        ref={canvasRef}
        style={{ width: LARGEUR, height: HAUTEUR }}
        // touch-action-none : sans cette regle, le doigt fait defiler la page
        // au lieu de dessiner. Une ligne, et le pave devient utilisable sur
        // telephone.
        className="max-w-full cursor-crosshair touch-none rounded-[--radius-carte] border-2 border-dashed border-filet bg-white"
        onPointerDown={commencer}
        onPointerMove={tracer}
        onPointerUp={() => {
          traceEnCours.current = false;
        }}
        onPointerLeave={() => {
          traceEnCours.current = false;
        }}
        role="img"
        aria-label="Zone de signature : tracez avec la souris ou le doigt"
      />

      <div className="flex flex-wrap gap-2">
        <Bouton
          variante="secondaire"
          taille="sm"
          onClick={effacer}
          disabled={vide}
          icone={<Eraser className="size-4" aria-hidden="true" />}
        >
          Effacer
        </Bouton>

        <Bouton
          taille="sm"
          onClick={() => void enregistrerTrace()}
          disabled={vide}
          chargement={mutation.isPending}
          icone={<Save className="size-4" aria-hidden="true" />}
        >
          Enregistrer le trace
        </Bouton>

        <input
          ref={champFichier}
          type="file"
          accept={TYPES_ACCEPTES.join(',')}
          onChange={chargerImage}
          hidden
        />
        <Bouton
          variante="secondaire"
          taille="sm"
          chargement={envoiFichier}
          onClick={() => champFichier.current?.click()}
          icone={<Upload className="size-4" aria-hidden="true" />}
        >
          Charger une image
        </Bouton>
      </div>

      {erreur && <MessageErreur>{erreur}</MessageErreur>}
    </div>
  );
}
