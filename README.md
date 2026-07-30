<div align="center">

# NodeTalk

**A real-time end-to-end encrypted messaging platform**

[![CI](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml/badge.svg)](https://github.com/VishnuSreeVidya/NodeTalk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?logo=webrtc&logoColor=white)](https://webrtc.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)](https://framer.com/motion)

[Live Demo](https://nodetalk-sli6.onrender.com/) · [Report Bug](https://github.com/VishnuSreeVidya/NodeTalk/issues)

</div>

---

NodeTalk is a secure real-time messaging platform with end-to-end encryption, audio/video calls, group chats, and file sharing. Built with React, Supabase, and WebRTC, it demonstrates modern full-stack engineering practices including real-time data synchronization, cryptographic key exchange, and responsive UI design.

## Highlights

- **End-to-end encryption** &mdash; AES-256-GCM with ECDH P-256 key exchange
- **Real-time messaging** &mdash; Sub-second delivery via Supabase Realtime
- **Audio & video calls** &mdash; Peer-to-peer WebRTC with screen sharing
- **Group chats** &mdash; Multi-member rooms with role management
- **File sharing** &mdash; Images, documents, voice messages with inline preview
- **6 themes** &mdash; Midnight, Graphite, Ocean, Forest, Light Pro, AMOLED
- **Read receipts** &mdash; Sent, delivered, and read status
- **Progressive Web App** &mdash; Installable with offline caching
- **Responsive design** &mdash; Desktop, tablet, and mobile layouts
- **Accessibility** &mdash; ARIA labels, focus trapping, keyboard shortcuts

---

## Table of Contents

- [Screenshots](#screenshots)
- [Demo](#demo)
- [Messaging](#messaging)
- [Calls](#calls)
- [Media](#media)
- [Security](#security)
- [User Experience](#user-experience)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Testing](#testing)
- [Code Splitting](#code-splitting)
- [Why I Built NodeTalk](#why-i-built-nodetalk)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---



## Messaging

| Feature | Details |
|---------|---------|
| Real-time delivery | Supabase Realtime with `postgres_changes` subscriptions |
| End-to-end encryption | AES-256-GCM with ECDH P-256 key exchange (Web Crypto API) |
| Edit & delete | Modify or remove messages for yourself or everyone |
| Pin messages | Persistent pins in DMs and groups |
| Star messages | Personal bookmarks per user |
| Threaded replies | Quote-preview blocks with context |
| Reactions | Emoji reactions with real-time sync |
| Read receipts | Sent (single tick), delivered (double tick gray), read (double tick accent) |
| Date separators | Automated dividers between message groups |
| Markdown rendering | Bold, italic, inline code, and fenced code blocks |

### Search

- **Global search** &mdash; Across all users and messages with debounced input
- **In-conversation search** &mdash; Filter within a specific chat
- **Filter by type** &mdash; Messages, images, files, and voice notes

### Groups

- Create groups with multiple members and role-based permissions (admin, moderator, member)
- Real-time group messaging with independent message channels
- Typing indicators per group member
- Pin messages within groups
- Mute individual groups

---

## Calls

| Feature | Details |
|---------|---------|
| Audio calls | Peer-to-peer via WebRTC |
| Video calls | Peer-to-peer with front/rear camera switch |
| Screen sharing | Share entire screen or application window |
| Noise suppression | Real-time filtering via AudioContext |
| Network quality | Live indicator during active calls |
| Call timer | Duration display during calls |
| Call history | Persistent log of missed, answered, and declined calls |

---

## Media

| Feature | Details |
|---------|---------|
| File upload | Any file type with type and size validation |
| Image sharing | Upload with lazy-loaded preview and fullscreen view |
| Voice messages | Record via MediaRecorder API with live duration indicator |
| Media gallery | Four tabs (media, files, links, voice) with fullscreen preview |
| Inline playback | Audio and video players within chat bubbles |

---

## Security

- **Authentication** &mdash; Supabase Auth with JWT sessions and auto-refresh
- **Row Level Security** &mdash; RLS policies on all tables (profiles, messages, groups, notifications, settings)
- **End-to-end encryption** &mdash; Private keys stored in IndexedDB; server never sees plaintext
- **Input validation** &mdash; Sanitization on all user inputs
- **XSS prevention** &mdash; No `innerHTML` usage; safe React rendering patterns
- **Environment validation** &mdash; Required variables checked at startup
- **Structured logging** &mdash; No secrets or sensitive data exposed in logs

---

## User Experience

| Feature | Details |
|---------|---------|
| Themes | 6 professionally crafted themes (Midnight, Graphite, Ocean, Forest, Light Pro, AMOLED) |
| Animations | Page transitions, hover effects, and micro-interactions via Framer Motion |
| Online presence | Real-time status with last seen timestamps |
| Typing indicators | Per-user and per-group typing status |
| Emoji picker | Built-in grid for message reactions and composition |
| Profile editor | Username, bio, status message, avatar upload |
| Settings panel | Notifications, privacy, read receipts, enter-to-send toggle |
| Notification bell | In-app dropdown with unread count and mark-as-read |
| Skeleton loading | Placeholder states during data fetches |
| Responsive layout | Adaptive sidebar collapse, mobile hamburger menu, overlay panels |
| Keyboard shortcuts | `Ctrl+K` search, `Ctrl+N` new chat, `Escape` close |

### Accessibility

- ARIA labels on all interactive elements
- Focus trapping in modals, dropdowns, and dialogs
- Live regions for screen reader announcements
- Keyboard-navigable with visible focus indicators

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Real-time** | Supabase Realtime (postgres_changes, broadcast channels) |
| **Encryption** | Web Crypto API (ECDH P-256, AES-256-GCM) |
| **Calls** | WebRTC (RTCPeerConnection, getDisplayMedia) |
| **Recording** | MediaRecorder API (audio/webm; codecs=opus) |
| **Testing** | Vitest, Testing Library, jsdom |
| **CI/CD** | GitHub Actions (lint, build, test) |

---

## Architecture

### Overall System Architecture

```mermaid
graph TB
    subgraph Browser["User Browser"]
        direction TB

        subgraph ReactApp["React Application (Vite 8 + Rolldown)"]
            direction TB

            subgraph Presentation["Presentation Layer"]
                direction LR
                App["App.jsx<br/>Lazy Loading · Suspense"]
                Sidebar["Sidebar<br/>User List · Groups · Tabs"]
                ChatWindow["ChatWindow<br/>DM Messages"]
                GroupChat["GroupChatWindow<br/>Group Messages"]
                CallHandler["CallHandler<br/>WebRTC Calls"]
                Auth["Auth<br/>Login · Signup"]
            end

            subgraph Components["Component Layer"]
                direction LR
                MsgInput["MessageInput<br/>Text · Emoji · Files"]
                MsgBubble["MessageBubble<br/>Messages · Reactions"]
                MsgCtx["MessageContextMenu<br/>Right-Click Actions"]
                ChatHeader["ChatHeader<br/>Info · Actions"]
                NotifBell["NotificationBell<br/>Unread Badge"]
                SettingsModal["SettingsModal<br/>User Preferences"]
                ProfileModal["ProfileModal<br/>Profile Editor"]
                TypingInd["TypingIndicator<br/>Typing Dots"]
                DateSep["DateSeparator<br/>Date Dividers"]
            end

            subgraph Features["Feature Modules"]
                direction LR
                SearchFeat["search/<br/>SearchPanel · useSearch"]
                ChatFeat["chat/<br/>MediaGallery · ChatSearchBar · useStarMessages"]
                CallsFeat["calls/<br/>useCallEnhancements"]
                GroupsFeat["groups/<br/>GroupChatWindow · CreateGroupModal"]
                SettingsFeat["settings/<br/>SessionManager"]
            end

            subgraph Hooks["Custom Hooks"]
                direction LR
                WebRTC["useWebRTC<br/>Peer Connection"]
                SupabaseCh["useSupabaseChannel<br/>Channel Mgmt"]
                RealtimeSub["useRealtimeSubscription<br/>postgres_changes"]
                Keyboard["useKeyboardShortcuts<br/>Ctrl+K · Ctrl+N"]
                FocusTrap["useFocusTrap<br/>Modal Focus"]
                Debounce["useDebounce<br/>Input Debounce"]
                ClickOut["useClickOutside<br/>Click Detection"]
                MediaQuery["useMediaQuery<br/>Responsive"]
            end

            subgraph ContextProviders["Context Providers"]
                direction LR
                AuthCtx["AuthContext<br/>User · Session · Profile"]
                ThemeCtx["ThemeContext<br/>Theme State"]
            end

            subgraph ServiceLayer["Service Layer"]
                direction LR
                MsgSvc["messageService<br/>CRUD · Pin · React · Read"]
                GroupSvc["groupService<br/>Create · Fetch · Members"]
                UserSvc["userService<br/>Profile · Online · Cleanup"]
                NotifSvc["notificationService<br/>Fetch · Read · Create"]
            end

            subgraph Utilities["Utility Layer"]
                direction LR
                Crypto["crypto.js<br/>ECDH · AES-256-GCM"]
                Validation["validation.js<br/>Sanitize · Validate"]
                Logger["logger.js<br/>Structured Logging"]
                Env["env.js<br/>Env Validation"]
                Constants["constants.js<br/>App Constants"]
                Utils["utils.js<br/>Format · Helpers"]
            end

            subgraph SharedUI["Shared UI Primitives"]
                direction LR
                Avatar["Avatar"]
                Button["Button"]
                Modal["Modal"]
                Skeleton["Skeleton"]
                Badge["Badge"]
                EmptyState["EmptyState"]
                FileAttach["FileAttachment"]
                LiveRegion["LiveRegion<br/>Screen Reader"]
            end
        end
    end

    subgraph Backend["Supabase Backend"]
        direction TB
        SBAuth["Supabase Auth<br/>JWT · Session · RLS"]
        SBDB["PostgreSQL<br/>10 Tables · Indexes · Functions"]
        SBRealtime["Supabase Realtime<br/>postgres_changes · broadcast"]
        SBStorage["Supabase Storage<br/>chat-images Bucket"]
    end

    subgraph External["External APIs"]
        direction LR
        WebRTCExt["WebRTC<br/>Audio · Video · Screen"]
        WebCryptoExt["Web Crypto API<br/>ECDH P-256 + AES-256-GCM"]
        MediaRecExt["MediaRecorder API<br/>Voice Messages"]
        BrowserAPIs["Browser APIs<br/>Notifications · Clipboard"]
    end

    App --> Presentation
    Presentation --> Components
    Presentation --> Features
    Components --> Hooks
    Hooks --> ContextProviders
    Hooks --> ServiceLayer
    ServiceLayer --> Utilities
    Components --> SharedUI
    ServiceLayer --> SBAuth
    ServiceLayer --> SBDB
    ServiceLayer --> SBStorage
    Hooks --> SBRealtime
    Hooks --> WebRTCExt
    Hooks --> WebCryptoExt
    Hooks --> MediaRecExt
    NotifBell --> BrowserAPIs
```

### Message Flow

```mermaid
flowchart TD
    A["User Types Message"] --> B["MessageInput Component"]
    B --> C{"Reply or Edit?"}
    C -->|Reply| D["Attach reply_to ID"]
    C -->|Edit| E["Attach edit payload"]
    C -->|New| F["Plain message"]
    D --> G["Input Validation<br/>sanitizeInput()"]
    E --> G
    F --> G

    G --> H{"Has Shared Key?<br/>(E2EE)"}
    H -->|Yes| I["encryptMessage()<br/>AES-256-GCM"]
    H -->|No| J["Plaintext message"]

    I --> K["messageService.sendDMMessage()"]
    J --> K

    K --> L["Supabase DB INSERT<br/>messages table"]
    L --> M["RLS Policy Check<br/>auth.uid = sender_id"]

    M --> N["Supabase Realtime<br/>postgres_changes broadcast"]
    N --> O["Sender Subscription<br/>INSERT event"]
    N --> P["Receiver Subscription<br/>INSERT event"]

    O --> Q["Add to messages state"]
    P --> Q

    Q --> R{"Has Shared Key?"}
    R -->|Yes| S["decryptMessage()<br/>Plaintext Recovery"]
    R -->|No| T["Display plaintext"]

    S --> U["Render in MessageBubble"]
    T --> U

    U --> V["Scroll to Bottom"]
    U --> W["markMessagesDelivered()"]
    W --> X["markMessagesRead()"]
    X --> Y["Update message_status<br/>in database"]

    U --> Z["createNotification()<br/>If tab is hidden"]
    Z --> AA["NotificationBell<br/>Receives INSERT event"]

    U --> AB["Reaction Subscription<br/>(postgres_changes)"]
    AB --> AC["Toggle / Fetch Reactions"]

    U --> AD["Search Index<br/>useChatSearch filters"]

    style A fill:#e94560,color:#fff
    style L fill:#0f3460,color:#fff
    style U fill:#38ada9,color:#fff
```

### End-to-End Encryption Flow

```mermaid
sequenceDiagram
    autonumber
    participant A as User A (Sender)
    participant WC as Web Crypto API
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant B as User B (Receiver)

    Note over A,B: Key Generation & Exchange

    A->>WC: generateKeyPair()
    WC-->>A: ECDH P-256 Key Pair
    A->>DB: savePublicKey(publicKeyJwk)
    Note right of DB: user_keys table (public key only)

    B->>WC: generateKeyPair()
    WC-->>B: ECDH P-256 Key Pair
    B->>DB: savePublicKey(publicKeyJwk)

    Note over A,B: Shared Secret Derivation

    A->>DB: fetchPublicKey(B's userId)
    DB-->>A: B's public key JWK
    A->>WC: deriveSharedKey(A's privateKey, B's publicKey)
    WC-->>A: 256-bit Shared Secret
    Note over A: Shared secret exists only in browser memory

    Note over A,B: Message Encryption & Sending

    A->>A: User types message
    A->>WC: encryptMessage(plaintext, sharedKey)
    WC-->>A: {ciphertext, iv, tag} (AES-256-GCM)
    A->>DB: INSERT INTO messages (encrypted, encrypted_text)
    Note right of DB: Server stores ciphertext only, never plaintext

    DB-->>RT: postgres_changes (INSERT)
    RT-->>B: New message event

    Note over A,B: Receiver Decryption

    B->>DB: fetchPublicKey(A's userId)
    DB-->>B: A's public key JWK
    B->>WC: deriveSharedKey(B's privateKey, A's publicKey)
    WC-->>B: Same 256-bit Shared Secret
    B->>WC: decryptMessage(ciphertext, sharedKey)
    WC-->>B: Plaintext message
    B->>B: Render decrypted text

    Note over A,B: Server never sees plaintext
```

### WebRTC Call Flow

```mermaid
sequenceDiagram
    autonumber
    participant A as Caller
    participant BR as MediaDevices
    participant PC as RTCPeerConnection
    participant SB as Supabase Broadcast
    participant B as Callee

    Note over A,B: Call Initiation

    A->>BR: navigator.mediaDevices.getUserMedia()
    BR-->>A: MediaStream (audio/video)
    A->>PC: new RTCPeerConnection(config)
    A->>PC: addTrack(audio + video)

    Note over A,B: Signaling via Supabase

    A->>PC: createOffer()
    PC-->>A: SDP Offer
    A->>SB: broadcast: {type: 'call-request', offer, callType}
    SB-->>B: Incoming call event

    B->>BR: getUserMedia()
    BR-->>B: MediaStream
    B->>PC: new RTCPeerConnection(config)
    B->>PC: addTrack(audio + video)
    B->>PC: setRemoteDescription(offer)
    B->>PC: createAnswer()
    PC-->>B: SDP Answer
    B->>SB: broadcast: {type: 'call-accepted', answer}
    SB-->>A: Answer received

    A->>PC: setRemoteDescription(answer)

    Note over A,B: ICE Candidate Exchange

    loop ICE Candidate Exchange
        A->>PC: onicecandidate
        PC-->>A: ICE candidate
        A->>SB: broadcast: {type: 'ice-candidate', candidate}
        SB-->>B: ICE candidate
        B->>PC: addIceCandidate(candidate)

        B->>PC: onicecandidate
        PC-->>B: ICE candidate
        B->>SB: broadcast: {type: 'ice-candidate', candidate}
        SB-->>A: ICE candidate
        A->>PC: addIceCandidate(candidate)
    end

    Note over A,B: P2P Connection Established

    PC-->>A: ontrack (remote stream)
    PC-->>B: ontrack (remote stream)
    A->>A: Attach remote stream to video element
    B->>B: Attach remote stream to video element

    Note over A,B: During Call

    A->>A: useCallEnhancements (Noise suppression, Network quality, Camera switch)
    B->>B: Screen sharing toggle (getDisplayMedia)

    Note over A,B: Call End

    A->>PC: close()
    A->>SB: broadcast: {type: 'call-ended'}
    SB-->>B: Call ended event
    B->>PC: close()
    A->>DB: INSERT INTO call_history (caller_id, callee_id, duration, status)
```

### Database Schema

```mermaid
erDiagram
    profiles {
        uuid id PK "REFERENCES auth.users"
        text username UK "UNIQUE NOT NULL"
        text avatar_url
        text bio
        text status_message "DEFAULT 'Hey there!'"
        boolean is_online "DEFAULT false"
        timestamp last_seen
        text current_theme "DEFAULT 'midnight'"
        timestamp created_at
    }

    messages {
        uuid id PK
        uuid sender_id FK "REFERENCES profiles"
        uuid receiver_id FK "REFERENCES profiles"
        text message_text
        text image_url
        text file_url
        text file_name
        text file_type
        integer file_size
        boolean encrypted "DEFAULT false"
        text encrypted_text
        boolean is_pinned "DEFAULT false"
        boolean is_edited "DEFAULT false"
        boolean deleted_for_all "DEFAULT false"
        text message_status "sent/delivered/read"
        timestamp read_at
        timestamp created_at
    }

    user_keys {
        uuid id PK "REFERENCES auth.users"
        text public_key "NOT NULL"
        timestamp created_at
    }

    reactions {
        uuid id PK
        uuid message_id FK "REFERENCES messages"
        uuid user_id FK "REFERENCES profiles"
        text emoji "NOT NULL"
        timestamp created_at
    }

    groups {
        uuid id PK
        text name "NOT NULL"
        text description
        text avatar_url
        uuid created_by FK "REFERENCES profiles"
        boolean is_archived "DEFAULT false"
        timestamp created_at
        timestamp updated_at
    }

    group_members {
        uuid id PK
        uuid group_id FK "REFERENCES groups"
        uuid user_id FK "REFERENCES profiles"
        text role "admin/moderator/member"
        boolean is_muted "DEFAULT false"
        timestamp joined_at
    }

    group_messages {
        uuid id PK
        uuid group_id FK "REFERENCES groups"
        uuid sender_id FK "REFERENCES profiles"
        text message_text
        text image_url
        text file_url
        text file_name
        text file_type
        integer file_size
        boolean encrypted "DEFAULT false"
        text encrypted_text
        boolean is_pinned "DEFAULT false"
        boolean is_edited "DEFAULT false"
        boolean deleted_for_all "DEFAULT false"
        text message_status
        timestamp created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK "REFERENCES profiles"
        text type "NOT NULL"
        text title
        text body
        text link
        boolean is_read "DEFAULT false"
        timestamp created_at
    }

    call_history {
        uuid id PK
        uuid caller_id FK "REFERENCES profiles"
        uuid callee_id FK "REFERENCES profiles"
        text call_type "audio/video"
        text status "missed/answered/declined/completed"
        integer duration "DEFAULT 0"
        timestamp started_at
        timestamp ended_at
    }

    user_settings {
        uuid id PK "REFERENCES auth.users"
        boolean notification_sound "DEFAULT true"
        boolean notification_browser "DEFAULT true"
        boolean show_online_status "DEFAULT true"
        boolean show_last_seen "DEFAULT true"
        boolean read_receipts "DEFAULT true"
        boolean enter_to_send "DEFAULT true"
    }

    attachments {
        uuid id PK
        uuid user_id FK "REFERENCES profiles"
        text file_name "NOT NULL"
        text file_type "NOT NULL"
        text file_url "NOT NULL"
        text thumbnail_url
        timestamp created_at
    }

    profiles ||--o{ messages : "sends"
    profiles ||--o{ messages : "receives"
    profiles ||--o{ reactions : "creates"
    profiles ||--o{ groups : "creates"
    profiles ||--o{ group_members : "joins"
    profiles ||--o{ group_messages : "sends"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ call_history : "caller"
    profiles ||--o{ call_history : "callee"
    profiles ||--o{ attachments : "uploads"
    groups ||--o{ group_members : "has"
    groups ||--o{ group_messages : "contains"
    messages ||--o{ reactions : "has"
```

### Security Architecture

```mermaid
flowchart TB
    subgraph AuthLayer["Authentication Layer"]
        A1["Supabase Auth<br/>Email + Password"]
        A2["JWT Token<br/>Auto-refreshed"]
        A3["AuthContext<br/>Session State"]
        A4["Protected Routes<br/>if !user to Auth"]
    end

    subgraph DBSecurity["Database Security"]
        B1["Row Level Security (RLS)<br/>Enabled on ALL tables"]
        B2["RLS Policy: profiles<br/>Users can read all, update own"]
        B3["RLS Policy: messages<br/>Only sender + receiver access"]
        B4["RLS Policy: group_messages<br/>Only group members access"]
        B5["RLS Policy: notifications<br/>Only recipient access"]
        B6["RLS Policy: user_settings<br/>Only owner access"]
    end

    subgraph EncryptionLayer["Encryption Layer"]
        C1["ECDH P-256 Key Exchange<br/>Per-conversation keys"]
        C2["AES-256-GCM Encryption<br/>Authenticated encryption"]
        C3["Key Pair Storage<br/>Private key in IndexedDB"]
        C4["Public Key Storage<br/>user_keys table"]
        C5["Shared Secret<br/>Derived in browser only"]
        C6["Server Sees ONLY<br/>Ciphertext + IV + Tag"]
    end

    subgraph StorageSecurity["Storage Security"]
        D1["chat-images Bucket<br/>Public read access"]
        D2["File Validation<br/>Type + Size checks"]
        D3["Input Sanitization<br/>sanitizeInput()"]
        D4["XSS Prevention<br/>No innerHTML"]
    end

    subgraph NetworkSecurity["Network Security"]
        E1["HTTPS Only<br/>TLS encryption"]
        E2["Supabase RLS<br/>Server-side filtering"]
        E3["Realtime Auth<br/>Channel permissions"]
        E4["Env Variables<br/>No secrets in code"]
        E5["Logger<br/>No sensitive data logged"]
    end

    A1 --> A2 --> A3 --> A4
    A3 --> B1
    B1 --> B2
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    A3 --> C1 --> C2
    C1 --> C3
    C1 --> C4
    C2 --> C5 --> C6
    D1 --> D2 --> D3 --> D4
    E1 --> E2 --> E3
    E4 --> E5

    style AuthLayer fill:#0f3460,color:#fff
    style DBSecurity fill:#1a1a2e,color:#fff
    style EncryptionLayer fill:#533483,color:#fff
    style StorageSecurity fill:#2c2c54,color:#fff
    style NetworkSecurity fill:#2d4059,color:#fff
```

### Deployment Architecture

```mermaid
flowchart LR
    subgraph UserDevice["User Device"]
        Browser["Browser<br/>Chrome · Firefox · Safari"]
    end

    subgraph CDN["CDN Layer"]
        Render["Render.com<br/>Static Hosting"]
    end

    subgraph ClientApp["React Application"]
        direction TB
        ViteBuild["Vite 8 Build<br/>Code-Split Chunks"]
        LazyLoad["Lazy Loading<br/>React.lazy() + Suspense"]
        SW["Service Worker<br/>Offline Caching"]
        Manifest["PWA Manifest<br/>Installable"]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        direction TB
        SAuth["Supabase Auth<br/>JWT · Sessions"]
        SDB["PostgreSQL<br/>10 Tables · RLS"]
        SRealtime["Realtime<br/>WebSocket Channels"]
        SStorage["Storage<br/>chat-images Bucket"]
    end

    subgraph P2P["Peer-to-Peer"]
        WebRTCConn["WebRTC<br/>Direct Connection"]
    end

    Browser -->|"HTTPS"| Render
    Render -->|"Serves"| ViteBuild
    ViteBuild --> LazyLoad
    Browser -->|"Loads SW"| SW
    Browser -->|"Registers"| Manifest

    Browser -->|"REST API"| SAuth
    Browser -->|"SQL Queries"| SDB
    Browser -->|"WebSocket"| SRealtime
    Browser -->|"File Upload/Download"| SStorage

    Browser -->|"ICE + SDP"| WebRTCConn
    WebRTCConn -->|"Audio / Video"| Browser

    SDB -.->|"Triggers"| SRealtime
    SRealtime -.->|"Pushes to"| Browser

    style UserDevice fill:#e94560,color:#fff
    style CDN fill:#ff6b35,color:#fff
    style ClientApp fill:#1a1a2e,color:#fff
    style SupabaseCloud fill:#3ecf8e,color:#fff
    style P2P fill:#706fd3,color:#fff
```

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- A [Supabase](https://supabase.com) project (Free Tier supported)

### Installation

```bash
git clone https://github.com/VishnuSreeVidya/NodeTalk.git
cd NodeTalk
npm install
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
| 5 | `supabase-migration-v5.sql` | Indexes, DB functions, new columns, conversation_summary view |

### Storage Setup

Create a public storage bucket named `chat-images` in Supabase Storage, or run the Storage SQL at the bottom of `supabase-schema.sql`.

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── index.js
│   │   ├── Auth.jsx
│   │   ├── CallHandler.jsx        # WebRTC call management
│   │   ├── ChatWindow.jsx         # DM chat (lazy-loaded)
│   │   ├── EmojiPicker.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── ProfileModal.jsx
│   │   ├── ReactionBar.jsx
│   │   ├── ReplyPreview.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── Sidebar.jsx            # User list + groups (lazy-loaded)
│   │   ├── ThemeSelector.jsx
│   │   ├── Toast.jsx
│   │   └── VoiceRecorder.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── features/
│   │   ├── calls/hooks/
│   │   │   └── useCallEnhancements.js
│   │   ├── chat/
│   │   │   ├── components/        # ChatSearchBar, MediaGallery
│   │   │   └── hooks/             # useChatSearch, useStarMessages
│   │   ├── groups/                # GroupChatWindow, CreateGroupModal
│   │   ├── search/                # SearchPanel, useSearch
│   │   └── settings/              # SessionManager
│   │
│   ├── hooks/
│   │   ├── useClickOutside.js
│   │   ├── useDebounce.js
│   │   ├── useFocusTrap.js
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useMediaQuery.js
│   │   ├── useRealtimeSubscription.js
│   │   ├── useSupabaseChannel.js
│   │   └── useWebRTC.js
│   │
│   ├── lib/
│   │   ├── constants.js
│   │   ├── env.js                 # Environment validation
│   │   ├── logger.js              # Structured logging
│   │   ├── supabase.js            # Re-exports supabaseClient
│   │   └── utils.js               # Formatters, sanitizers
│   │
│   ├── services/
│   │   ├── index.js               # Barrel exports
│   │   ├── messageService.js
│   │   ├── groupService.js
│   │   ├── notificationService.js
│   │   └── userService.js
│   │
│   ├── test/
│   │   └── setup.js               # Test mocks
│   │
│   ├── ui/                        # Shared UI primitives
│   │   ├── __tests__/
│   │   │   └── Button.test.jsx
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FileAttachment.jsx
│   │   ├── LiveRegion.jsx
│   │   ├── Modal.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── utils/
│   │   ├── crypto.js              # E2EE encryption/decryption
│   │   └── validation.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css                  # Design system + 6 themes
│   └── supabaseClient.js
│
├── .env.example
├── .github/workflows/ci.yml
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

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |

---

## Testing

```bash
npm run test
```

**35 tests** across 3 suites &mdash; all passing.

| Suite | Tests | What is tested |
|:------|:-----:|:---------------|
| `src/lib/__tests__/utils.test.js` | 29 | `formatMessageTime`, `formatDateSeparator`, `shouldShowDateSeparator`, `truncate`, `getInitials`, `cn`, `formatFileSize`, `getFileType`, `escapeHtml`, `parseMarkdown` |
| `src/ui/__tests__/Button.test.jsx` | 4 | Rendering, loading spinner, disabled state, click handler |
| `src/hooks/__tests__/useDebounce.test.js` | 2 | Initial value, debounced value updates |

### Testing approach

- **Unit tests** &mdash; Pure utility functions tested in isolation
- **Component tests** &mdash; React Testing Library for interaction and rendering
- **Hook tests** &mdash; Custom hooks tested with `renderHook`

---

## Code Splitting

The production build uses Vite's code-splitting with `React.lazy()` and `Suspense` to split the bundle into multiple chunks:

- **Vendor separation** &mdash; React, Supabase, and Framer Motion in dedicated chunks
- **Route-level splitting** &mdash; ChatWindow, GroupChatWindow, and CallHandler load on demand
- **Tree shaking** &mdash; Unused exports removed during build
- **Asset optimization** &mdash; CSS minified, JS compressed with gzip

---

## Why I Built NodeTalk

I built NodeTalk to explore modern full-stack engineering patterns in a practical, feature-rich application. The project allowed me to work deeply with real-time data synchronization, cryptographic protocols (ECDH key exchange and AES-256-GCM encryption), peer-to-peer media streaming via WebRTC, and responsive UI design with a CSS custom property-based theming system. Every component was an opportunity to apply production-quality patterns: lazy loading, error boundaries, accessibility, and comprehensive state management through React contexts and hooks.

---

## Roadmap

- [x] End-to-end encryption
- [x] Real-time messaging
- [x] Audio & video calls
- [x] Group chats
- [x] File sharing
- [x] Voice messages
- [x] Read receipts
- [x] Progressive Web App
- [x] 6 themes
- [ ] Native mobile app
- [ ] Push notifications
- [ ] Chat backup & restore
- [ ] AI assistant integration
- [ ] Message search across encrypted content
- [ ] End-to-end encryption for group messages

---

## CI/CD

GitHub Actions pipeline runs on every push and pull request to `master`:

```
Lint → Build → Test
```

- **Lint** &mdash; ESLint with zero errors
- **Build** &mdash; Vite production build
- **Test** &mdash; Vitest test suite

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

## Contributing

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

If this project helped you, consider giving it a star.

</div>
