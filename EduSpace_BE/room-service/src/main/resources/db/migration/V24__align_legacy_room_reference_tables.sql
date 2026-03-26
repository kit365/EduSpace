-- Bù schema cũ cho các bảng V1 (i18n) khi flyway version cao nhưng bảng thiếu cột.
-- Idempotent: ADD COLUMN IF NOT EXISTS.

-- ─── amenities (AmenityEntity) ───────────────────────────────────────────────
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS icon VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS type VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS price BIGINT NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS amenities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── room_categories (RoomCategoryEntity) ────────────────────────────────────
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS image VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS image_alt_vi VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS image_alt_en VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS room_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── room_policies (RoomPolicyEntity) ───────────────────────────────────────
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS room_id INTEGER;
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS logo_alt_vi VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS logo_alt_en VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS room_policies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── reviews (ReviewEntity) ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS room_id INTEGER;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS author_id VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS booking_id INTEGER;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS rating SMALLINT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS status VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS reply_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── extra_services (ExtraServiceEntity) ────────────────────────────────────
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS property_id INTEGER;
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS price BIGINT;
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS price_unit VARCHAR(30);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS status VARCHAR(255);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS extra_services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── room_ads (RoomAdEntity) ────────────────────────────────────────────────
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS room_id INTEGER;
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS ads_package_id INTEGER;
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255);
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS paid_amount BIGINT;
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS status VARCHAR(255);
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS room_ads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── system_calendar_rules (SystemCalendarRuleEntity) ──────────────────────
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 4);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS price_modifier_rate DECIMAL(5, 4);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS block_type VARCHAR(255);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS system_calendar_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── room_custom_prices (RoomCustomPriceEntity) ───────────────────────────────
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS room_id INTEGER;
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(20);
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS specific_date DATE;
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS price_modifier DECIMAL(8, 4);
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS room_custom_prices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- ─── room_amenities: type (V22) — nếu DB bỏ qua V22 ───────────────────────────
ALTER TABLE IF EXISTS room_amenities ADD COLUMN IF NOT EXISTS type VARCHAR(255);

-- Backfill name_vi/name_en từ cột legacy "name" (một số DB cũ)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'amenities' AND column_name = 'name') THEN
        EXECUTE $q$UPDATE amenities SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))), name_en = COALESCE(name_en, CAST(name AS VARCHAR(255))) WHERE name_vi IS NULL OR name_en IS NULL$q$;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'room_categories' AND column_name = 'name') THEN
        EXECUTE $q$UPDATE room_categories SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))), name_en = COALESCE(name_en, CAST(name AS VARCHAR(255))) WHERE name_vi IS NULL OR name_en IS NULL$q$;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'room_policies' AND column_name = 'name') THEN
        EXECUTE $q$UPDATE room_policies SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))), name_en = COALESCE(name_en, CAST(name AS VARCHAR(255))) WHERE name_vi IS NULL OR name_en IS NULL$q$;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'extra_services' AND column_name = 'name') THEN
        EXECUTE $q$UPDATE extra_services SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))), name_en = COALESCE(name_en, CAST(name AS VARCHAR(255))) WHERE name_vi IS NULL OR name_en IS NULL$q$;
    END IF;
END $$;
