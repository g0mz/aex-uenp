ALTER TABLE solicitacao ADD COLUMN telegram_codigo TEXT;
ALTER TABLE solicitacao ADD COLUMN telegram_chat_id TEXT;
CREATE UNIQUE INDEX idx_solicitacao_telegram_codigo ON solicitacao (telegram_codigo);
