import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/utils/cn';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'children'> {
  libelle: string;
  aide?: string;
  erreur?: string;
  /** Remplace l input par un select, une case a cocher, etc. */
  children?: ReactNode;
}

const STYLE_CONTROLE =
  'h-10 w-full rounded-md border border-filet bg-white px-3 text-sm text-encre placeholder:text-encre-douce/60';

/**
 * Champ de formulaire accessible.
 *
 * useId genere un identifiant stable qui relie <label> et controle. Point a
 * ne pas rater : quand le controle arrive en children (un <select>), il faut
 * lui TRANSMETTRE cet identifiant, sinon le label designe un element qui
 * n existe pas. Cliquer sur le libelle ne fait rien, et un lecteur d ecran
 * annonce un controle sans nom.
 */
export function Champ({ libelle, aide, erreur, children, className, ...reste }: Props) {
  const id = useId();
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;
  const decrivants = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ');

  const controle = (() => {
    if (!children) return null;

    const enfant = Children.only(children) as ReactElement<Record<string, unknown>>;
    if (!isValidElement(enfant)) return children;

    return cloneElement(enfant, {
      id: (enfant.props.id as string | undefined) ?? id,
      'aria-invalid': erreur ? true : undefined,
      'aria-describedby': decrivants || undefined,
      className: cn(STYLE_CONTROLE, enfant.props.className as string | undefined),
    });
  })();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-encre-douce">
        {libelle}
      </label>

      {controle ?? (
        <input
          id={id}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={decrivants || undefined}
          className={cn(STYLE_CONTROLE, erreur && 'border-dayo-rouge', className)}
          {...reste}
        />
      )}

      {aide && (
        <span id={idAide} className="text-xs text-encre-douce">
          {aide}
        </span>
      )}
      {erreur && (
        <span id={idErreur} role="alert" className="text-xs text-dayo-rouge">
          {erreur}
        </span>
      )}
    </div>
  );
}
