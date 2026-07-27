<div align="center">

# NodeTalk

**A production-grade real-time messaging platform**

[![CI](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml/badge.svg)](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)

[Live Demo](https://nodetalk-sli6.onrender.com/) · [Report Bug](https://github.com/VishnuSreeVidya/NodeTalk/issues) · [Request Feature](https://github.com/VishnuSreeVidya/NodeTalk/issues)

</div>

---

NodeTalk is a feature-rich messaging application with end-to-end encryption, real-time messaging, audio/video calls, group chats, and a fully responsive glassmorphism UI. Built with React, Vite 8, Supabase, and WebRTC.

## Features

<details>
<summary><strong>Messaging</strong></summary>

- **Real-time delivery** via Supabase Realtime with postgres_changes subscriptions
- **End-to-end encryption** using AES-256-GCM with ECDH P-256 key exchange (Web Crypto API)
- **Edit & delete** messages for yourself or everyone
- **Pin messages** for quick access in DMs and groups
- **Star messages** for personal bookmarks
- **Threaded replies** with quote-preview blocks
- **Message reactions** with emoji
- **Date separators** between message groups
- **Markdown rendering** (bold, italic, inline code, code blocks)

</details>

<details>
<summary><strong>Search</strong></summary>

- **Global search** across all users and messages with debounced input
- **In-conversation search** to find messages within a specific chat

</details>

<details>
<summary><strong>Read Receipts</strong></summary>

- ✓ Single tick (gray) — message sent
- ✓✓ Double tick (gray) — message delivered
- ✓✓ Double tick (accent) — message read
- Realtime updates via Supabase Realtime

</details>

<details>
<summary><strong>Group Chats</strong></summary>

- Create groups with multiple members
- Real-time group messaging with member management
- Typing indicators for groups
- Pin messages within groups

</details>

<details>
<summary><strong>File Sharing & Media</strong></summary>

- Share any file type (documents, archives, audio, video)
- Image sharing with preview
- Voice messages with live duration indicator
- Media gallery with 4 tabs (media, files, links, voice) and fullscreen preview

</details>

<details>
<summary><strong>Calls</strong></summary>

- Audio and video calls via WebRTC (peer-to-peer)
- Screen sharing during video calls
- Call duration timer
- Noise suppression via AudioContext
- Real-time network quality indicator
- Camera switch (front/rear)

</details>

<details>
<summary><strong>User Experience</strong></summary>

- Online presence with last seen timestamps
- Typing indicators (DM and group)
- Built-in emoji picker
- Profile editor (username, status, avatar)
- Settings panel (notifications, privacy, read receipts, enter-to-send)
- In-app notification bell with unread count
- Skeleton loading states
- Responsive design (desktop, tablet, mobile)

</details>

<details>
<summary><strong>Themes</strong></summary>

| Theme | Description |
|-------|-------------|
| Glass Dark | Elegant frosted-glass interface |
| Vibrant Amethyst | Purple gradient with glowing effects |
| Retro Cyberpunk | Neon-inspired cyberpunk aesthetic |

</details>

<details>
<summary><strong>Accessibility</strong></summary>

- Keyboard focus trapping in modals and dropdowns
- Screen reader support with live regions and ARIA alerts
- Keyboard shortcuts (`Ctrl+K` search, `Ctrl+N` new chat, `Escape` close)
- Full ARIA labeling on interactive elements

</details>

<details>
<summary><strong>Progressive Web App</strong></summary>

- Installable on mobile and desktop
- Service worker with offline caching for static assets
- Full PWA manifest with icons and theme color

</details>

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Client (React + Vite)"]
        direction TB
        UI["UI Layer<br/>Components · Hooks · Context"]
        Services["Service Layer<br/>messageService · groupService · userService · notificationService"]
        Lib["Lib Layer<br/>utils · constants · logger · env · validation · crypto"]
        Shared["Shared UI<br/>Avatar · Button · Modal · Skeleton · LiveRegion"]
    end

    subgraph Features["Feature Modules"]
        Search["search/<br/>SearchPanel · useSearch"]
        Chat["chat/<br/>MediaGallery · ChatSearchBar · useStarMessages"]
        Groups["groups/<br/>GroupChatWindow · CreateGroupModal"]
        Calls["calls/<br/>useCallEnhancements"]
        Settings["settings/<br/>SessionManager"]
    end

    subgraph Supabase["Supabase Backend"]
        Auth["Auth<br/>Authentication · Session"]
        DB["PostgreSQL<br/>RLS Policies · Indexes · Functions"]
        Storage["Storage<br/>chat-images bucket"]
        Realtime["Realtime<br/>postgres_changes · broadcast"]
    end

    subgraph External["External APIs"]
        WebRTC["WebRTC<br/>Audio · Video · Screen Share"]
        WebCrypto["Web Crypto API<br/>ECDH + AES-256-GCM"]
        MediaRec["MediaRecorder<br/>Voice Messages"]
    end

    UI --> Services
    UI --> Features
    Features --> Services
    Services --> Auth
    Services --> DB
    Services --> Storage
    Services --> Realtime
    UI --> WebRTC
    UI --> WebCrypto
    UI --> MediaRec
    Lib --> Services
    Shared --> UI

    style Client fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style Features fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style Supabase fill:#0a3d62,stroke:#38ada9,stroke-width:2px,color:#fff
    style External fill:#2c2c54,stroke:#706fd3,stroke-width:2px,color:#fff
```

```mermaid
graph LR
    subgraph Flow["Message Flow"]
        A["User types message"] --> B["MessageInput"]
        B --> C["E2EE encrypt<br/>(Web Crypto)"]
        C --> D["messageService<br/>.sendDMMessage()"]
        D --> E["Supabase DB<br/>(INSERT)"]
        E --> F["Realtime broadcast"]
        F --> G["Receiver gets message<br/>(postgres_changes)"]
        G --> H["Decrypt + render"]
    end

    subgraph CallFlow["Call Flow"]
        I["User initiates call"] --> J["WebRTC setup<br/>(RTCPeerConnection)"]
        J --> K["Signaling via<br/>Supabase broadcast"]
        K --> L["ICE candidates<br/>SDP exchange"]
        L --> M["P2P audio/video<br/>established"]
    end

    style Flow fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style CallFlow fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
```

---

## Tech Stack

<div align="center">

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 19 · Vite 8 · Tailwind CSS 3 · Framer Motion |
| **Backend** | Supabase (PostgreSQL · Auth · Storage · Realtime) |
| **Realtime** | Supabase Realtime (postgres_changes + broadcast channels) |
| **Encryption** | Web Crypto API (ECDH P-256 + AES-256-GCM) |
| **Calls** | WebRTC (RTCPeerConnection) |
| **Recording** | MediaRecorder API |
| **Testing** | Vitest · Testing Library · jsdom |
| **CI/CD** | GitHub Actions (lint → build → test) |

</div>

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- A [Supabase](https://supabase.com) project (Free Tier supported)

### Installation

```bash
# Clone the repository
git clone https://github.com/VishnuSreeVidya/NodeTalk.git
cd NodeTalk

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

Open the Supabase SQL Editor and run these files **in order**:

| Order | File | What it creates |
|:-----:|:-----|:----------------|
| 1 | `supabase-schema.sql` | Profiles, Messages, User Keys, Reactions, RLS Policies, Triggers |
| 2 | `supabase-migration-v2.sql` | Groups, Group Members, Notifications, Call History, Settings |
| 3 | `supabase-migration-v3.sql` | File sharing columns (file_url, file_name, file_type, file_size) |
| 4 | `supabase-migration-v4.sql` | Read receipts (read_at column + index) |
| 5 | `supabase-migration-v5.sql` | 9 indexes, 5 DB functions, new columns, conversation_summary view |

### Storage Setup

Create a public storage bucket named `chat-images` in Supabase Storage, or run the Storage SQL at the bottom of `supabase-schema.sql`.

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build with code splitting |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |

---

## Project Structure

```
NodeTalk/
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
│
├── src/
│   ├── components/
│   │   ├── shared/                # Reusable components
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── DateSeparator.jsx
│   │   │   ├── MessageContextMenu.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── Auth.jsx
│   │   ├── CallHandler.jsx        # WebRTC call management
│   │   ├── ChatWindow.jsx         # DM chat (lazy-loaded)
│   │   ├── ErrorBoundary.jsx      # Error boundary with logging
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── Sidebar.jsx            # User list + groups (lazy-loaded)
│   │   └── VoiceRecorder.jsx
│   │
│   ├── features/
│   │   ├── calls/hooks/           # Noise suppression, PiP, network quality
│   │   ├── chat/                  # Search, media gallery, star messages
│   │   ├── groups/                # Group chat + create modal
│   │   ├── search/                # Global search panel
│   │   └── settings/              # Multi-device session manager
│   │
│   ├── hooks/
│   │   ├── useFocusTrap.js        # Modal focus trapping
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useRealtimeSubscription.js
│   │   └── useSupabaseChannel.js
│   │
│   ├── lib/
│   │   ├── constants.js           # App-wide constants
│   │   ├── env.js                 # Env validation + config
│   │   ├── logger.js              # Structured logging
│   │   └── utils.js
│   │
│   ├── services/                  # Service layer (API/DB logic)
│   │   ├── messageService.js
│   │   ├── groupService.js
│   │   ├── notificationService.js
│   │   └── userService.js
│   │
│   ├── test/setup.js              # Test mocks
│   ├── ui/                        # Shared UI primitives
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── LiveRegion.jsx         # Screen reader announcements
│   │   ├── Modal.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── utils/
│   │   ├── crypto.js              # E2EE encryption/decryption
│   │   └── validation.js          # Input sanitization
│   │
│   ├── App.jsx                    # Root with lazy loading + Suspense
│   ├── main.jsx                   # Entry with env validation
│   └── index.css
│
├── .github/workflows/ci.yml       # CI pipeline
├── supabase-schema.sql
├── supabase-migration-v2.sql
├── supabase-migration-v3.sql
├── supabase-migration-v4.sql
├── supabase-migration-v5.sql
├── vitest.config.js
├── eslint.config.js
├── vite.config.js
└── package.json
```

---

## Code Splitting

The production build is split into 16 optimized chunks:

| Chunk | Size (gzip) | Contents |
|:------|:------------|:---------|
| `react-vendor` | 57 KB | React + ReactDOM |
| `supabase` | 51 KB | Supabase client |
| `framer` | 43 KB | Framer Motion |
| `messageService` | 9 KB | Message service layer |
| `Sidebar` | 8 KB | Sidebar component |
| `date-fns` | 6 KB | Date utilities |
| `index` | 5 KB | App entry |
| `ChatWindow` | 4 KB | DM chat window |
| `CallHandler` | 3 KB | Call handling |
| `GroupChatWindow` | 3 KB | Group chat window |
| + 6 more | — | Auth, ThemeSelector, Avatar, Search, etc. |

---

## Testing

```bash
npm run test
```

36 tests across 3 suites:

| Suite | Tests | Description |
|:------|:------|:------------|
| `src/lib/__tests__/utils.test.js` | 29 | Utility functions |
| `src/ui/__tests__/Button.test.jsx` | 5 | Button component |
| `src/hooks/__tests__/useDebounce.test.js` | 2 | Debounce hook |

---

## CI/CD

GitHub Actions pipeline runs on every push and pull request to `master`/`main`:

```
Lint → Build → Test
```

- **Lint** — ESLint with zero errors
- **Build** — Vite production build with code splitting
- **Test** — Vitest test suite

---

## Keyboard Shortcuts

| Shortcut | Action |
|:---------|:-------|
| `Ctrl + K` | Open search |
| `Ctrl + N` | New chat |
| `Escape` | Close modal/panel |
| `Enter` | Send message |
| `Shift + Enter` | New line |

---

## Security

- **Authentication** — Supabase Auth with protected routes
- **RLS** — Row Level Security on all database tables
- **E2EE** — AES-256-GCM + ECDH P-256 (server never sees plaintext)
- **Validation** — Input sanitization on all user inputs
- **Storage** — Secured file storage with access policies
- **Env** — Environment variable validation on startup
- **Logging** — Structured error logging (no secrets exposed)

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run checks before committing:
   ```bash
   npm run lint && npm run test && npm run build
   ```
5. Commit with a descriptive message
6. Push to your branch and open a Pull Request

---

## License

This project is licensed under the MIT License.

---

<div align="center">

**Built by [Vishnu Sree Vidya Kotturu](https://github.com/VishnuSreeVidya)**

If this project helped you, consider giving it a ⭐

</div>
