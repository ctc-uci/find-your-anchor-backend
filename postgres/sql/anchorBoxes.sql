CREATE TABLE IF NOT EXISTS public."Anchor_Box"
(
    box_id integer NOT NULL,
    message text COLLATE pg_catalog."default",
    zip_code text COLLATE pg_catalog."default",
    picture text COLLATE pg_catalog."default",
    general_location text COLLATE pg_catalog."default",
    date text COLLATE pg_catalog."default",
    launched_organically boolean,
    additional_comments text COLLATE pg_catalog."default",
    CONSTRAINT "Anchor_Box_pkey" PRIMARY KEY (box_id)
);
