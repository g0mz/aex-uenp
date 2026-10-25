import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textoNovaSolicitacao, textoSituacao, textoBoasVindas, codigoDoStart, enviarTelegram } from '../src/lib/notificador.ts';

const base = {
  id: 1, protocolo: 'GD-2026-000001', tipo: 'oficina', perfil: 'autonomo', nome: 'Joana', telefone: '14 99999-0000',
  empresa: null, marca: null, modelo: null, placa: null, servico: null, descricao: 'Barulho no motor',
  rodovia: null, km: null, cidade: null, situacao: 'nova', observacao: null, motivo_recusa: null,
  criada_em: '', atualizada_em: '', telegram_codigo: null, telegram_chat_id: null,
} as any;

test('aviso de pedido novo traz os dados e o link', () => {
  const t = textoNovaSolicitacao(base, 'https://x.com/painel/1');
  for (const p of ['GD-2026-000001', 'Na oficina', 'Joana', '14 99999-0000', 'Barulho no motor', 'https://x.com/painel/1']) assert.ok(t.includes(p), p);
  assert.ok(!t.includes('Local'));
});

test('socorro mostra o local e a descrição longa é truncada', () => {
  const t = textoNovaSolicitacao({ ...base, tipo: 'socorro', rodovia: 'SP-270', km: '12', cidade: 'Ourinhos', descricao: 'a'.repeat(500) }, 'u');
  assert.ok(t.includes('SP-270, km 12, Ourinhos'));
  assert.ok(t.includes('a'.repeat(300) + '...') && !t.includes('a'.repeat(301)));
});

test('aviso de situação inclui o motivo só na recusa', () => {
  const r = textoSituacao({ ...base, situacao: 'recusada', motivo_recusa: 'Fora do escopo' }, 'https://x.com/acompanhar');
  assert.ok(r.includes('GD-2026-000001') && r.includes('Recusada') && r.includes('Fora do escopo'));
  assert.ok(!textoSituacao({ ...base, situacao: 'em_analise', motivo_recusa: 'x' }, 'u').includes('Motivo'));
  assert.ok(textoBoasVindas(base).includes('GD-2026-000001') && textoBoasVindas(base).includes('Nova'));
});

test('codigoDoStart aceita só 32 hexadecimais', () => {
  const c = 'ab12'.repeat(8);
  assert.equal(codigoDoStart(`/start ${c}`), c);
  for (const t of ['/start', '/start abc', `/start ${c}0`, `/start ${c.toUpperCase()}`, `oi ${c}`, '']) assert.equal(codigoDoStart(t), null);
});

test('enviarTelegram monta a requisição e nunca lança', async () => {
  const original = globalThis.fetch;
  try {
    let chamada: any;
    globalThis.fetch = (async (url: string, init: any) => { chamada = { url, init }; return new Response('{}'); }) as any;
    await enviarTelegram('TOK', '42', 'oi');
    assert.equal(chamada.url, 'https://api.telegram.org/botTOK/sendMessage');
    assert.deepEqual(JSON.parse(chamada.init.body), { chat_id: '42', text: 'oi', disable_web_page_preview: true });
    assert.equal(chamada.init.method, 'POST');
    globalThis.fetch = (async () => { throw new Error('rede'); }) as any;
    await enviarTelegram('TOK', '42', 'oi');
    chamada = undefined;
    globalThis.fetch = (async () => { chamada = true; return new Response(); }) as any;
    await enviarTelegram('', '42', 'oi');
    assert.equal(chamada, undefined);
  } finally { globalThis.fetch = original; }
});
