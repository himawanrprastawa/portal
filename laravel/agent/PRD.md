# Product Requirements Document (PRD)

## 1. Informasi Produk

**Nama Produk:** Indonesia Tour Guide for German Travelers  
**Platform:** Responsive Web Application (Desktop, Tablet, Mobile)  
**Target Teknologi:** React.js + Node.js  
**Bahasa Utama:** Jerman (DE)  
**Bahasa Pendukung:** Inggris (EN), opsional Bahasa Indonesia (ID) untuk fase berikutnya  
**Target Pasar:** Wisatawan berkebangsaan Jerman yang ingin berlibur ke Indonesia  

---

## 2. Latar Belakang

Website dibuat sebagai platform informasi dan lead-generation untuk wisatawan Jerman yang ingin berlibur ke Indonesia. Pengguna dapat memilih destinasi utama, melihat paket/aktivitas tour guide, memahami layanan yang tersedia, lalu melanjutkan proses kontak atau pemesanan melalui website bisnis.

Destinasi awal yang tersedia:

1. Jakarta
2. Yogyakarta
3. Bali

Website fokus pada pengalaman pengguna yang sederhana, terpercaya, mobile-friendly, dan memiliki nuansa Indonesia yang tetap profesional untuk pasar Jerman.

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

- Mendapatkan calon pelanggan wisatawan Jerman.
- Menampilkan layanan tour guide secara profesional.
- Mengarahkan calon pelanggan dari landing page ke website bisnis untuk proses booking/contact.
- Meningkatkan conversion rate dari pengunjung menjadi lead.
- Menjadi kanal digital utama untuk promosi layanan tour guide Indonesia.

### 3.2 Tujuan Pengguna

- Menemukan destinasi Indonesia yang sesuai.
- Melihat aktivitas dan layanan tour guide.
- Mendapatkan informasi perjalanan yang mudah dipahami dalam bahasa Jerman.
- Mengetahui estimasi durasi dan jenis pengalaman yang tersedia.
- Menghubungi atau melakukan booking melalui website bisnis.

---

## 4. Target User

### Primary Persona: German Tourist

**Profil:**
- Warga negara Jerman.
- Usia sekitar 25–60 tahun.
- Traveling sendiri, pasangan, keluarga, atau grup kecil.
- Familiar menggunakan smartphone dan website untuk mencari perjalanan.
- Mencari pengalaman yang aman, nyaman, autentik, dan terorganisir.

**Kebutuhan utama:**
- Informasi yang jelas.
- Harga/ketentuan yang transparan jika ditampilkan.
- Foto destinasi berkualitas.
- Guide yang dapat berkomunikasi dengan baik.
- Kontak/booking yang mudah.

---

## 5. Scope MVP

### 5.1 Halaman Utama

Homepage harus menjadi halaman paling persuasif dan mengarahkan pengguna ke 3 destinasi.

Komponen:
- Hero section dengan foto/video Indonesia.
- Headline berbahasa Jerman.
- CTA utama: **Reise planen / Jetzt anfragen**.
- Pilihan destinasi Jakarta, Yogyakarta, Bali.
- Keunggulan layanan.
- Featured tour/activity.
- Cara kerja booking.
- Testimonial.
- FAQ.
- Footer dengan kontak dan legal links.

### 5.2 Halaman Destinasi

Masing-masing destinasi memiliki halaman detail:

- `/jakarta`
- `/yogyakarta`
- `/bali`

Konten:
- Hero image.
- Deskripsi destinasi.
- Kenapa destinasi cocok untuk traveler Jerman.
- Paket/aktivitas tour.
- Durasi.
- Informasi guide.
- Gallery foto.
- Highlight itinerary.
- CTA ke website bisnis.

### 5.3 Detail Tour

Contoh route:

`/jakarta/tours/national-monument-city-tour`

Isi:
- Nama tour.
- Foto utama.
- Durasi.
- Bahasa guide.
- Jumlah peserta ideal.
- Titik penjemputan.
- Itinerary.
- Included.
- Excluded.
- Informasi penting.
- CTA booking/contact.

### 5.4 Contact / Booking Redirect

Kontrak/person booking **tidak diproses sebagai transaksi penuh di website utama** pada MVP.

CTA booking akan mengarahkan pengguna ke website bisnis.

