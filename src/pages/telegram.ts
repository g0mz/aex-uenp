// UC14: webhook do bot. O Telegram envia JSON com o cabeçalho secreto definido em setWebhook.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { codigoDoStart, enviarTelegram, textoBoasVindas } from '../lib/notificador';
import { vincularTelegram } from '../lib/repositorio';
import { senhaConfere } from '../lib/sessao';

export const prerender = false;

const ok = () => new Response('ok');

export const POST: APIRoute = async ({ request, url }) => {
  if (!(await senhaConfere(request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '', env.TELEGRAM_WEBHOOK_SEGREDO))) {
    return new Response('Proibido', { status: 403 });
  }
  try {
    const { message } = (await request.json()) as { message?: { text?: unknown; chat?: { id?: unknown } } };
    const texto = typeof message?.text === 'string' ? message.text.trim() : '';
    const chat = typeof message?.chat?.id === 'number' ? String(message.chat.id) : '';
    if (!chat) return ok();
    const responder = (t: string) => enviarTelegram(env.TELEGRAM_BOT_TOKEN, chat, t);

    if (texto === '/id') await responder(`Seu chat id é ${chat}.`);
    else if (chat === env.TELEGRAM_CHAT_PROPRIETARIO) return ok();
    else {
      const codigo = codigoDoStart(texto);
      if (!codigo) await responder(`Para receber avisos, use o botão "Receber atualizações no Telegram" na página de confirmação da solicitação. Site: ${url.origin}`);
      else {
        const s = await vincularTelegram(codigo, chat);
        await responder(s ? textoBoasVindas(s) : 'Não encontramos essa solicitação. Use o botão da página de confirmação.');
      }
    }
  } catch (e) {
    console.error('Falha no webhook do Telegram', e instanceof Error ? e.name : 'erro');
  }
  return ok();
};
