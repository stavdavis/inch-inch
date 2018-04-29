ALTER TABLE quote ADD COLUMN is_question_answer INT default -1;
ALTER TABLE quote ADD COLUMN same_first_word INT default -1;
ALTER TABLE quote ADD COLUMN first_word VARCHAR(30) default NULL;