Contoh:
- `Jetzt buchen` → URL website bisnis.
- `Anfrage senden` → URL/contact form bisnis.
- `WhatsApp kontaktieren` → opsi komunikasi langsung jika bisnis menggunakannya.

Parameter tracking direkomendasikan saat redirect, misalnya:

`?source=tour-guide&destination=bali&tour=xxx`

Tujuan tracking adalah mengetahui lead berasal dari website tour guide.

---

## 6. User Flow

### Flow A - Discover Destination

1. User membuka homepage.
2. User melihat hero section.
3. User memilih Jakarta / Yogyakarta / Bali.
4. Sistem membuka halaman destinasi.
5. User melihat tour yang tersedia.
6. User memilih detail tour.
7. User klik CTA booking/contact.
8. User dialihkan ke website bisnis.

### Flow B - Contact

1. User membuka halaman Contact.
2. User memilih metode kontak.
3. Sistem menampilkan informasi kontak atau redirect ke website bisnis.
4. User melanjutkan proses di website bisnis.

### Flow C - Mobile

1. User membuka website melalui smartphone.
2. Homepage otomatis menggunakan responsive layout.
3. Navigasi menggunakan mobile menu.
4. CTA booking tetap visible dan mudah diakses.
5. Redirect ke website bisnis dilakukan di browser/mobile web.

---

## 7. Struktur Halaman

```text
/
├── /jakarta
│   ├── /tours
│   └── /tours/:slug
├── /yogyakarta
│   ├── /tours
│   └── /tours/:slug
├── /bali
│   ├── /tours
│   └── /tours/:slug
├── /about
├── /contact
├── /faq
├── /privacy-policy
└── /terms
```

---

## 8. Fitur Utama

### 8.1 Destination Selection

User dapat memilih 3 destinasi utama melalui card/interaktif section:

- Jakarta
- Yogyakarta
- Bali

Card menampilkan:
- Foto.
- Nama destinasi.
- Deskripsi singkat.
- CTA.

### 8.2 Tour Listing

Filter minimum:
- Destinasi.
- Durasi.
- Jenis aktivitas.

Kategori aktivitas yang dapat digunakan:
- Culture
- Nature
- Food
- Adventure
- City Tour
- Family
- Private Tour

### 8.3 Gallery

- Responsive image gallery.
- Lazy loading.
- Optimized image size.
- Lightbox untuk desktop/mobile.

### 8.4 Testimonial

Menampilkan testimoni pelanggan dengan:
- Nama depan / inisial.
- Negara.
- Review.
- Rating opsional.

### 8.5 FAQ

Contoh topik:
- Bahasa yang digunakan guide.
- Transportasi.
- Durasi tour.
- Meeting point.
- Pembatalan.
- Booking.
- Pembayaran.

### 8.6 CTA

CTA utama harus konsisten:
- Jetzt anfragen
- Tour entdecken
- Jetzt buchen
- Kontakt aufnehmen

---

## 9. Bahasa & Localization

Bahasa utama adalah Jerman.

Struktur localization direkomendasikan:

```text
/de
/en
```

MVP minimum dapat menggunakan bahasa Jerman terlebih dahulu dengan arsitektur yang siap untuk multi-language.

Semua teks UI sebaiknya tidak hard-coded langsung di komponen React.

Contoh:

```js
{
  "hero.title": "Entdecke Indonesien mit einem lokalen Guide",
  "hero.cta": "Jetzt anfragen"
}
```

---

## 10. Design Requirements

### 10.1 Design Direction

Visual harus memberikan kesan:

- Premium.
- Tropical.
- Trustworthy.
- Modern European travel brand.
- Indonesia experience.

### 10.2 Responsive

Breakpoint minimum:

- Mobile: 320–767 px
- Tablet: 768–1023 px
- Desktop: 1024 px ke atas

### 10.3 Mobile Requirements

- Mobile-first.
- Touch target minimal nyaman disentuh.
- CTA booking mudah ditemukan.
- Navigation menggunakan hamburger menu.
- Image tidak boleh menyebabkan layout shift besar.
- Font readable tanpa zoom.

### 10.4 Suggested Components

- Navbar
- Hero
- DestinationCard
- TourCard
- TourDetail
- Gallery
- TestimonialCard
- FAQAccordion
- CTASection
- Footer
- LanguageSwitcher
- BookingRedirectButton

