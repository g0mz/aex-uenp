CREATE TABLE solicitacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('oficina', 'socorro')),
  perfil TEXT NOT NULL CHECK (perfil IN ('autonomo', 'frota', 'empresa')),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  empresa TEXT,
  marca TEXT,
  modelo TEXT,
  placa TEXT,
  servico TEXT,
  descricao TEXT NOT NULL,
  rodovia TEXT,
  km TEXT,
  cidade TEXT,
  situacao TEXT NOT NULL DEFAULT 'nova' CHECK (situacao IN ('nova', 'em_analise', 'recusada', 'socorro_a_caminho', 'aguardando_caminhao', 'em_servico', 'concluida', 'cancelada')),
  observacao TEXT,
  motivo_recusa TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  CHECK (tipo = 'oficina' OR (rodovia IS NOT NULL AND km IS NOT NULL AND cidade IS NOT NULL)),
  CHECK (situacao <> 'recusada' OR motivo_recusa IS NOT NULL)
);

CREATE INDEX idx_solicitacao_criada_em ON solicitacao (criada_em DESC);
