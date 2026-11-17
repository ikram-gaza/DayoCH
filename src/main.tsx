import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Providers } from './app/providers';
import { Routeur } from './app/router';
import './styles/index.css';

/**
 * Point d entree. Il fait trois choses et rien d autre : trouver l element
 * racine, verifier qu il existe, y monter l application.
 *
 * StrictMode ne s execute qu en developpement : il monte chaque composant
 * deux fois pour faire apparaitre les effets mal nettoyes. Un composant qui
 * se comporte mal en StrictMode se comportera mal en production, plus tard et
 * plus discretement.
 */
const racine = document.getElementById('root');

if (!racine) {
  throw new Error("L element #root est introuvable dans index.html.");
}

createRoot(racine).render(
  <StrictMode>
    <Providers>
      <Routeur />
    </Providers>
  </StrictMode>,
);