---

## 11. Recommended Tech Stack

### Frontend

- React.js
- Vite
- React Router
- TypeScript direkomendasikan
- Tailwind CSS atau CSS Modules
- React Query / TanStack Query bila diperlukan untuk API data

### Backend

- Node.js
- Express.js
- TypeScript direkomendasikan
- REST API
- Zod/Joi untuk validation

### Database

MVP dapat menggunakan PostgreSQL.

Alternatif:
- MySQL
- MongoDB

PostgreSQL direkomendasikan apabila data tour dan konten ingin berkembang menjadi sistem yang lebih terstruktur.

### Deployment

Frontend:
- Vercel / Netlify / Cloudflare Pages

Backend:
- Railway / Render / AWS / VPS

Database:
- Managed PostgreSQL

---

## 12. System Architecture

```text
                 ┌────────────────────┐
                 │     User Browser    │
                 │ Mobile / Desktop    │
                 └──────────┬─────────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │   React Frontend   │
                 │  Responsive Web UI │
                 └──────────┬─────────┘
                            │ REST API
                            ▼
                 ┌────────────────────┐
                 │ Node.js / Express  │
                 │    Backend API     │
                 └──────────┬─────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      ┌─────────────────┐       ┌──────────────────┐
      │   PostgreSQL    │       │ External Services│
      │ Tours / Content │       │ Analytics / CMS  │
      └─────────────────┘       └──────────────────┘

Booking / Contact CTA
          │
          ▼
┌──────────────────────────┐
│      Business Website    │
│   Contact / Booking Flow │
└──────────────────────────┘
```

---

## 13. Backend API Requirements

### Destinations

```http
GET /api/destinations
GET /api/destinations/:slug
```

### Tours

```http
GET /api/tours
GET /api/tours/:slug
GET /api/destinations/:slug/tours
```

Query parameter contoh:

```text
/api/tours?destination=bali&category=culture
```

### Contact / Lead Tracking

Opsional untuk MVP:

```http
POST /api/leads/click
```

Payload:

```json
{
  "destination": "bali",
  "tourSlug": "ubud-private-tour",
  "source": "website",
  "cta": "booking"
}
```

Backend dapat menyimpan event tersebut untuk analytics.

---

## 14. Data Model

### Destination

```text
Destination
- id
- name
- slug
- short_description
- description
- hero_image
- status
- created_at
- updated_at
```

### Tour

```text
Tour
- id
- destination_id
- title
- slug
- short_description
- description
- duration
- category
- language
- max_participants
- meeting_point
- included
- excluded
- itinerary
- hero_image
- booking_url
- status
- created_at
- updated_at
```

### LeadEvent

```text
LeadEvent
- id
- destination_id
- tour_id
- source
- cta_type
- referrer
- user_agent
- created_at
```

---

## 15. Booking / Business Website Integration

### Prinsip

Website tour guide berfungsi sebagai **marketing, information, dan lead-generation website**.

Website bisnis berfungsi sebagai **booking/contact/conversion platform**.

### Required Behavior

Saat user menekan CTA:

```text
Tour Guide Website
       │
       │ Click Booking
       ▼
Tracking Event
       │
       ▼
Business Website
```

### Tracking URL

Contoh:

```text
https://business-domain.com/booking?source=tour-guide&destination=yogyakarta&tour=prambanan-tour
```

Untuk keamanan, URL external sebaiknya berasal dari configuration/database dan divalidasi agar tidak menjadi open redirect.

---

## 16. Admin / Content Management

### MVP Option A

Konten dikelola langsung melalui database/seeding.

Cocok untuk tahap awal ketika jumlah tour masih sedikit.

### Phase 2

Buat Admin Dashboard:

- Login admin.
- CRUD destination.
- CRUD tour.
- Upload gallery.
- CRUD testimonial.
- CRUD FAQ.
- Update booking URL.
- View click/lead analytics.

---

## 17. SEO Requirements

SEO penting karena target user kemungkinan datang dari Google.

Setiap destination dan tour harus memiliki:

- SEO title.
- Meta description.
- Canonical URL.
- Open Graph image.
- Clean URL.
- Structured data jika relevan.
- Sitemap.xml.
- robots.txt.
- Alt text gambar.

Contoh keyword strategy:

