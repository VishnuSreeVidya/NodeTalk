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

## Architecture

### 1. Overall System Architecture

```mermaid
graph TB
    subgraph Browser["🌐 User Browser"]
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

    subgraph Backend["☁️ Supabase Backend"]
        direction TB
        SBAuth["Supabase Auth<br/>JWT · Session · RLS"]
        SBDB["PostgreSQL<br/>10 Tables · Indexes · Functions"]
        SBRealtime["Supabase Realtime<br/>postgres_changes · broadcast"]
        SBStorage["Supabase Storage<br/>chat-images Bucket"]
    end

    subgraph External["🔌 External APIs"]
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

---

### 2. Message Flow

```mermaid
flowchart TD
    A["👤 User Types Message"] --> B["MessageInput Component"]
    B --> C{"Reply or Edit?"}
    C -->|Reply| D["Attach reply_to ID"]
    C -->|Edit| E["Attach edit payload"]
    C -->|New| F["Plain message"]
    D --> G["Input Validation<br/>sanitizeInput()"]
    E --> G
    F --> G

    G --> H{"Has Shared Key?<br/>(E2EE)"}
    H -->|Yes| I["🔐 encryptMessage()<br/>AES-256-GCM"]
    H -->|No| J["Plaintext message"]

    I --> K["messageService<br/>.sendDMMessage()"]
    J --> K

    K --> L["Supabase DB INSERT<br/>messages table"]
    L --> M["RLS Policy Check<br/>auth.uid = sender_id"]

    M --> N["Supabase Realtime<br/>postgres_changes broadcast"]
    N --> O["Sender Subscription<br/>INSERT event"]
    N --> P["Receiver Subscription<br/>INSERT event"]

    O --> Q["Add to messages state"]
    P --> Q

    Q --> R{"Has Shared Key?"}
    R -->|Yes| S["🔐 decryptMessage()<br/>Plaintext Recovery"]
    R -->|No| T["Display plaintext"]

    S --> U["🎨 Render in MessageBubble"]
    T --> U

    U --> V["Scroll to Bottom"]
    U --> W["markMessagesDelivered()<br/>Double tick gray"]
    W --> X["markMessagesRead()<br/>Double tick accent"]
    X --> Y["Update message_status<br/>in database"]

    U --> Z["🔔 createNotification()<br/>If tab is hidden"]
    Z --> AA["NotificationBell<br/>Receives INSERT event"]

    U --> AB["Reaction Subscription<br/>(postgres_changes)"]
    AB --> AC["Toggle / Fetch Reactions"]

    U --> AD["Search Index<br/>useChatSearch filters"]

    style A fill:#e94560,color:#fff
    style L fill:#0f3460,color:#fff
    style U fill:#38ada9,color:#fff
