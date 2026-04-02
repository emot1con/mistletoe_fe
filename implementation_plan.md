# Implementation Plan: Mistletoe Frontend (Separate Project)

Membangun frontend production-ready yang sepenuhnya terpisah dari backend sebagai standalone SPA.

---

## Backend API Analysis Summary

Berikut ini adalah ringkasan lengkap dari API backend yang harus dikonsumsi oleh frontend.

### API Endpoints

| Method | Path | Auth | Description | Request/Response Key Fields |
|--------|------|------|-------------|---------------------------|
| `GET` | `/health` | ❌ | Health check | `{ status, db }` |
| `GET` | `/auth/github` | ❌ | Redirect ke GitHub OAuth. Accepts `?redirect_url=` | Redirect 307 |
| `GET` | `/auth/github/callback` | ❌ | Callback dari GitHub. Redirect ke `redirect_url` dgn `?access_token=&refresh_token=&uid=` | Redirect atau JSON |
| `POST` | `/auth/refresh` | ❌ | Rotate JWT pair | Req: `{ refresh_token }` → Res: `{ tokens: { access_token, refresh_token, expires_in } }` |
| `GET` | `/api/v1/repositories/github` | 🔒 | List repos dari GitHub API user | `GithubRepo[]` (id, full_name, name, owner, language, html_url, private...) |
| `GET` | `/api/v1/repositories` | 🔒 | List selected repos (paginated: `?page=&limit=`) | `UserRepository[]` (id, full_name, owner, repo_name, language, is_private, github_url...) |
| `POST` | `/api/v1/repositories` | 🔒 | Select/link repo | Req: `{ github_repo_id, full_name, name, owner, description, default_branch, is_private, language, html_url }` |
| `DELETE` | `/api/v1/repositories/:id` | 🔒 | Remove selected repo | `{ message }` |
| `POST` | `/api/v1/analysis` | 🔒 | Create analysis | Req: `{ repository_id, feature_request }` → Res: `{ feature_types[], impact_score, risk_level, estimated_effort_hours[min,max], affected_components[] }` |
| `GET` | `/api/v1/analysis/:id` | 🔒 | Get analysis result | Same as above |
| `GET` | `/api/v1/repositories/:id/analyses` | 🔒 | List analysis history (paginated) | `AnalysisRequest[]` (id, repository_id, feature_request_text, status, created_at) |

### Auth Flow (untuk Frontend)
1. FE redirect ke `GET /auth/github?redirect_url=<FE_CALLBACK_URL>`
2. Backend redirect ke GitHub → user authorize → GitHub callback ke backend
3. Backend redirect ke FE: `<redirect_url>?access_token=...&refresh_token=...&uid=...`
4. FE simpan tokens, gunakan `Authorization: Bearer <access_token>` untuk semua `/api/v1/*`
5. Jika 401 → call `POST /auth/refresh` → retry

### Domain Models (Key Fields for UI)

```
User:          id, email, username, display_name, avatar_url
UserRepository: id, full_name, owner, repo_name, language, is_private, github_url, selected_at
AnalysisRequest: id, repository_id, feature_request_text, status, created_at
AnalysisResult:  feature_types[], impact_score (0-10), risk_level (low/medium/high), 
                 estimated_effort_min_hours, estimated_effort_max_hours, affected_components[]
```

---

## User Review Required

> [!IMPORTANT]
> **Pilihan Technology Stack Frontend**
> 
> Saya merekomendasikan **Vite + React + TypeScript** untuk frontend terpisah ini karena:
> - Type safety untuk kontrak API yang sudah jelas
> - Ekosistem routing (React Router) dan state management yang mature
> - Hot reload cepat untuk development
> - Build output statis → bisa deploy ke CDN/Vercel/Netlify
> 
> Apakah Anda setuju, atau ada preferensi lain (Next.js, Vue, Svelte)?

