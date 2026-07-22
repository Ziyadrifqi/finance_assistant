# AI Personal Finance Assistant

Aplikasi web untuk mencatat keuangan, menganalisis pola pengeluaran,
memprediksi pengeluaran, dan memberikan rekomendasi anggaran berbasis
Machine Learning.

## Target Pengguna

- Mahasiswa
- Karyawan
- Freelancer
- UMKM

## Tech Stack

### Frontend

- Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- TanStack Query, Axios, React Hook Form, Zod, Recharts

### Backend

- Java 21, Spring Boot 3, Spring Security, Spring Data JPA (Hibernate)
- JWT, Gradle, OpenAPI/Swagger

### Machine Learning

- Python, FastAPI, scikit-learn, pandas, numpy, joblib
- Isolation Forest (deteksi anomali), Random Forest Regressor (prediksi)

### Database & Infra

- PostgreSQL
- MinIO (opsional, untuk upload struk)
- Redis (opsional, caching)
- Docker, Docker Compose, GitHub Actions, Nginx

## Struktur Proyek

finance_assistant/
├── frontend/ # Next.js app
├── backend/ # Spring Boot app
├── ml-service/ # FastAPI ML service
├── database/ # migration & seed SQL
├── docker-compose.yml
└── README.md

## Roadmap

**MVP**: Auth, CRUD transaksi, Dashboard
**V2**: Budget, Prediksi pengeluaran, Deteksi anomali
**V3**: OCR struk, Financial health score, Insight AI, CI/CD

## Cara Menjalankan (akan dilengkapi bertahap di setiap tahap pengembangan)

Lihat README di masing-masing folder (`frontend/`, `backend/`, `ml-service/`)
untuk instruksi setup spesifik.
