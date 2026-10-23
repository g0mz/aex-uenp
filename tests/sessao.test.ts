import { test } from 'node:test';
import assert from 'node:assert/strict';
import { senhaConfere, criarSessao, sessaoValida } from '../src/lib/sessao.ts';

test('compara a senha', async () => {
  assert.equal(await senhaConfere('gaucho2026', 'gaucho2026'), true);
  assert.equal(await senhaConfere('errada', 'gaucho2026'), false);
  assert.equal(await senhaConfere('', ''), false);
});

test('aceita a sessão assinada dentro do prazo', async () => {
  const valor = await criarSessao('segredo', 1_000);
  assert.equal(await sessaoValida(valor, 'segredo', 2_000), true);
});

test('recusa sessão vencida, adulterada, malformada ou com outro segredo', async () => {
  const valor = await criarSessao('segredo', 0);
  assert.equal(await sessaoValida(valor, 'segredo', 13 * 3600 * 1000), false);
  assert.equal(await sessaoValida(valor.replace(/^\d+/, '9999999999999'), 'segredo', 0), false);
  assert.equal(await sessaoValida(valor, 'outro', 0), false);
  assert.equal(await sessaoValida(undefined, 'segredo', 0), false);
  assert.equal(await sessaoValida('abc.def', 'segredo', 0), false);
  assert.equal(await sessaoValida(valor, '', 0), false);
});
