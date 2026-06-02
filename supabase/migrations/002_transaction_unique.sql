ALTER TABLE transactions
ADD CONSTRAINT transactions_unique_entry
UNIQUE (account_id, date, merchant, amount);
