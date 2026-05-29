# 🍜 SPK Ngacoan - Frontend Web Application (Vue 3 + Vite)

Repositori ini berisi kode sumber aplikasi *frontend* berbasis web untuk Sistem Pendukung Keputusan (SPK) pemilihan supplier terbaik pada ekosistem bisnis Mie Ngacoan. Aplikasi ini dibangun menggunakan **Vue 3 (Composition API)** dan **Vite**, serta terhubung secara *decoupled* menggunakan Axios menuju *backend* API Laravel 11.

---

## 🚀 Fitur Utama & Antarmuka Pengguna

### 1. Panel SPK & Visualisasi EDAS
- **Matriks Evaluasi Dinamis:** Antarmuka pengisian nilai aktual kriteria secara massal (*bulk input*) yang responsif dan dilengkapi validasi instan.
- **Transparansi Perhitungan:** Menampilkan lembar kerja matriks perantara matematika (AV, PDA, NDA, SP/SN) hingga hasil akhir *Appraisal Score* (AS) secara rahasia dan detail.
- **Peringkat Supplier:** Visualisasi hasil rekomendasi supplier terbaik yang diurutkan secara otomatis berdasarkan skor tertinggi.

### 2. Manajemen Akses & Autentikasi Multi-Role
- **Sesi Stateful:** Integrasi keamanan login dengan Laravel Sanctum menggunakan token pembawa (*Bearer Token*).
- **Gating Antarmuka:** Perubahan menu navigasi dan hak akses halaman secara dinamis berdasarkan peran pengguna (**Owner** atau **Pengelola**).
- **Forgot Password Terintegrasi:** Form pemulihan kata sandi yang terhubung dengan sistem verifikasi 6-digit kode OTP backend.

---

## 🛠️ Stack Teknologi Frontend

- **Framework Inti:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Routing:** Vue Router (History Mode)
- **State Management:** Pinia
- **HTTP Client:** Axios
- **CSS Framework:** Tailwind CSS + shadcn
- **Deployment Platform:** Vercel

---

## 📦 Langkah Instalasi Lokal

Ikuti panduan berikut untuk menjalankan proyek *frontend* di komputer lokal Anda:

### 1. Klon Repositori
```bash
git clone https://github.com/fbari687/spk-ngacoan-frontend
cd spk-ngacoan-frontend
```

### 2. Instalasi Dependensi Node Modules
```bash
npm install
```

### 3. Konfigurasi Environment File
Buat file bernama .env di akar folder proyek:
```bash
BASE_URL="/"
VITE_API_BASE_URL="http://127.0.0.1:8000/api/v1"
```

### 4. Jalankan Server Development Lokal
```bash
npm run dev
```

Aplikasi kini dapat diakses secara lokal melalui tautan default dari Vite: http://localhost:5173

---
