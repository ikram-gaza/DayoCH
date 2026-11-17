import { LogIn, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { messageLisible } from '@/shared/api/erreurs';
import { estDefiDeuxFacteurs } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';
import { Bouton } from '@/shared/ui/Bouton';
import { Champ } from '@/shared/ui/Champ';
import { MessageErreur } from '@/shared/ui/Etats';
import { NOM_APPLICATION } from '@/app/application';

/**
 * Connexion, en deux temps : identifiants, puis code a six chiffres si le
 * compte a la double authentification.
 *
 * L etat local suffit : rien de ce qui est tape ici n a de raison de vivre
 * ailleurs que dans cette page.
 */
export function PageConnexion() {
  const { utilisateur, connecter, terminerConnexion2fa } = useAuth();
  const naviguer = useNavigate();
  const emplacement = useLocation();

  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [code, setCode] = useState('');
  const [defi, setDefi] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  if (utilisateur) return <Navigate to="/tableau-de-bord" replace />;

  const destination = (emplacement.state as { depuis?: string } | null)?.depuis ?? '/tableau-de-bord';

  async function soumettre(evenement: FormEvent) {
    // Sans ceci, le navigateur recharge la page et React perd tout son etat.
    evenement.preventDefault();
    setErreur(null);
    setEnvoi(true);

    try {
      if (defi) {
        await terminerConnexion2fa(defi, code);
      } else {
        const resultat = await connecter(identifiant.trim(), motDePasse);
        if (estDefiDeuxFacteurs(resultat)) {
          setDefi(resultat.challengeToken);
          return; // on attend le code, on ne navigue pas encore
        }
      }
      naviguer(destination, { replace: true });
    } catch (echec) {
      setErreur(messageLisible(echec));
    } finally {
      // Le bouton se reactive meme en cas d echec : sinon l utilisateur reste
      // devant un formulaire bloque.
      setEnvoi(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-fond p-6">
      <form onSubmit={soumettre} noValidate className="carte flex w-full max-w-md flex-col gap-4 p-6">
        <div>
          <p className="font-bold text-dayo-bleu">
            {NOM_APPLICATION}
          </p>
          <h1 className="text-xl font-bold">{defi ? 'Verification' : 'Connexion'}</h1>
        </div>

        {erreur && <MessageErreur>{erreur}</MessageErreur>}

        {defi ? (
          <Champ
            libelle="Code de verification"
            aide="Les six chiffres affiches par Google Authenticator."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
          />
        ) : (
          <>
            <Champ
              libelle="Matricule ou email"
              aide="Les agents sans adresse email se connectent avec leur matricule."
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
            <Champ
              libelle="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              required
            />
          </>
        )}

        <Bouton
          type="submit"
          chargement={envoi}
          icone={
            defi ? (
              <ShieldCheck className="size-4" aria-hidden="true" />
            ) : (
              <LogIn className="size-4" aria-hidden="true" />
            )
          }
        >
          {defi ? 'Valider le code' : 'Se connecter'}
        </Bouton>
      </form>
    </main>
  );
}
