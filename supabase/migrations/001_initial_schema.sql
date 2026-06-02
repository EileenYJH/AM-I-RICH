CREATE TABLE accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  institution TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('bank', 'ewallet', 'savings')),
  color       TEXT NOT NULL,
  balance     NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  merchant    TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  date        DATE NOT NULL,
  source      TEXT NOT NULL CHECK (source IN ('screenshot', 'manual')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);

CREATE TABLE fixed_deposits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution      TEXT NOT NULL,
  principal        NUMERIC(12,2) NOT NULL,
  interest_rate    NUMERIC(5,2) NOT NULL,
  placement_date   DATE NOT NULL,
  maturity_date    DATE NOT NULL,
  interest_amount  NUMERIC(12,2) NOT NULL,
  total_at_maturity NUMERIC(12,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matured')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ingest_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status      TEXT NOT NULL CHECK (status IN ('success', 'parse_failed', 'unrecognised')),
  account_id  UUID REFERENCES accounts(id),
  raw_text    TEXT NOT NULL
);

INSERT INTO accounts (name, institution, type, color) VALUES
  ('MAE',        'Maybank',     'bank',    '#F0A800'),
  ('Savings',    'CIMB',        'bank',    '#D4002B'),
  ('Savings',    'Public Bank', 'bank',    '#0040A8'),
  ('eWallet',    'Touch n Go',  'ewallet', '#0088E8'),
  ('eWallet',    'GrabPay',     'ewallet', '#00B352'),
  ('eWallet',    'Boost',       'ewallet', '#FF5030'),
  ('Unit Trust', 'ASNB',        'savings', '#006B3E');