- Indonesien Reise Guide
- Indonesien Urlaub
- Bali private Tour
- Yogyakarta Tour Guide
- Jakarta Reiseleiter
- Indonesien Rundreise

Keyword final harus divalidasi melalui riset SEO sebelum content production.

---

## 18. Performance Requirements

Target:

- Fast initial page load.
- Responsive interaction.
- Image optimization.
- Lazy loading.
- Code splitting.
- Caching API jika diperlukan.
- CDN untuk static assets.

Target teknis yang disarankan:

- LCP < 2.5 detik pada kondisi jaringan yang baik.
- CLS < 0.1.
- Core Web Vitals minimal pada level yang baik.

---

## 19. Accessibility

Website harus mengikuti praktik accessibility modern:

- Semantic HTML.
- Alt text.
- Keyboard navigation.
- Focus state.
- Color contrast yang cukup.
- Form label yang jelas.
- Screen-reader friendly navigation.

---

## 20. Security Requirements

Backend:

- HTTPS.
- Helmet/security headers.
- Input validation.
- Rate limiting.
- CORS configuration.
- Environment variables untuk secret.
- Tidak menyimpan secret di repository.
- SQL injection protection menggunakan ORM/query parameterization.
- Logging untuk error server.

External booking redirect:

- Allowlist domain bisnis.
- Jangan menerima arbitrary redirect URL dari query parameter user.

---

## 21. Analytics

Analytics minimal:

- Page views.
- Destination view.
- Tour detail view.
- CTA click.
- Booking redirect.
- Device type.
- Country/region jika platform analytics mendukung.

Funnel:

```text
Visitor
  ↓
Destination View
  ↓
Tour View
  ↓
CTA Click
  ↓
Business Website
  ↓
Lead / Booking
```

Conversion utama:

**Booking CTA Click Rate**

`CTA Clicks / Unique Visitors × 100%`

---

## 22. Content Requirements

Konten awal minimum:

### Jakarta
- Overview destinasi.
- 3–5 tour.
- Gallery.
- FAQ.

### Yogyakarta
- Overview destinasi.
- 3–5 tour.
- Gallery.
- FAQ.

### Bali
- Overview destinasi.
- 5–8 tour.
- Gallery.
- FAQ.

Konten harus ditulis untuk target wisatawan Jerman, bukan sekadar diterjemahkan secara literal dari Bahasa Indonesia.

---

## 23. MVP Acceptance Criteria

MVP dianggap selesai apabila:

### Functional

- User dapat membuka website melalui desktop dan mobile.
- User dapat memilih Jakarta, Yogyakarta, atau Bali.
- User dapat melihat daftar tour.
- User dapat membuka detail tour.
- Semua CTA booking/contact bekerja.
- CTA dapat mengarahkan user ke website bisnis.
- Tracking click dapat dicatat.

### Responsive

- Layout tidak rusak pada mobile.
- Navigation berjalan pada mobile.
- CTA dapat digunakan dengan touch.

### Technical

- React application berjalan production build.
- Node.js API berjalan production.
- Database terhubung.
- Error handling dasar tersedia.
- Environment configuration tersedia.

### SEO

- Semua halaman utama mempunyai title/meta description.
- Sitemap tersedia.
- robots.txt tersedia.
- URL readable.

---

## 24. Non-Functional Requirements

### Reliability

- API memiliki health check.
- Error response konsisten.
- Logging tersedia.

### Scalability

Arsitektur harus memungkinkan penambahan destinasi baru, misalnya:

- Lombok
- Bandung
- Komodo
- Flores
- Surabaya

tanpa perubahan besar pada struktur aplikasi.

### Maintainability

- TypeScript direkomendasikan.
- Component reusable.
- API layer terpisah dari UI.
- Configuration menggunakan environment variables.
- Repository menggunakan Git.

---

## 25. Suggested Project Structure

### Frontend

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── i18n/
│   ├── assets/
│   ├── utils/
│   └── main.tsx
├── public/
└── package.json
```

### Backend

```text
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── config/
│   └── server.ts
├── prisma/              # jika menggunakan Prisma
└── package.json
```

---

## 26. Environment Variables

Contoh frontend:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_BUSINESS_WEBSITE_URL=https://business.example.com
VITE_ANALYTICS_ID=xxxx
```

