# 💰 Pocket - Aplikasi Pencatat Keuangan Pribadi

Pocket adalah aplikasi web modern untuk mencatat, mengelola, dan menganalisis keuangan pribadi Anda. Dibuat dengan Next.js, Tailwind CSS, dan PostgreSQL.

![Pocket Preview](https://via.placeholder.com/1200x600/0f766e/ffffff?text=Pocket+Financial+Tracker)

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif** - Lihat ringkasan keuangan Anda dengan visualisasi yang menarik
- 💸 **Manajemen Transaksi** - Catat pemasukan dan pengeluaran dengan mudah
- 📁 **Kategori Custom** - Organisir transaksi dengan kategori yang bisa disesuaikan
- 💰 **Multi-Dompet** - Kelola berbagai sumber dana (cash, bank, e-wallet)
- 📈 **Laporan & Grafik** - Analisis keuangan dengan grafik interaktif
- 🎯 **Anggaran Bulanan** - Atur dan pantau target pengeluaran
- 🌙 **Dark Mode** - Tampilan gelap untuk kenyamanan mata
- 📱 **Responsive** - Optimal di desktop, tablet, dan mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, JavaScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Quick Start

### Prasyarat

- Node.js 18+ dan npm/yarn
- Akun PostgreSQL (disarankan: [Neon](https://neon.tech))

### Instalasi

1. Clone repository ini:
```bash
git clone <repository-url>
cd pocket
```

2. Install dependencies:
```bash
npm install
# atau
yarn install
```

3. Setup Environment Variables:

Buat file `.env` di root folder dan isi dengan konfigurasi berikut:

```env
# Database - Dapatkan dari Neon.tech
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Cara generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

4. Setup Database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database dengan data demo
npx prisma db seed
```

5. Jalankan development server:

```bash
npm run dev
# atau
yarn dev
```

6. Buka browser dan akses:
```
http://localhost:3000
```

## 👤 Akun Demo

Setelah menjalankan seed, Anda bisa login dengan:

- **Email**: demo@pocket.com
- **Password**: demo123

## 📁 Struktur Project

```
pocket/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── transactions/
│   │   ├── categories/
│   │   └── wallets/
│   ├── dashboard/       # Dashboard pages
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budget/
│   │   ├── reports/
│   │   ├── wallets/
│   │   └── settings/
│   ├── login/          # Login page
│   ├── register/       # Register page
│   ├── layout.js       # Root layout
│   ├── page.js         # Landing page
│   └── globals.css     # Global styles
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── transactions/   # Transaction components
│   └── providers/      # Context providers
├── lib/
│   ├── prisma.js       # Prisma client
│   └── auth.js         # Auth utilities
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Seed data
├── public/             # Static assets
├── .env.example        # Environment variables template
├── package.json
├── tailwind.config.js
└── README.md
```

## 🗄️ Database Schema

Aplikasi menggunakan 5 model utama:

- **User** - Data pengguna
- **Wallet** - Dompet/akun keuangan
- **Category** - Kategori transaksi
- **Transaction** - Transaksi keuangan
- **Budget** - Anggaran bulanan

Lihat detail schema di `prisma/schema.prisma`

## 🔐 Keamanan

- Password di-hash menggunakan bcrypt
- Session management dengan JWT
- Protected routes dengan NextAuth middleware
- Input validation di client dan server side
- Environment variables untuk kredensial sensitif

## 📱 Responsive Design

Aplikasi dioptimalkan untuk berbagai ukuran layar:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎨 Design System

Pocket menggunakan design system yang konsisten:

- **Primary Color**: Teal/Primary-600 (#0d9488)
- **Typography**: Inter font family
- **Components**: Card-based layout dengan border radius konsisten
- **Spacing**: Tailwind spacing scale
- **Shadows**: Subtle shadows untuk depth

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Wallets
- `GET /api/wallets` - Get all wallets
- `POST /api/wallets` - Create wallet

## 🚧 Roadmap

- [ ] Export laporan ke PDF/CSV
- [ ] Notifikasi anggaran
- [ ] Upload foto struk
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Sharing budget dengan keluarga

## 🤝 Kontribusi

Kontribusi selalu welcome! Silakan:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Project ini dibuat untuk keperluan pembelajaran dan portfolio.

## 👨‍💻 Author

Dibuat dengan ❤️ mengikuti PRD yang detail dan komprehensif.

## 🙏 Acknowledgments

- Design inspiration dari Mint, YNAB, dan modern fintech apps
- Icons dari Lucide React
- Charts dari Recharts
- UI framework dari Tailwind CSS

---

**Happy tracking your finances! 💰**
