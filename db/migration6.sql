ALTER TABLE template ADD COLUMN padding_left real DEFAULT 0;
ALTER TABLE template ADD COLUMN padding_right int DEFAULT 0;
ALTER TABLE template ADD COLUMN padding_top int DEFAULT 0;
ALTER TABLE template ADD COLUMN padding_bottom int DEFAULT 0;

ALTER TABLE template DROP COLUMN padding_vertical;
ALTER TABLE template DROP COLUMN padding_horizontal;
