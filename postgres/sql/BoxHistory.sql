CREATE TABLE IF NOT EXISTS public."Box_History"
(
    box_id integer NOT NULL,
    message text COLLATE pg_catalog."default",
    boxholder_email text COLLATE pg_catalog."default",
    boxholder_name text COLLATE pg_catalog."default",
    drop_off_method text COLLATE pg_catalog."default",
    general_location text COLLATE pg_catalog."default",
    picture text COLLATE pg_catalog."default",
    approved boolean,
    status text COLLATE pg_catalog."default",
    pickup boolean,
    changes_requested text COLLATE pg_catalog."default",
    rejection_reason text COLLATE pg_catalog."default",
    message_status text COLLATE pg_catalog."default",
    zip_code text COLLATE pg_catalog."default",
    date text COLLATE pg_catalog."default",

    CONSTRAINT "Box_History_pkey" PRIMARY KEY (box_id)
);
