-- Một số DB dev có ads_packages schema cũ (thiếu description_en, name_vi, ...) dù flyway version cao.
-- Đồng bộ với AdsPackageEntity + V1__init_schema.

ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS price BIGINT;
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS status VARCHAR(255);
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS ads_packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'ads_packages'
          AND column_name = 'name'
    ) THEN
        EXECUTE $u$
            UPDATE ads_packages
            SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))),
                name_en = COALESCE(name_en, CAST(name AS VARCHAR(255)))
            WHERE name_vi IS NULL OR name_en IS NULL
        $u$;
    END IF;
END $$;
