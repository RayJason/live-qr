-- Existing items retain their product-type defaults until a custom design is saved.
ALTER TABLE "Product" ADD COLUMN "qrStyle" JSONB;
