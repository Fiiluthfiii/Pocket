-- Script SQL untuk menambahkan kolom phone dan bio ke tabel User
-- Jalankan di Supabase SQL Editor jika kolom belum ada

-- Tambah kolom phone (nomor telepon)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;

-- Tambah kolom bio (bio singkat)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('phone', 'bio');
