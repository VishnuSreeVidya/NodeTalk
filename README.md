<div align="center">

# NodeTalk

**A real-time, end-to-end encrypted messaging & video calling web platform**

[![CI](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml/badge.svg)](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?logo=webrtc&logoColor=white)](https://webrtc.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Live Demo](https://nodetalk-sli6.onrender.com/) · [Report Bug](https://github.com/VishnuSreeVidya/NodeTalk/issues) · [Request Feature](https://github.com/VishnuSreeVidya/NodeTalk/issues)

</div>

---

## ⚡ Overview

**NodeTalk** is a modern, full-stack real-time communication platform built with React 19, Supabase, and WebRTC. It combines military-grade end-to-end encryption with peer-to-peer audio/video streaming, rich group messaging, custom theme support, and responsive mobile viewport optimizations.

---

## ✨ Key Features

- **🔐 End-to-End Encryption**: Secure 1-on-1 chats powered by Web Crypto API (AES-256-GCM + ECDH P-256 key exchange). Zero plaintext saved on servers.
- **🛡️ 100,000 PBKDF2 Key Derivation**: High-entropy passphrase derivation (`100,000` iterations) for user key backup security with automatic legacy migration.
- **📱 Dynamic Mobile Viewport (`100dvh`)**: Mobile layout auto-adjusts to dynamic mobile toolbars (`100dvh`) with responsive drawer back navigation (`←`) and `min-w-0` flexbox safeguards.
- **⚡ Real-time Messaging & Typing Indicators**: Instant delivery, read receipts, online status, and animated typing indicators with username labels (`User is typing...`).
- **📞 Audio & Video Calls**: WebRTC P2P audio/video calling with global offer broadcasting (`calls-global`) and pair channel signaling for instant ringing overlays.
- **📸 Client-Side Media Compression**: Automatic image resizing (up to 1600x1600) and WebP conversion before uploading attachments to Supabase Storage.
- **👥 Group Messaging**: Multi-member rooms with role management (Admin, Moderator, Member).
- **📁 Media & File Sharing**: Image previews, voice notes, document sharing, and organized media gallery.
- **🎨 6 Color Themes**: Midnight, Graphite, Ocean, Forest, Light Pro, and AMOLED modes.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS, Framer Motion |
| **Backend & DB** | Supabase (PostgreSQL, Row Level Security, Auth, Storage) |
| **Real-time** | Supabase Realtime (WebSocket channels, `postgres_changes`) |
| **Encryption** | Web Crypto API (ECDH P-256 key exchange, AES-256-GCM, PBKDF2 100k) |
| **Calls & Media** | WebRTC (RTCPeerConnection), MediaRecorder API, HTML5 Canvas WebP Compressor |
| **Testing & CI** | Vitest (58 test suites passed), Testing Library, GitHub Actions, ESLint |

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User["User Browser / Mobile Client"]
    ReactApp["React 19 App (Vite 8)"]

    subgraph SupabaseCloud["Supabase Cloud"]
        Auth["Supabase Auth (JWT)"]
        Database["PostgreSQL (Row Level Security)"]
        Realtime["Supabase Realtime (WebSockets)"]
        Storage["Supabase Storage"]
    end

    subgraph ClientAPIs["Client Security, Calls & Media"]
        Crypto["Web Crypto API (E2EE AES-256-GCM + 100k PBKDF2)"]
        WebRTC["WebRTC (P2P Audio / Video Signaling)"]
        Compressor["Canvas Image WebP Compressor"]
    end

    User --> ReactApp
    ReactApp --> Auth
    ReactApp --> Database
    ReactApp <--> Realtime
    ReactApp --> Storage
    ReactApp --> Crypto
    ReactApp --> Compressor
    ReactApp <--> WebRTC
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18+` recommended
- **npm**
- A **Supabase** project account

### Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/VishnuSreeVidya/NodeTalk.git
   cd NodeTalk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env` file in root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Database Setup**
   Run SQL scripts from root in your Supabase SQL Editor sequentially (`supabase-schema.sql` → `supabase-migration-v2.sql` ... `v9.sql`).

5. **Start Dev Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Commands & Testing

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Production build with code splitting |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite with Vitest (58 tests) |
| `npm run lint` | Run ESLint audit |

---

## ⌨️ Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Search messages / contacts |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | New conversation |
| <kbd>Esc</kbd> | Close active modal / panel |
| <kbd>Enter</kbd> | Send message |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">
  Built by <b><a href="https://github.com/VishnuSreeVidya">Vishnu Sree Vidya Kotturu</a></b>
</div>