```

---

### 3. End-to-End Encryption Flow

```mermaid
sequenceDiagram
    autonumber
    participant A as 👤 User A (Sender)
    participant WC as 🔐 Web Crypto API
    participant DB as 🗄️ Supabase DB
    participant RT as ⚡ Supabase Realtime
    participant B as 👤 User B (Receiver)

    Note over A,B: === Key Generation & Exchange ===

    A->>WC: generateKeyPair()
    WC-->>A: ECDH P-256 Key Pair
    A->>DB: savePublicKey(publicKeyJwk)
    Note right of DB: user_keys table<br/>Server stores ONLY<br/>public key

    B->>WC: generateKeyPair()
    WC-->>B: ECDH P-256 Key Pair
    B->>DB: savePublicKey(publicKeyJwk)

    Note over A,B: === Shared Secret Derivation ===

    A->>DB: fetchPublicKey(B's userId)
    DB-->>A: B's public key JWK
    A->>WC: deriveSharedKey(A's privateKey, B's publicKey)
    WC-->>A: 256-bit Shared Secret
    Note over A: Shared secret exists<br/>ONLY in browser memory

    Note over A,B: === Message Encryption & Sending ===

    A->>A: User types message
    A->>WC: encryptMessage(plaintext, sharedKey)
    WC-->>A: {ciphertext, iv, tag} (AES-256-GCM)
    A->>DB: INSERT INTO messages<br/>(encrypted: true,<br/>encrypted_text: JSON)
    Note right of DB: Server stores<br/>ONLY ciphertext<br/>⚠️ NO plaintext

    DB-->>RT: postgres_changes (INSERT)
    RT-->>B: New message event

    Note over A,B: === Receiver Decryption ===

    B->>DB: fetchPublicKey(A's userId)
    DB-->>B: A's public key JWK
    B->>WC: deriveSharedKey(B's privateKey, A's publicKey)
    WC-->>B: Same 256-bit Shared Secret
    B->>WC: decryptMessage(ciphertext, sharedKey)
    WC-->>B: Plaintext message
    B->>B: Render decrypted text

    Note over A,B: ✅ Server never sees plaintext
```

---

### 4. WebRTC Call Flow

```mermaid
sequenceDiagram
    autonumber
    participant A as 👤 Caller
    participant BR as 🎤 MediaDevices
    participant PC as 🔗 RTCPeerConnection
    participant SB as 📡 Supabase Broadcast
    participant B as 👤 Callee

    Note over A,B: === Call Initiation ===

    A->>BR: navigator.mediaDevices.getUserMedia()
    BR-->>A: MediaStream (audio/video)
    A->>PC: new RTCPeerConnection(config)
    A->>PC: addTrack(audio + video)

    Note over A,B: === Signaling via Supabase ===

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

    Note over A,B: === ICE Candidate Exchange ===

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

    Note over A,B: === P2P Connection Established ===

    PC-->>A: ontrack (remote stream)
    PC-->>B: ontrack (remote stream)
    A->>A: Attach remote stream to video element
    B->>B: Attach remote stream to video element

    Note over A,B: === During Call ===

    A->>A: useCallEnhancements<br/>• Noise suppression (AudioContext)<br/>• Network quality monitoring<br/>• Camera switch (facingMode)
    B->>B: Screen sharing toggle<br/>getDisplayMedia()

    Note over A,B: === Call End ===

    A->>PC: close()
    A->>SB: broadcast: {type: 'call-ended'}
    SB-->>B: Call ended event
    B->>PC: close()
    A->>DB: INSERT INTO call_history<br/>(caller_id, callee_id, duration, status)
```

---

### 5. Group Chat Flow

```mermaid
flowchart TD
    subgraph Creation["Group Creation"]
        A1["👤 User Opens<br/>CreateGroupModal"] --> A2["Type Group Name<br/>+ Description"]
        A2 --> A3["Search & Select<br/>Members"]
        A3 --> A4["groupService<br/>.createGroup()"]
        A4 --> A5["INSERT INTO groups"]
        A4 --> A6["INSERT INTO group_members<br/>admin + members"]
        A5 --> A7["Sidebar refreshes<br/>groups list"]
    end

    subgraph Messaging["Group Messaging"]
        B1["User Opens<br/>GroupChatWindow"] --> B2["fetchGroupMessages()<br/>fetchGroupMembers()"]
        B2 --> B3["Subscribe to<br/>group-messages-{id}<br/>(postgres_changes)"]
        B3 --> B4["Realtime INSERT<br/>events arrive"]
        B4 --> B5["Add to messages state"]
        B5 --> B6["🎨 Render with<br/>MessageBubble"]
    end

    subgraph Sending["Send Message"]
        C1["User Types Message"] --> C2["sendGroupMessage(payload)"]
        C2 --> C3["INSERT INTO<br/>group_messages"]
        C3 --> C4["Realtime Broadcast<br/>to all members"]
        C4 --> C5["Each member's<br/>subscription fires"]
        C5 --> C6["Messages update<br/>in real-time"]
    end

    subgraph Typing["Typing Indicators"]
        D1["User Types"] --> D2["broadcastTyping()<br/>Supabase channel"]
        D2 --> D3["broadcast: typing event"]
        D3 --> D4["Other members<br/>receive broadcast"]
        D4 --> D5["TypingIndicator<br/>shows name"]
        D5 --> D6["Timeout 2-3s<br/>clears indicator"]
    end

    subgraph Reactions["Reactions & Pins"]
        E1["User Right-Clicks<br/>Message"] --> E2["MessageContextMenu"]
        E2 --> E3{"Action"}
        E3 -->|React| E4["toggleReaction()"]
        E3 -->|Pin| E5["UPDATE is_pinned<br/>on group_messages"]
        E3 -->|Reply| E6["Set replyTo state"]
        E3 -->|Delete| E7["deleteGroupMessage()"]
    end

    style Creation fill:#0f3460,color:#fff
    style Messaging fill:#1a1a2e,color:#fff
    style Sending fill:#16213e,color:#fff
    style Typing fill:#2c2c54,color:#fff
    style Reactions fill:#533483,color:#fff
```

---

### 6. File Sharing Flow

```mermaid
flowchart TD
    A["📎 User Clicks<br/>FileUpload / VoiceRecorder"] --> B{"File Type?"}

    B -->|Image| C["FileUpload<br/>accept: image/*"]
    B -->|Any File| D["FileUpload<br/>accept: */*"]
    B -->|Voice| E["VoiceRecorder<br/>MediaRecorder API"]

    C --> F["validateFileUpload()<br/>Size · Type · Sanitize"]
    D --> F
    E --> G["Record audio stream<br/>audio/webm;codecs=opus"]

    F --> H["Upload to Supabase Storage<br/>chat-images bucket"]
    G --> H

    H --> I{"Upload Success?"}
    I -->|No| J["❌ Toast Error<br/>'Upload failed'"]
    I -->|Yes| K["getPublicUrl()<br/>Get file URL"]

    K --> L["Create file metadata<br/>name · type · mimeType · size"]
    L --> M{"Message Type?"}

    M -->|DM| N["sendDMMessage({<br/>file_url, file_name,<br/>file_type, file_size })"]
    M -->|Group| O["sendGroupMessage({<br/>file_url, file_name,<br/>file_type, file_size })"]

    N --> P["INSERT INTO<br/>messages table"]
    O --> Q["INSERT INTO<br/>group_messages table"]

    P --> R["Realtime Broadcast"]
    Q --> R

    R --> S["Receiver Gets Message"]
    S --> T["FileAttachment Component"]
    T --> U{"File Type?"}

    U -->|Image| V["<img> with lazy loading<br/>Click to open fullscreen"]
    U -->|Document| W["Download link<br/>with file icon + size"]
    U -->|Audio/Video| X["Inline player"]

    style A fill:#e94560,color:#fff
    style H fill:#0f3460,color:#fff
    style T fill:#38ada9,color:#fff
```

---

### 7. Database Schema

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
        text current_theme "DEFAULT 'glass-dark'"
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

---

### 8. Frontend Component Architecture

```mermaid
graph TB
    subgraph Entry["Entry Point"]
        Main["main.jsx<br/>validateEnv() · mount"]
        IndexCSS["index.css<br/>Themes · Global Styles"]
    end

    subgraph Root["Application Root"]
        App["App.jsx<br/>Lazy Loading · Suspense · Routes"]
    end

    subgraph Providers["Context Providers"]
        AuthProvider["AuthProvider<br/>user · profile · signIn · signOut"]
        ThemeProvider["ThemeProvider<br/>currentTheme · setTheme"]
    end

    subgraph Layout["Layout Components"]
        SidebarComp["Sidebar<br/>Tabs · Users · Groups · Search"]
        ChatWin["ChatWindow<br/>DM Messages"]
        GroupWin["GroupChatWindow<br/>Group Messages"]
        CallHand["CallHandler<br/>WebRTC Management"]
        AuthPage["Auth<br/>Login · Signup"]
    end

    subgraph ChatComponents["Chat Components"]
        MsgInput["MessageInput<br/>Text · Emoji · Files · Reply"]
        MsgBubble["MessageBubble<br/>Content · Reactions · Reply"]
        MsgCtxMenu["MessageContextMenu<br/>Copy · Reply · Edit · Delete · Pin"]
        ReplyPrev["ReplyPreview<br/>Quote Block"]
        ReactionBarComp["ReactionBar<br/>Emoji Toggle"]
        EmojiP["EmojiPicker<br/>Emoji Grid"]
        FileUp["FileUpload<br/>File Input · Validation"]
        VoiceRec["VoiceRecorder<br/>MediaRecorder"]
        ImageUp["ImageUpload<br/>Image Input"]
    end

    subgraph SharedComponents["Shared Components"]
        ChatHdr["ChatHeader<br/>Avatar · Status · Actions"]
        DateSepComp["DateSeparator<br/>Date Labels"]
        TypingIndComp["TypingIndicator<br/>Dots Animation"]
    end

    subgraph ModalComponents["Modals"]
        ProfileMod["ProfileModal<br/>Edit Profile"]
        SettingsMod["SettingsModal<br/>Preferences"]
        CreateGrpMod["CreateGroupModal<br/>Group Setup"]
        SearchPanelComp["SearchPanel<br/>Global Search"]
        MediaGal["MediaGallery<br/>Files · Media · Links"]
        SessionMgr["SessionManager<br/>Active Sessions"]
    end

    subgraph UIComponents["UI Primitives"]
        AvatarUI["Avatar"]
        ButtonUI["Button"]
        ModalUI["Modal"]
        SkeletonUI["Skeleton"]
        BadgeUI["Badge"]
        EmptyStateUI["EmptyState"]
        FileAttachUI["FileAttachment"]
        LiveRegUI["LiveRegion"]
        ToastUI["Toast"]
    end

    subgraph HooksLayer["Custom Hooks"]
        UseWebRTC["useWebRTC<br/>RTCPeerConnection"]
        UseCallEnh["useCallEnhancements<br/>Noise · Quality · Switch"]
        UseSupaCh["useSupabaseChannel<br/>Channel Lifecycle"]
        UseRealtime["useRealtimeSubscription<br/>postgres_changes"]
        UseKeybd["useKeyboardShortcuts<br/>Global Shortcuts"]
        UseFocusTrap["useFocusTrap<br/>Focus Management"]
        UseDebounce["useDebounce<br/>Input Throttle"]
        UseClickOut["useClickOutside<br/>Dismiss Detection"]
        UseMediaQ["useMediaQuery<br/>Responsive Breakpoints"]
    end

    subgraph ServicesLayer["Service Layer"]
        MsgService["messageService<br/>15 functions"]
        GroupService["groupService<br/>3 functions"]
        UserService["userService<br/>5 functions"]
        NotifService["notificationService<br/>4 functions"]
    end

    subgraph UtilitiesLayer["Utilities"]
        CryptoUtil["crypto.js<br/>9 functions"]
        ValidationUtil["validation.js<br/>7 functions"]
        LoggerUtil["logger.js<br/>Structured logging"]
        EnvUtil["env.js<br/>Env validation"]
        ConstUtil["constants.js<br/>App constants"]
        UtilsUtil["utils.js<br/>Formatters"]
    end

    Main --> App
    App --> Providers
    Providers --> Layout
    Layout --> ChatComponents
    Layout --> ModalComponents
    ChatComponents --> SharedComponents
    ChatComponents --> UIComponents
    ModalComponents --> UIComponents
    Layout --> UIComponents
    ChatComponents --> HooksLayer
    Layout --> HooksLayer
    HooksLayer --> ServicesLayer
    HooksLayer --> Providers
    ServicesLayer --> UtilitiesLayer

    style Entry fill:#0a0a23,color:#fff
    style Root fill:#1a1a2e,color:#fff
    style Providers fill:#16213e,color:#fff
    style Layout fill:#0f3460,color:#fff
    style ChatComponents fill:#533483,color:#fff
    style SharedComponents fill:#2c2c54,color:#fff
    style ModalComponents fill:#2c2c54,color:#fff
    style UIComponents fill:#1e1e3f,color:#aaa
    style HooksLayer fill:#e94560,color:#fff
    style ServicesLayer fill:#38ada9,color:#fff
    style UtilitiesLayer fill:#2d4059,color:#fff
```

---

### 9. Security Architecture

```mermaid
flowchart TB
    subgraph AuthLayer["Authentication Layer"]
        A1["Supabase Auth<br/>Email + Password"]
        A2["JWT Token<br/>Auto-refreshed"]
        A3["AuthContext<br/>Session State"]
        A4["Protected Routes<br/>if !user → Auth"]
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

---

### 10. Deployment Architecture

```mermaid
flowchart LR
    subgraph UserDevice["📱 User Device"]
        Browser["Browser<br/>Chrome · Firefox · Safari"]
    end

    subgraph CDN["CDN Layer"]
        Render["Render.com<br/>Static Hosting"]
    end

    subgraph ClientApp["React Application"]
        direction TB
        ViteBuild["Vite 8 Build<br/>16 Code-Split Chunks"]
        LazyLoad["Lazy Loading<br/>React.lazy() + Suspense"]
        SW["Service Worker<br/>Offline Caching"]
        Manifest["PWA Manifest<br/>Installable"]
    end

    subgraph SupabaseCloud["☁️ Supabase Cloud"]
        direction TB
        SAuth["Supabase Auth<br/>JWT · Sessions"]
        SDB["PostgreSQL<br/>10 Tables · RLS"]
        SRealtime["Realtime<br/>WebSocket Channels"]
        SStorage["Storage<br/>chat-images Bucket"]
        SEdge["Edge Functions<br/>DB Functions"]
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
