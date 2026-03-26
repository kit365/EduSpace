-- Seed thêm 3 chi nhánh demo cho môi trường dev.
-- Idempotent: nếu đã có theo (owner_id + name_vi) thì không chèn lại.
--
-- Một số DB dev có flyway version khớp nhưng bảng properties còn schema cũ (thiếu name_vi, ...).
-- Bổ sung cột cần cho INSERT + backfill từ cột legacy "name" nếu có.

ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS owner_id VARCHAR(36);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(100);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS province_code VARCHAR(20);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS district_code VARCHAR(20);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS ward_code VARCHAR(20);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS address_detail_vi VARCHAR(500);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS address_detail_en VARCHAR(500);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS logo_alt_vi VARCHAR(255);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS logo_alt_en VARCHAR(255);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS rejection_note TEXT;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS approved_by VARCHAR(36);
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS schedule_buffer_minutes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS schedule_is_over_day BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'properties'
          AND column_name = 'name'
    ) THEN
        EXECUTE $m$
            UPDATE properties
            SET name_vi = COALESCE(name_vi, CAST(name AS VARCHAR(255))),
                name_en = COALESCE(name_en, CAST(name AS VARCHAR(255)))
            WHERE name_vi IS NULL OR name_en IS NULL
        $m$;
    END IF;
END $$;

INSERT INTO properties (
    owner_id,
    name_vi,
    name_en,
    property_type,
    contact_phone,
    contact_email,
    province_code,
    district_code,
    ward_code,
    address_detail_vi,
    address_detail_en,
    latitude,
    longitude,
    logo,
    logo_alt_vi,
    logo_alt_en,
    description_vi,
    description_en,
    status,
    schedule_buffer_minutes,
    schedule_is_over_day
)
SELECT
    'demo-owner-id',
    'EduSpace Quận 1',
    'EduSpace District 1',
    'CENTER_COWORKING',
    '0901234001',
    'q1@eduspace.com',
    '79',
    '760',
    '26743',
    '45 Nguyễn Huệ, Quận 1, TP.HCM',
    '45 Nguyen Hue, District 1, HCMC',
    10.775658,
    106.700424,
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'Logo chi nhánh Quận 1',
    'District 1 branch logo',
    'Chi nhánh trung tâm, phù hợp họp nhóm và workshop nhỏ.',
    'Central branch for team meetings and small workshops.',
    'VERIFIED',
    15,
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM properties
    WHERE owner_id = 'demo-owner-id'
      AND name_vi = 'EduSpace Quận 1'
);

INSERT INTO properties (
    owner_id,
    name_vi,
    name_en,
    property_type,
    contact_phone,
    contact_email,
    province_code,
    district_code,
    ward_code,
    address_detail_vi,
    address_detail_en,
    latitude,
    longitude,
    logo,
    logo_alt_vi,
    logo_alt_en,
    description_vi,
    description_en,
    status,
    schedule_buffer_minutes,
    schedule_is_over_day
)
SELECT
    'demo-owner-id',
    'EduSpace Thủ Đức',
    'EduSpace Thu Duc',
    'CENTER_COWORKING',
    '0901234002',
    'thuduc@eduspace.com',
    '79',
    '769',
    '27103',
    '12 Võ Văn Ngân, Thủ Đức, TP.HCM',
    '12 Vo Van Ngan, Thu Duc, HCMC',
    10.850632,
    106.772089,
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    'Logo chi nhánh Thủ Đức',
    'Thu Duc branch logo',
    'Không gian linh hoạt cho đào tạo, lớp học và sự kiện cộng đồng.',
    'Flexible space for training, classes, and community events.',
    'VERIFIED',
    10,
    FALSE
WHERE NOT EXISTS (
    SELECT 1
    FROM properties
    WHERE owner_id = 'demo-owner-id'
      AND name_vi = 'EduSpace Thủ Đức'
);

INSERT INTO properties (
    owner_id,
    name_vi,
    name_en,
    property_type,
    contact_phone,
    contact_email,
    province_code,
    district_code,
    ward_code,
    address_detail_vi,
    address_detail_en,
    latitude,
    longitude,
    logo,
    logo_alt_vi,
    logo_alt_en,
    description_vi,
    description_en,
    status,
    schedule_buffer_minutes,
    schedule_is_over_day
)
SELECT
    'demo-owner-id',
    'EduSpace Bình Thạnh 24/7',
    'EduSpace Binh Thanh 24/7',
    'CENTER_COWORKING',
    '0901234003',
    'binhthanh@eduspace.com',
    '79',
    '765',
    '26974',
    '88 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    '88 Dien Bien Phu, Binh Thanh, HCMC',
    10.801715,
    106.710205,
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'Logo chi nhánh Bình Thạnh',
    'Binh Thanh branch logo',
    'Chi nhánh ưu tiên đặt theo slot dài, phù hợp team làm việc xuyên ngày.',
    'Branch optimized for long slot bookings and all-day work sessions.',
    'VERIFIED',
    20,
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM properties
    WHERE owner_id = 'demo-owner-id'
      AND name_vi = 'EduSpace Bình Thạnh 24/7'
);