> [!IMPORTANT]
> **CORS Configuration**
> 
> Backend perlu ditambahkan CORS middleware agar frontend di domain/port berbeda bisa mengakses API. Ini akan menjadi satu perubahan kecil di backend [router.go](file:///home/numpyh/Documents/github_project/mistletoe/internal/api/router.go).

---

## Proposed Changes

### Project: `mistletoe_fe` (Separate Frontend)

Location: `/home/numpyh/Documents/github_project/mistletoe_fe`

#### Project Structure

```
mistletoe_fe/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env                          # VITE_API_BASE_URL=http://localhost:8090
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                  # Entry point
    ├── App.tsx                   # Root component + Router
    ├── vite-env.d.ts
    │
    ├── api/                      # API layer
    │   ├── client.ts             # Axios/fetch wrapper with JWT interceptor + auto-refresh
    │   └── endpoints.ts          # Typed API functions (getRepos, createAnalysis, etc.)
    │
    ├── auth/                     # Authentication
    │   ├── AuthProvider.tsx       # React Context for auth state
    │   ├── ProtectedRoute.tsx    # Route guard component
    │   └── CallbackPage.tsx      # Handles /auth/callback?access_token=...
    │
    ├── types/                    # TypeScript interfaces mirroring backend models
    │   └── index.ts              # User, UserRepository, AnalysisRequest, AnalysisResult, GithubRepo
    │
    ├── pages/                    # Route-level page components
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── RepositoriesPage.tsx  # List selected repos + connect new
    │   ├── AnalysisNewPage.tsx   # Form to submit analysis
    │   ├── AnalysisResultPage.tsx # View single result
    │   └── AnalysisHistoryPage.tsx # History per repo
    │
    ├── components/               # Reusable UI components
    │   ├── layout/
    │   │   ├── AppLayout.tsx     # Sidebar + Header + Content shell
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Loader.tsx
    │   │   ├── Toast.tsx
    │   │   └── Modal.tsx
    │   ├── analysis/
    │   │   ├── ImpactScoreGauge.tsx   # Visual gauge 0-10
    │   │   ├── RiskBadge.tsx          # Color-coded risk badge
    │   │   ├── EffortRange.tsx        # Min-Max hour display
    │   │   └── ComponentsList.tsx     # Affected components chips
    │   └── repositories/
    │       ├── RepoCard.tsx
    │       └── GithubRepoSelector.tsx # Modal to link repos from GitHub
    │
    └── styles/
        ├── globals.css            # CSS variables, reset, typography
        └── components.css         # Component-specific styles
```

---

### Backend Change: CORS Middleware

#### [MODIFY] [router.go](file:///home/numpyh/Documents/github_project/mistletoe/internal/api/router.go)

Tambahkan CORS middleware agar frontend di port/domain berbeda bisa mengakses API:

```go
import "github.com/gin-contrib/cors"

// Di SetupRoutes, sebelum route definitions:
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:5173", "https://your-production-domain.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    AllowCredentials: true,
}))
```

---

## Pages & UI Features

| Page | Route | Key Features |
|------|-------|-------------|
| **Login** | `/login` | Premium landing + "Login with GitHub" button |
| **Auth Callback** | `/auth/callback` | Parse tokens from URL → store → redirect dashboard |
| **Dashboard** | `/` | Overview: repo count, recent analyses, quick action buttons |
| **Repositories** | `/repositories` | Card grid of selected repos, "Connect New" button → GitHub selector modal |
| **New Analysis** | `/analysis/new` | Select repo dropdown + feature request textarea + submit |
| **Analysis Result** | `/analysis/:id` | Impact gauge, risk badge, effort range bar, component chips |
| **History** | `/repositories/:id/history` | Paginated table of past analyses for a repo |

---

## Verification Plan

### Automated Tests
1. `npm run build` — memastikan TypeScript compiles clean
2. `npm run dev` — verifikasi hot reload berjalan
3. Browser test: Login flow → Dashboard → Connect repo → Run analysis → View result

### Manual Verification
1. Pastikan CORS berfungsi antara `localhost:5173` (Vite) ↔ `localhost:8090` (Go)
2. Verifikasi silent token refresh saat access token expired
3. Test responsive layout di mobile viewport
