# 🚀 Pocket - Deployment Guide

## Deploy ke Vercel

### Environment Variables yang Diperlukan:

Masukkan environment variables berikut di Vercel Dashboard:

```env
DATABASE_URL=postgresql://postgres:OmJO5DqLoGgdGAhN@db.zbxxbyratxdubtjqwzeh.supabase.co:5432/postgres

DIRECT_URL=postgresql://postgres:OmJO5DqLoGgdGAhN@db.zbxxbyratxdubtjqwzeh.supabase.co:5432/postgres

NEXTAUTH_SECRET=kiro-pocket-finance-tracker-secret-key-2024-production-ready

NEXTAUTH_URL=https://your-deployment-url.vercel.app
```

**PENTING:** Ganti `NEXTAUTH_URL` dengan URL production Anda setelah deploy pertama kali!

### Langkah Deploy:

1. **Import Project di Vercel**
   - Buka https://vercel.com
   - Klik "Add New Project"
   - Import repository: `Fiiluthfiii/Pocket`

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: Biarkan default atau gunakan: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**
   Tambahkan 4 environment variables di atas (kecuali NEXTAUTH_URL, tambahkan nanti)

4. **Deploy!**
   - Klik "Deploy"
   - Tunggu 2-3 menit

5. **Update NEXTAUTH_URL**
   Setelah deploy selesai:
   - Copy URL production (contoh: `https://pocket-xyz.vercel.app`)
   - Settings → Environment Variables
   - Add: `NEXTAUTH_URL` = URL production Anda
   - Redeploy dari Deployments tab

### Troubleshooting:

**Jika build gagal:**
- Cek logs di Vercel dashboard
- Pastikan semua environment variables sudah benar
- Vercel akan auto-redeploy setiap push ke GitHub

**Database Connection Error:**
- Pastikan DATABASE_URL dan DIRECT_URL benar
- Cek Supabase connection pooling enabled

**NextAuth Error:**
- Pastikan NEXTAUTH_URL sama dengan production URL
- NEXTAUTH_SECRET minimal 32 karakter

### Custom Domain (Optional):

1. Di Vercel Dashboard → Settings → Domains
2. Add domain Anda
3. Update DNS records sesuai instruksi
4. Update NEXTAUTH_URL ke custom domain Anda

---

## ✅ Checklist Deployment:

- [x] Push code ke GitHub
- [x] Build configuration fixed
- [ ] Import project ke Vercel
- [ ] Add environment variables
- [ ] Deploy pertama kali
- [ ] Update NEXTAUTH_URL
- [ ] Redeploy
- [ ] Test login & register
- [ ] Test semua fitur
- [ ] (Optional) Add custom domain

---

**Live URL:** https://pocket-[your-id].vercel.app

**Repository:** https://github.com/Fiiluthfiii/Pocket
