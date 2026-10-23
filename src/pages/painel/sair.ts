import type { APIRoute } from 'astro';
import { COOKIE_SESSAO } from '../../lib/sessao';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(COOKIE_SESSAO, { path: '/painel' });
  return redirect('/painel/entrar', 303);
};