Contoh backend:

```env
PORT=5000
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://tour.example.com
BUSINESS_WEBSITE_URL=https://business.example.com
```

Jangan commit file `.env` ke repository.

---

## 27. Development Phases

### Phase 1 - Discovery & Design

- Finalisasi brand.
- User journey.
- Sitemap.
- Wireframe.
- UI design desktop/mobile.
- Finalisasi content structure.

### Phase 2 - Frontend MVP

- Setup React.
- Routing.
- Homepage.
- Destination pages.
- Tour pages.
- Responsive design.
- CTA integration.

### Phase 3 - Backend

- Setup Node.js/Express.
- Database.
- Destination API.
- Tour API.
- Lead tracking API.

### Phase 4 - Integration

- Connect frontend ke backend.
- External business website redirect.
- Analytics.
- SEO.

### Phase 5 - QA & Launch

- Functional testing.
- Responsive testing.
- Browser testing.
- Performance testing.
- Security review.
- Production deployment.

---

## 28. Future Development

Fitur berikut tidak wajib pada MVP, tetapi arsitektur harus siap dikembangkan:

- Online booking.
- Payment gateway.
- User account.
- Tour availability/calendar.
- Multi-language DE/EN/ID.
- WhatsApp automation.
- AI trip planner.
- Personalized itinerary.
- Admin dashboard.
- CRM integration.
- Email automation.
- Review moderation.
- Coupon/promo.
- Google Maps integration.

---

## 29. Business KPIs

KPI awal yang direkomendasikan:

- Monthly Visitors.
- Destination CTR.
- Tour Detail CTR.
- Booking CTA CTR.
- Redirect to Business Website.
- Qualified Leads.
- Booking Conversion Rate.
- Cost per Lead apabila menggunakan advertising.

North Star Metric MVP:

> **Qualified Booking/Contact Leads generated from the tour guide website.**

---

## 30. Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konten Jerman kurang natural | High | Gunakan native German copywriter/reviewer |
| Website lambat karena banyak foto | High | WebP/AVIF, responsive images, CDN, lazy loading |
| Redirect booking tidak terukur | Medium | Tracking event + UTM/query parameters |
| External website berubah | Medium | Booking URL dikelola melalui configuration/database |
| Spam lead | Medium | Rate limiting + validation |
| Open redirect vulnerability | High | Domain allowlist |
| SEO kurang optimal | Medium | SEO structure dari awal + Search Console |

---

## 31. Definition of Done

Sebuah fitur dianggap selesai ketika:

1. Requirement sudah diimplementasikan.
2. UI responsive pada mobile/tablet/desktop.
3. API tervalidasi.
4. Error state tersedia.
5. Tidak ada critical bug.
6. SEO metadata tersedia untuk halaman publik.
7. Tracking event tersedia untuk CTA utama.
8. Code sudah di-review.
9. Production build berhasil.
10. Dokumentasi setup diperbarui.

---

## 32. Recommended MVP Priorities

### P0 - Wajib

- Homepage.
- 3 destination pages.
- Tour listing.
- Tour detail.
- Responsive mobile/desktop.
- German language.
- Booking/contact redirect.
- Basic backend API.
- Database.
- SEO basic.

### P1 - Sangat Disarankan

- Analytics.
- Testimonials.
- FAQ.
- Gallery.
- Admin content management.

### P2 - Setelah MVP

- Online booking.
- Payment.
- CRM.
- Multi-language.
- AI itinerary.

---

## 33. Final Product Vision

Produk akhir adalah website travel modern untuk wisatawan Jerman yang ingin menjelajahi Indonesia melalui local tour guide.

Pengalaman yang diharapkan:

```text
DISCOVER
   ↓
Pilih Jakarta / Yogyakarta / Bali
   ↓
EXPLORE
   ↓
Lihat Tour & Experience
   ↓
TRUST
   ↓
Lihat Guide, Gallery, FAQ & Testimonial
   ↓
CONVERT
   ↓
Klik Booking / Contact
   ↓
BUSINESS WEBSITE
   ↓
LEAD / BOOKING
```

Fokus MVP bukan menjadi marketplace tour penuh, tetapi menjadi **high-converting tourism website** yang menghubungkan wisatawan Jerman dengan layanan bisnis tour guide secara jelas, cepat, dan terpercaya.
