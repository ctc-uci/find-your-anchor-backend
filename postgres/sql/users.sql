CREATE TABLE IF NOT EXISTS public."Box_History"
(
    box_id integer NOT NULL,
    date date,
    message text COLLATE pg_catalog."default",
    boxholder_email text COLLATE pg_catalog."default",
    boxholder_name text COLLATE pg_catalog."default",
    zip_code integer,
    drop_off_method text COLLATE pg_catalog."default",
    general_location text COLLATE pg_catalog."default",
    picture text COLLATE pg_catalog."default",
    approved boolean,
    status text COLLATE pg_catalog."default",
    pickup boolean,
    CONSTRAINT "Box_History_pkey" PRIMARY KEY (box_id)
);
