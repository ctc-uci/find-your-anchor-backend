CREATE TABLE IF NOT EXISTS public."Box_History"
(
    box_id integer NOT NULL,
    message character varying COLLATE pg_catalog."default",
    boxholder_email character varying COLLATE pg_catalog."default",
    boxholder_name character varying COLLATE pg_catalog."default",
    general_location character varying COLLATE pg_catalog."default",
    picture character varying COLLATE pg_catalog."default",
    approved boolean,
    status character varying COLLATE pg_catalog."default",
    pickup boolean,
    changes_requested character varying COLLATE pg_catalog."default",
    rejection_reason character varying COLLATE pg_catalog."default",
    message_status character varying COLLATE pg_catalog."default",
    zip_code character varying COLLATE pg_catalog."default",
    date character varying COLLATE pg_catalog."default",
    launched_organically boolean,

    CONSTRAINT "Box_History_pkey" PRIMARY KEY (box_id)
);
