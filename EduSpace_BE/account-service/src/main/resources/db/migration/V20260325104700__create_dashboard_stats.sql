CREATE TABLE dashboard_stats (
    id BIGSERIAL PRIMARY KEY,
    total_users BIGINT,
    active_hosts BIGINT,
    total_listings BIGINT,
    total_bookings BIGINT,
    total_revenue DOUBLE PRECISION,
    pending_kyc BIGINT,
    new_listings_today BIGINT,
    success_rate DOUBLE PRECISION,
    category_distribution TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboard_stats_created_at ON dashboard_stats(created_at DESC);
