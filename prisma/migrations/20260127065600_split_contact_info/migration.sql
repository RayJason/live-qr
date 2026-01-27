-- Split contactInfo into contactEmail and contactPhone
-- Add new User fields
-- Use IF NOT EXISTS to handle partial schema state

-- Add new columns to User table (if not exists)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "feishuWebhookUrl" TEXT;

-- Add new columns to Product table (if not exists)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "showContactWhenSafe" BOOLEAN DEFAULT false;

-- Migrate existing contactInfo data to contactPhone (if contactInfo column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Product' AND column_name = 'contactInfo') THEN
        UPDATE "Product" SET "contactPhone" = "contactInfo" WHERE "contactInfo" IS NOT NULL AND "contactPhone" IS NULL;
        ALTER TABLE "Product" DROP COLUMN "contactInfo";
    END IF;
END $$;
