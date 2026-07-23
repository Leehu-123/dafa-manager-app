# DAFA Glass Manager

Hệ thống quản lý công việc & KPI nội bộ cho **DAFA Glass** — doanh nghiệp kính xây dựng.

## 🚀 Quick Start

### Yêu cầu
- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Cài đặt

```bash
# Clone và cài dependencies
npm install

# Chạy setup tự động (bao gồm Docker, migration, seed)
setup.bat
```

Hoặc chạy từng bước:

```bash
# 1. Khởi động PostgreSQL
docker compose up -d

# 2. Generate Prisma Client
npx prisma generate

# 3. Chạy migration
npx prisma migrate dev --name init

# 4. Seed dữ liệu demo
npx prisma db seed

# 5. Chạy dev server
npm run dev
```

### Đăng nhập
- **URL:** http://localhost:3000
- **Email:** `admin@dafaglass.com`
- **Password:** `dafa2024`

## 📋 Tính năng

| Module | Mô tả |
|--------|-------|
| 🔐 Auth | Đăng nhập bằng email/password, phân quyền 3 cấp |
| 📊 Dashboard | Tổng quan KPI, công việc, nhân sự theo role |
| ✅ Tasks | Quản lý công việc (List + Kanban), comments, history |
| 📈 KPI | Đánh giá KPI theo tiêu chí, charts, export Excel/PDF |
| 📝 Reports | Báo cáo công việc theo template, workflow duyệt |
| 🏢 Organization | Sơ đồ tổ chức, quản lý nhân sự |

## 🏗️ Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + TailwindCSS v4
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL 16 (Docker)
- **Auth:** NextAuth.js v5

## 👥 Tài khoản demo

| Email | Password | Role | Phòng ban |
|-------|----------|------|-----------|
| admin@dafaglass.com | dafa2024 | Admin | - |
| bich.tran@dafaglass.com | dafa2024 | Employee | KT-HCNS |
| duc.le@dafaglass.com | dafa2024 | Employee | Media |
| huong.pham@dafaglass.com | dafa2024 | Employee | MKT-SA |
| thanh.nguyen@dafaglass.com | dafa2024 | Manager | Kho vận |
| dung.hoang@dafaglass.com | dafa2024 | Employee | Kho vận |
| khoa.vu@dafaglass.com | dafa2024 | Employee | Kinh doanh |

## 📁 Scripts

```bash
npm run dev          # Chạy dev server
npm run build        # Build production
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Chạy migration
npm run db:seed      # Seed dữ liệu
npm run db:studio    # Mở Prisma Studio (GUI)
npm run db:reset     # Reset database
```

## 📄 License

Private - DAFA Glass © 2024
