CREATE TABLE IF NOT EXISTS batch (
    id          serial,
    alias       varchar(50),
    created_at  timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_quote (
    id          serial,
    quote_id    int,
    batch_id    int
);

ALTER TABLE quote ADD COLUMN created_at TIMESTAMP DEFAULT now();
