// RN05: somente o proprietário autenticado acessa o painel. Também aplica os cabeçalhos de segurança do painel.
import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { COOKIE_SESSAO, sessaoValida } from './lib/sessao';

const CABECALHOS_PAINEL = {
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const caminho = context.url.pathname.replace(/\/+$/, '');
  if (caminho !== '/painel' && !caminho.startsWith('/painel/')) return next();

  const autenticado = caminho === '/painel/entrar'
    || (await sessaoValida(context.cookies.get(COOKIE_SESSAO)?.value, env.SESSAO_SEGREDO));
  const resposta = autenticado ? await next() : context.redirect('/painel/entrar');
  for (const [nome, valor] of Object.entries(CABECALHOS_PAINEL)) resposta.headers.set(nome, valor);
  return resposta;
});
