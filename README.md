
# TraderGrail - AI Trading Platform

This is a Next.js application built with:
- **Framework**: Next.js 14+ (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **Backend/Auth**: Supabase (configured for Google Auth)
- **i18n**: next-intl (English & Spanish/MX)
- **PWA**: Fully installable Progressive Web App

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

### 2. Installation

```bash
npm install
```

### 3. Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 🌍 Internationalization

The app supports English (`/en`) and Mexican Spanish (`/es-mx`).
- Default route `/` redirects based on browser settings.
- Edit translations in `messages/en.json` and `messages/es-mx.json`.

## 📱 PWA Support

The app is configured as a PWA. The service worker is generated during `npm run build`.
Manifest file is located at `public/manifest.json`.

## 🔐 Authentication

Configured for Supabase Auth with Google Provider.
Ensure you have enabled Google Provider in your Supabase Dashboard and added the redirect URL:
`https://your-domain.com/auth/callback` (or `http://localhost:3000/auth/callback` for dev).

## 🧠 Brain Logic

See [BRAIN.md](BRAIN.md) for the architectural deep dive and future implementation roadmap for the AI components.
