/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NOM_APPLICATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
