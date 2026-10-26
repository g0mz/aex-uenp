// Classe Solicitacao do diagrama de classes: enumerações e regras de negócio (RN04, RF05, RN06).

export const TIPOS = { oficina: 'Na oficina', socorro: 'Socorro na rodovia' } as const;
export const PERFIS = {
  autonomo: 'Caminhoneiro autônomo',
  frota: 'Motorista de frota',
  empresa: 'Representante de empresa',
} as const;
export const SITUACOES = {
  nova: 'Nova',
  em_analise: 'Em análise',
  recusada: 'Recusada',
  socorro_a_caminho: 'Socorro a caminho',
  aguardando_caminhao: 'Aguardando caminhão',
  em_servico: 'Em serviço',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
} as const;

export type Tipo = keyof typeof TIPOS;
export type Perfil = keyof typeof PERFIS;
export type Situacao = keyof typeof SITUACOES;

export const LIMITES = {
  tipo: 10, perfil: 10, nome: 100, telefone: 20, empresa: 100, marca: 100, modelo: 100, placa: 10,
  servico: 100, descricao: 2000, rodovia: 100, km: 10, cidade: 100,
} as const;
export const LIMITE_ANOTACAO = 1000;

export type DadosSolicitacao = Record<keyof typeof LIMITES, string>;

const pertence = (lista: object, valor: string) => Object.hasOwn(lista, valor);

export function lerFormulario(form: FormData): DadosSolicitacao {
  return Object.fromEntries(
    Object.keys(LIMITES).map((c) => [c, String(form.get(c) ?? '').trim()]),
  ) as DadosSolicitacao;
}

// RN04: nome, telefone e descrição sempre; rodovia, km e cidade no socorro.
export function validar(d: DadosSolicitacao): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!pertence(TIPOS, d.tipo)) erros.tipo = 'Escolha o tipo de atendimento.';
  if (!pertence(PERFIS, d.perfil)) erros.perfil = 'Escolha o seu perfil.';
  if (!d.nome.trim()) erros.nome = 'Informe o seu nome.';
  if (!d.telefone.trim()) erros.telefone = 'Informe um telefone para contato.';
  if (!d.descricao.trim()) erros.descricao = 'Descreva o problema do caminhão.';
  if (d.tipo === 'socorro') {
    if (!d.rodovia.trim()) erros.rodovia = 'Informe a rodovia.';
    if (!d.km.trim()) erros.km = 'Informe o km.';
    if (!d.cidade.trim()) erros.cidade = 'Informe a cidade mais próxima.';
  }
  for (const [campo, limite] of Object.entries(LIMITES)) {
    if (d[campo as keyof DadosSolicitacao].length > limite) erros[campo] ??= `Use no máximo ${limite} caracteres.`;
  }
  return erros;
}

// RF05
export function gerarProtocolo(id: number, ano: number): string {
  return `GD-${ano}-${String(id).padStart(6, '0')}`;
}

// Tabela de situações: "Socorro a caminho" só vale para pedidos de socorro.
export function situacoesDoTipo(tipo: string): Situacao[] {
  const todas = Object.keys(SITUACOES) as Situacao[];
  return tipo === 'socorro' ? todas : todas.filter((s) => s !== 'socorro_a_caminho');
}

// RN06: a recusa só é aceita com motivo.
export function alterarSituacao(nova: string, motivo: string, observacao = '', tipo = 'socorro'): { erro?: string } {
  if (!pertence(SITUACOES, nova)) return { erro: 'Situação inválida.' };
  if (!situacoesDoTipo(tipo).includes(nova as Situacao)) return { erro: 'Esta situação não vale para pedidos na oficina.' };
  if (nova === 'recusada' && !motivo.trim()) return { erro: 'Informe o motivo da recusa.' };
  if (motivo.length > LIMITE_ANOTACAO || observacao.length > LIMITE_ANOTACAO) {
    return { erro: `Use no máximo ${LIMITE_ANOTACAO} caracteres no motivo e na observação.` };
  }
  return {};
}
