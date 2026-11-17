import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint "plate" (format introduit par ESLint 9, obligatoire
 * en 10) : un tableau d objets, et plus de .eslintrc. Les tutoriels anterieurs
 * donnent l ancien format, qui n est plus lu du tout.
 *
 * Les regles ajoutees ici ne sont pas decoratives : chacune correspond a une
 * erreur qui a reellement coute du temps sur ce projet.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Un composant exporte seul par fichier : c est ce qui permet au
      // rechargement a chaud de remplacer le composant sans perdre l etat.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // `any` desactive le compilateur a l endroit ou l on en a le plus
      // besoin : la frontiere avec le reseau.
      '@typescript-eslint/no-explicit-any': 'error',

      // Une variable inutilisee est presque toujours le reste d un bloc colle
      // puis a moitie modifie. Le prefixe _ sert a dire "volontairement
      // ignore".
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Une promesse non attendue echoue en silence : ni resultat, ni erreur
      // visible.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
