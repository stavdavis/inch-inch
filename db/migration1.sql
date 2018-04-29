CREATE TABLE IF NOT EXISTS template (
    id          serial,
    name        varchar(50),
    justify     varchar(100),
    pattern     varchar(20),
    css         varchar(1000)
);

CREATE TABLE IF NOT EXISTS keyword (
    id      serial,
    word    varchar(30)
);

CREATE TABLE IF NOT EXISTS template_keyword (
    id              serial,
    template_id     int,
    keyword_id      int
);
