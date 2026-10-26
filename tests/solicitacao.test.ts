import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, gerarProtocolo, alterarSituacao, situacoesDoTipo, lerFormulario, type DadosSolicitacao } from '../src/lib/solicitacao.ts';

const base: DadosSolicitacao = {
  tipo: 'oficina', perfil: 'autonomo', nome: 'João', telefone: '14999990000', empresa: '',
  marca: 'Scania', modelo: 'R450', placa: 'ABC1D23', servico: 'Embreagem', descricao: 'Embreagem patinando',
  rodovia: '', km: '', cidade: '',
};

test('RN04: oficina com nome, telefone e descrição é válida', () => {
  assert.deepEqual(validar(base), {});
});

test('RN04: exige nome, telefone e descrição', () => {
  const erros = validar({ ...base, nome: ' ', telefone: '', descricao: '' });
  assert.deepEqual(Object.keys(erros).sort(), ['descricao', 'nome', 'telefone']);
});

test('RN04: socorro exige rodovia, km e cidade', () => {
  const erros = validar({ ...base, tipo: 'socorro' });
  assert.deepEqual(Object.keys(erros).sort(), ['cidade', 'km', 'rodovia']);
  assert.deepEqual(validar({ ...base, tipo: 'socorro', rodovia: 'SP-270', km: '377', cidade: 'Ourinhos' }), {});
});

test('rejeita tipo e perfil fora da lista', () => {
  const erros = validar({ ...base, tipo: 'x', perfil: 'toString' });
  assert.ok(erros.tipo && erros.perfil);
});

test('rejeita campo acima do tamanho máximo', () => {
  assert.ok(validar({ ...base, descricao: 'a'.repeat(2001) }).descricao);
  assert.ok(validar({ ...base, nome: 'a'.repeat(101) }).nome);
  assert.deepEqual(validar({ ...base, descricao: 'a'.repeat(2000) }), {});
});

test('lerFormulario ignora campos extras e apara espaços', () => {
  const form = new FormData();
  form.set('nome', '  Ana  ');
  form.set('situacao', 'concluida');
  const d = lerFormulario(form);
  assert.equal(d.nome, 'Ana');
  assert.equal('situacao' in d, false);
});

test('RF05: protocolo com ano e id de seis dígitos', () => {
  assert.equal(gerarProtocolo(123, 2026), 'GD-2026-000123');
});

test('RN06: recusa exige motivo', () => {
  assert.ok(alterarSituacao('recusada', '  ').erro);
  assert.deepEqual(alterarSituacao('recusada', 'Fora do escopo'), {});
  assert.deepEqual(alterarSituacao('em_analise', ''), {});
  assert.ok(alterarSituacao('inexistente', '').erro);
  assert.ok(alterarSituacao('constructor', '').erro);
  assert.ok(alterarSituacao('em_analise', '', 'a'.repeat(1001)).erro);
});

test('Socorro a caminho só vale para pedidos de socorro', () => {
  assert.ok(alterarSituacao('socorro_a_caminho', '', '', 'oficina').erro);
  assert.deepEqual(alterarSituacao('socorro_a_caminho', '', '', 'socorro'), {});
  assert.deepEqual(situacoesDoTipo('oficina').includes('socorro_a_caminho'), false);
  assert.equal(situacoesDoTipo('socorro').length, 8);
});
