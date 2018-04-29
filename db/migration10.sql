ALTER TABLE template ADD COLUMN filters VARCHAR(200) default '{}';
ALTER TABLE quote ADD COLUMN parsey VARCHAR(1000) default NULL;
