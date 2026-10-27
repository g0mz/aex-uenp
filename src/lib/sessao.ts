// Proprietario do diagrama de classes: a senha fica em segredo do servidor (RNF06), e a sessão é um cookie assinado.

export const COOKIE_SESSAO = 'sessao_painel';
export const DURACAO_SESSAO_S = 12 * 3600;
const texto = new TextEncoder();

async function hmac(segredo: string, mensagem: string): Promise<string> {
  const chave = await crypto.subtle.importKey('raw', texto.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', chave, texto.encode(mensagem));
  return [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compara resumos de mesmo tamanho, para o tempo não depender do conteúdo comparado.
async function iguais(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([a, b].map((v) => hmac('comparacao', v)));
  let diferenca = 0;
  for (let i = 0; i < x.length; i++) diferenca |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diferenca === 0;
}

export async function senhaConfere(digitada: string, correta: string): Promise<boolean> {
  return correta.length > 0 && (await iguais(digitada, correta));
}

export async function criarSessao(segredo: string, agoraMs = Date.now()): Promise<string> {
  const expira = String(agoraMs + DURACAO_SESSAO_S * 1000);
  return `${expira}.${await hmac(segredo, expira)}`;
}

export async function sessaoValida(valor: string | undefined, segredo: string, agoraMs = Date.now()): Promise<boolean> {
  const [expira, assinatura] = (valor ?? '').split('.');
  if (!segredo || !expira || !assinatura || !/^\d+$/.test(expira) || Number(expira) < agoraMs) return false;
  return iguais(assinatura, await hmac(segredo, expira));
}
