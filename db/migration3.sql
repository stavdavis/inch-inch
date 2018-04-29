CREATE TABLE IF NOT EXISTS quote (
    id          serial,
    text        varchar(1000),
    author_id   int 
);

CREATE TABLE IF NOT EXISTS quote_keyword (
    id          serial,
    quote_id    int,
    keyword_id  int
);

CREATE TABLE IF NOT EXISTS author (
    id              serial,
    name            varchar(1000),
    search_letter   varchar(1)
);

CREATE TYPE keyword_type AS ENUM ('basic', 'topic');

ALTER TABLE keyword ADD COLUMN type keyword_type DEFAULT 'basic';
