// SolicitacaoRepositorio do diagrama de classes: consultas SQL no D1, sempre com parâmetros.
import { env } from 'cloudflare:workers';
import { gerarProtocolo, SITUACOES, TIPOS, type DadosSolicitacao, type Situacao } from './solicitacao';

type Opcionais = 'empresa' | 'marca' | 'modelo' | 'placa' | 'servico' | 'rodovia' | 'km' | 'cidade';

export type Registro = Omit<DadosSolicitacao, Opcionais> & Record<Opcionais, string | null> & {
  id: number;
  protocolo: string | null;
  situacao: Situacao;
  observacao: string | null;
  motivo_recusa: string | null;
  criada_em: string;
  atualizada_em: string;
};

const vazioParaNulo = (v: string) => (v.trim() ? v.trim() : null);

export async function inserir(d: DadosSolicitacao): Promise<string> {
  const agora = new Date().toISOString();
  const socorro = d.tipo === 'socorro';
  const linha = await env.DB.prepare(
    `INSERT INTO solicitacao (tipo, perfil, nome, telefone, empresa, marca, modelo, placa, servico, descricao, rodovia, km, cidade, criada_em, atualizada_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  ).bind(
    d.tipo, d.perfil, d.nome, d.telefone, vazioParaNulo(d.empresa), vazioParaNulo(d.marca), vazioParaNulo(d.modelo),
    vazioParaNulo(d.placa.toUpperCase()), vazioParaNulo(d.servico), d.descricao,
    socorro ? d.rodovia : null, socorro ? d.km : null, socorro ? d.cidade : null, agora, agora,
  ).first<{ id: number }>();
  if (!linha) throw new Error('Falha ao gravar a solicitação');
  const protocolo = gerarProtocolo(linha.id, new Date(agora).getUTCFullYear());
  await env.DB.prepare('UPDATE solicitacao SET protocolo = ? WHERE id = ?').bind(protocolo, linha.id).run();
  return protocolo;
}

export async function listar(filtro: { situacao?: string; tipo?: string }): Promise<Registro[]> {
  const condicoes: string[] = [];
  const valores: string[] = [];
  if (filtro.situacao && Object.hasOwn(SITUACOES, filtro.situacao)) { condicoes.push('situacao = ?'); valores.push(filtro.situacao); }
  if (filtro.tipo && Object.hasOwn(TIPOS, filtro.tipo)) { condicoes.push('tipo = ?'); valores.push(filtro.tipo); }
  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  // ponytail: sem paginação; acrescentar LIMIT/OFFSET quando a lista passar de algumas centenas
  const { results } = await env.DB.prepare(`SELECT * FROM solicitacao ${where} ORDER BY criada_em DESC`).bind(...valores).all<Registro>();
  return results;
}

export async function buscar(id: number): Promise<Registro | null> {
  return env.DB.prepare('SELECT * FROM solicitacao WHERE id = ?').bind(id).first<Registro>();
}

export async function atualizar(id: number, situacao: string, observacao: string, motivo: string): Promise<void> {
  await env.DB.prepare(
    'UPDATE solicitacao SET situacao = ?, observacao = ?, motivo_recusa = ?, atualizada_em = ? WHERE id = ?',
  ).bind(situacao, vazioParaNulo(observacao), situacao === 'recusada' ? motivo.trim() : null, new Date().toISOString(), id).run();
}

export async function excluir(id: number): Promise<void> {
  await env.DB.prepare('DELETE FROM solicitacao WHERE id = ?').bind(id).run();
}
