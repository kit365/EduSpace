-- One active admin/support thread per requester (user1). Prevents duplicate rooms from double-clicks / races.
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversations_one_admin_support_per_user1
    ON conversations (user1_id)
    WHERE is_admin_conversation = true;
