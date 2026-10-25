/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'cloudflare:workers' {
  export const env: {
    DB: import('@cloudflare/workers-types').D1Database;
    PAINEL_SENHA: string;
    SESSAO_SEGREDO: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_BOT_USUARIO: string;
    TELEGRAM_CHAT_PROPRIETARIO: string;
    TELEGRAM_WEBHOOK_SEGREDO: string;
  };
}
