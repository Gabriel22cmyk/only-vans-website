-- ═══════════════════════════════════════════════════════════════
-- ONLY VANS — Supabase Setup
-- Paste this ENTIRE script into the Supabase SQL Editor and run
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the vans table
CREATE TABLE IF NOT EXISTS public.vans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    mileage INTEGER,
    fuel_type TEXT DEFAULT 'Diesel',
    transmission TEXT DEFAULT 'Manual',
    colour TEXT,
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;

-- 3. Anyone can VIEW vans (the public website needs this)
CREATE POLICY "Public read access" ON public.vans
    FOR SELECT USING (true);

-- 4. Only logged-in admin can ADD vans
CREATE POLICY "Admin insert" ON public.vans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Only logged-in admin can EDIT vans
CREATE POLICY "Admin update" ON public.vans
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Only logged-in admin can DELETE vans
CREATE POLICY "Admin delete" ON public.vans
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Auto-update the updated_at timestamp on edits
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vans_updated_at
    BEFORE UPDATE ON public.vans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- STORAGE POLICIES
-- ⚠️  Before running these, FIRST create the bucket manually:
--     Supabase Dashboard → Storage → New Bucket
--     Name: van-images
--     Toggle ON "Public bucket"
--     Click "Create bucket"
-- ═══════════════════════════════════════════════════════════════

-- Anyone can view van images (public website)
CREATE POLICY "Public can view van images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'van-images');

-- Admin can upload van images
CREATE POLICY "Admin can upload van images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'van-images' AND auth.role() = 'authenticated');

-- Admin can replace van images
CREATE POLICY "Admin can update van images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'van-images' AND auth.role() = 'authenticated');

-- Admin can delete van images
CREATE POLICY "Admin can delete van images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'van-images' AND auth.role() = 'authenticated');
