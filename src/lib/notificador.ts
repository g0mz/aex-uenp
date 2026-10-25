// Notificador do diagrama de classes (UC14, UC15): avisos pelo Telegram em texto simples, sem parse_mode.
// Nunca lança: uma falha no envio não pode impedir a gravação nem a alteração da solicitação (RN07).
import type { Registro } from './repositorio';
import { SITUACOES, TIPOS } from './solicitacao.ts';

const LIMITE_TRECHO = 300;
const situacaoTexto = (s: Pick<Registro, 'situacao'>) => SITUACOES[s.situacao] ?? s.situacao;

export function textoNovaSolicitacao(s: Registro, urlPainel: string): string {
  const trecho = s.descricao.length > LIMITE_TRECHO ? `${s.descricao.slice(0, LIMITE_TRECHO)}...` : s.descricao;
  return [
    `Nova solicitação ${s.protocolo}`,
    `Tipo: ${TIPOS[s.tipo as keyof typeof TIPOS] ?? s.tipo}`,
    `Nome: ${s.nome}`,
    `Telefone: ${s.telefone}`,
    s.tipo === 'socorro' ? `Local: ${s.rodovia}, km ${s.km}, ${s.cidade}` : '',
    `Descrição: ${trecho}`,
    `Detalhe: ${urlPainel}`,
  ].filter(Boolean).join('\n');
}

export function textoSituacao(s: Registro, urlAcompanhar: string): string {
  return [
    `Solicitação ${s.protocolo}`,
    `Nova situação: ${situacaoTexto(s)}`,
    s.situacao === 'recusada' && s.motivo_recusa ? `Motivo: ${s.motivo_recusa}` : '',
    `Acompanhe em: ${urlAcompanhar}`,
  ].filter(Boolean).join('\n');
}

export function textoBoasVindas(s: Registro): string {
  return `Avisos ativados para a solicitação ${s.protocolo}. Situação atual: ${situacaoTexto(s)}. Você receberá uma mensagem a cada mudança de situação.`;
}

// Extrai o código de "/start <codigo>" (32 hexadecimais); devolve null para qualquer outro texto.
export function codigoDoStart(texto: string): string | null {
  return /^\/start (?<codigo>[0-9a-f]{32})$/.exec(texto.trim())?.groups?.codigo ?? null;
}

export async function enviarTelegram(token: string, chatId: string, texto: string): Promise<void> {
  if (!token || !chatId) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: true }),
    });
    if (!r.ok) console.error(`Telegram respondeu ${r.status}`);
  } catch (e) {
    console.error('Falha ao enviar para o Telegram', e instanceof Error ? e.name : 'erro');
  }
}

export const avisarProprietario = (token: string, chatProprietario: string, s: Registro, urlPainel: string) =>
  enviarTelegram(token, chatProprietario, textoNovaSolicitacao(s, urlPainel));

export const avisarCliente = (token: string, s: Registro, urlAcompanhar: string) =>
  enviarTelegram(token, s.telegram_chat_id ?? '', textoSituacao(s, urlAcompanhar));
