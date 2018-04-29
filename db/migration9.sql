ALTER TABLE quote ADD COLUMN word_count INT default 0;
ALTER TABLE quote ADD COLUMN sentence_count INT default 0;
ALTER TABLE quote ADD COLUMN character_count INT default 0;
ALTER TABLE quote ADD COLUMN contains_exclamation INT default -1;
ALTER TABLE quote ADD COLUMN contains_question INT default -1;

CREATE TABLE IF NOT EXISTS template_category (
    id          serial,
    quote_id    int,
    category_id    int
);
