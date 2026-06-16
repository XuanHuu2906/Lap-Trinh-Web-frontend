# LTWeb Frontend

Frontend project for the LTWeb recruitment management system. The app is built with React, TypeScript, Vite, Tailwind CSS, Axios, React Hook Form, and React Router DOM, ShadcnUI.

## 🐳 Docker

```bash
cd D:\LTWeb

# Start (lần đầu cần --build)
docker compose -f docker-compose.dev.yml up --build

# Start (lần sau)
docker compose -f docker-compose.dev.yml up

# Xem logs
docker compose -f docker-compose.dev.yml logs -f

# Xem trạng thái
docker compose -f docker-compose.dev.yml ps

# Dừng
docker compose -f docker-compose.dev.yml stop

# Dừng + xóa
docker compose -f docker-compose.dev.yml down
```

Frontend tại `http://localhost:5173`, sửa code là reload ngay (Vite HMR).

---

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

```text
LTWeb-frontend/
├── public/
│   ├── images/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── application/
│   │   ├── common/
│   │   ├── cv/
│   │   ├── dashboard/
│   │   ├── job/
│   │   └── layout/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   │   ├── admin/
│   │   ├── candidate/
│   │   ├── public/
│   │   ├── recruiter/
│   │   └── Home.tsx
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── eslint.config.js
├── index.html
├── package.json
├── system.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Folder Responsibilities

- `public/`: static files served directly by Vite.
- `src/assets/`: frontend image and static assets imported by React code.
- `src/components/`: reusable UI components grouped by domain.
- `src/pages/`: route-level pages grouped by user area.
- `src/routes/`: route configuration and route guards.
- `src/services/`: API client modules and backend integration code.
- `src/types/`: shared TypeScript types.
- `src/constants/`: app-wide constants such as roles, routes, and statuses.
- `src/hooks/`: reusable React hooks.
- `src/contexts/`: React context providers.
- `src/utils/`: shared utility functions.
- `src/styles/`: shared style entrypoints.

## Notes

The current structure is folder-first. Several folders are intentionally empty or contain `.gitkeep` placeholders so feature files can be added later without changing the planned module layout.
