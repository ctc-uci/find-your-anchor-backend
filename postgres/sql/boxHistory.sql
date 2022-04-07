CREATE TABLE IF NOT EXISTS public."Box_History"
(
    transaction_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    box_id character varying COLLATE pg_catalog."default",
    message character varying COLLATE pg_catalog."default",
    boxholder_email character varying COLLATE pg_catalog."default",
    boxholder_name character varying COLLATE pg_catalog."default",
    general_location character varying COLLATE pg_catalog."default",
    picture character varying COLLATE pg_catalog."default",
    approved boolean,
    status character varying COLLATE pg_catalog."default",
    pickup boolean,
    image_status character varying(255) COLLATE pg_catalog."default",
    changes_requested character varying COLLATE pg_catalog."default",
    rejection_reason character varying COLLATE pg_catalog."default",
    message_status character varying COLLATE pg_catalog."default",
    zip_code character varying COLLATE pg_catalog."default",
    date character varying COLLATE pg_catalog."default",
    launched_organically boolean,
    image_status character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "Box_History_pkey1" PRIMARY KEY (transaction_id)
);
