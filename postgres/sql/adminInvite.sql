CREATE TABLE IF NOT EXISTS public."Admin_Invite"
(
    email character varying(255) COLLATE pg_catalog."default",
    invite_id character varying(255) COLLATE pg_catalog."default",
    expire_time timestamp without time zone,
    valid_invite boolean
);
