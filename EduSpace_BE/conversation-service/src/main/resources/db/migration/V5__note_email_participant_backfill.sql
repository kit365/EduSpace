-- Conversation participant columns must store Keycloak "sub" or GUEST-*, never raw email.
-- Account and conversation DBs are separate (docker-compose), so no cross-DB UPDATE here.
-- One-time fix: start conversation-service with
--   app.chat.backfill-email-participants-on-startup=true
-- then set back to false after logs show "Email participant backfill" completed.

SELECT 1;
