CREATE TABLE IF NOT EXISTS public."Admin_Invite"
(
    email character varying(255) COLLATE pg_catalog."default",
    invite_id character varying(255) COLLATE pg_catalog."default",
    expire_time timestamp without time zone,
    valid_invite boolean
);

CREATE OR REPLACE FUNCTION delete_expired_invites() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "Admin_Invite" WHERE NOW() > expire_time;
  RETURN NEW;
END
$$;

CREATE TRIGGER clean_admin_invite
AFTER INSERT ON "Admin_Invite"
EXECUTE PROCEDURE delete_expired_invites();
