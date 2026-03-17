-- V6: Loyalty conversion rate config (1 point = X VND)
CREATE TABLE IF NOT EXISTS loyalty_config (
    id              BIGSERIAL   PRIMARY KEY,
    vnd_per_point   INTEGER     NOT NULL DEFAULT 100,
    updated_at      TIMESTAMP   DEFAULT NOW()
);

-- Single row: global config
INSERT INTO loyalty_config (id, vnd_per_point, updated_at)
SELECT 1, 100, NOW()
WHERE NOT EXISTS (SELECT 1 FROM loyalty_config WHERE id = 1);
