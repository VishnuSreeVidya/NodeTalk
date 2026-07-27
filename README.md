# NodeTalk - Real-time Messenger

**Live Demo:** https://nodetalk-sli6.onrender.com/

NodeTalk is a production-grade real-time messaging application built with **React**, **Vite 8**, and **Supabase**. It delivers instant messaging, end-to-end encryption, online presence, file sharing, group chats, peer-to-peer audio/video calling through WebRTC, and a fully responsive, customizable interface.

---

## Features

### Messaging
- **Real-time Messaging** - Instant delivery via Supabase Realtime
- **End-to-End Encryption** - AES-256-GCM with ECDH P-256 key exchange via Web Crypto API. Server never sees plaintext
- **Edit & Delete** - Edit your messages or delete for yourself or everyone
- **Pin Messages** - Pin important messages for quick access
- **Star Messages** - Star/unstar messages for personal bookmarks
- **Search** - Full-text search across all users and messages, plus in-conversation search
- **Date Separators** - Visual date dividers between message groups
- **Markdown Support** - Bold, italic, inline code, and code blocks
- **Threaded Replies** - Quote-reply to any message with preview block
- **Message Reactions** - React to messages with emoji

### Read Receipts (WhatsApp-style)
- Single tick (gray) - Message sent
- Double tick (gray) - Message delivered
- Double tick (accent color) - Message read
- Realtime status updates via Supabase Realtime

### Group Chats
- **Create Groups** - Create group chats with any members
- **Real-time Group Messaging** - Instant group conversations with member management
- **Group Typing Indicators** - See who is typing
- **Group Pinning** - Pin messages within groups

### File Sharing & Media
- **File Sharing** - Upload and share any file type (documents, archives, audio, video)
- **Image Sharing** - Upload and share images with preview
- **Voice Messages** - Record and send voice messages with live duration indicator
- **Media Gallery** - Browse shared media, files, links, and voice messages with fullscreen preview

### Calls
- **Audio & Video Calls** - Peer-to-peer via WebRTC
- **Screen Sharing** - Share your screen during video calls
- **Call Duration Timer** - Live call duration display
- **Noise Suppression** - Audio noise suppression via AudioContext
- **Network Quality Indicator** - Real-time network quality display
- **Camera Switch** - Switch between front/rear camera during video calls

### User Experience
- **Online Presence** - View online users with last seen timestamps
- **Typing Indicators** - Know when someone is typing (DM and group)
- **Emoji Picker** - Built-in emoji selector
- **Profile Editor** - Change username, status message, and avatar
- **Settings Panel** - Notification sounds, privacy toggles, read receipts, enter-to-send
- **In-app Notifications** - Notification bell with unread count and mark-all-read
- **Multiple Themes** - Glass Dark, Vibrant Amethyst, Retro Cyberpunk
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Skeleton Loading** - Smooth loading states throughout

### Accessibility
- **Focus Trap** - Keyboard focus trapped in modals and dropdowns
- **Screen Reader Support** - Live regions and ARIA alerts for dynamic content
- **Keyboard Shortcuts** - Ctrl+K (search), Ctrl+N (new chat), Escape (close)
- **ARIA Labels** - Full ARIA labeling on interactive elements

### Progressive Web App
- **Installable** - Add to home screen on mobile and desktop
- **Offline Support** - Service worker caches static assets for offline access
- **App Manifest** - Full PWA manifest with icons and theme color

---

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | React 19, Vite 8, Tailwind CSS 3, Framer Motion        |
| Backend        | Supabase (PostgreSQL, Auth, Storage, Realtime)          |
| Database       | PostgreSQL with optimized indexes and DB functions      |
| Real-time      | Supabase Realtime (postgres_changes + broadcast)        |
| Authentication | Supabase Auth                                           |
| Storage        | Supabase Storage (images, files, voice, avatars)        |
| Encryption     | Web Crypto API (ECDH P-256 + AES-256-GCM)              |
| Audio & Video  | WebRTC (RTCPeerConnection)                              |
| Voice Recording| MediaRecorder API                                       |
| Animations     | Framer Motion                                           |
| Styling        | Tailwind CSS                                            |
| Testing        | Vitest, Testing Library, jsdom                          |
| CI/CD          | GitHub Actions (lint, build, test pipeline)             |

---

## Prerequisites

- Node.js 20 or later
- npm
- A Supabase project (Free Tier supported)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/VishnuSreeVidya/NodeTalk.git
cd NodeTalk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from `.env.example`.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Setup

Open the Supabase SQL Editor and execute the SQL files **in order**:

### Step 1: Base Schema

```
supabase-schema.sql
```

Creates: Profiles, Messages, User Keys (E2EE), Reactions, RLS Policies, Triggers, Indexes.

### Step 2: Migration v2 - Groups, Notifications, Settings

```
supabase-migration-v2.sql
```

Creates: Groups, Group Members, Group Messages, Attachments, Notifications, Call History, User Settings, Pinned Messages.

### Step 3: Migration v3 - File Sharing

```
supabase-migration-v3.sql
```

Adds: `file_url`, `file_name`, `file_type`, `file_size` columns.

### Step 4: Migration v4 - Read Receipts

```
supabase-migration-v4.sql
```

Adds: `read_at` column. Creates index for efficient unread queries.

### Step 5: Migration v5 - Performance & Security

```
supabase-migration-v5.sql
```

Adds: 9 optimized indexes, 5 DB functions (`get_unread_counts`, `cleanup_stale_users`, `get_dm_participants`, `cleanup_expired_messages`, `update_last_seen_trigger`), new columns (`is_starred`, `scheduled_at`, `expires_in`, `archived_chats`, `blocked_users`, `poll_data`), and a `conversation_summary` view.

---

## Storage Setup

Create a public storage bucket named:

```
chat-images
```

This bucket is used for images, files, voice messages, and avatars. Or execute the Storage SQL at the bottom of `supabase-schema.sql`.

---

## Run the Application

```bash
npm run dev
```

Available at `http://localhost:5173`.

---

## Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Run ESLint                           |
| `npm run test`    | Run unit and integration tests       |

---

## Project Structure

```text
NodeTalk/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
│
├── src/
│   ├── components/
│   │   ├── shared/                # Shared reusable components
│   │   │   ├── ChatHeader.jsx     # Chat header with actions
│   │   │   ├── DateSeparator.jsx  # Date dividers
│   │   │   ├── MessageContextMenu.jsx  # Right-click menu
│   │   │   ├── TypingIndicator.jsx     # Typing dots
│   │   │   └── index.js
│   │   ├── Auth.jsx
│   │   ├── CallHandler.jsx
│   │   ├── ChatWindow.jsx         # DM chat (lazy-loaded)
│   │   ├── EmojiPicker.jsx
│   │   ├── ErrorBoundary.jsx      # Error boundary with logging
│   │   ├── FileUpload.jsx
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
│   │   ├── calls/
│   │   │   ├── hooks/
│   │   │   │   └── useCallEnhancements.js  # Noise suppression, PiP, network quality
│   │   │   └── index.js
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ChatSearchBar.jsx       # In-conversation search
│   │   │   │   ├── MediaGallery.jsx        # Shared media browser
│   │   │   │   └── index.js
│   │   │   ├── hooks/
│   │   │   │   ├── useChatSearch.js
│   │   │   │   ├── useStarMessages.js
│   │   │   │   └── index.js
│   │   ├── groups/
│   │   │   ├── CreateGroupModal.jsx
│   │   │   └── GroupChatWindow.jsx  # Group chat (lazy-loaded)
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   └── SearchPanel.jsx  # Global search UI
│   │   │   ├── hooks/
│   │   │   │   └── useSearch.js     # Debounced full-text search
│   │   │   └── index.js
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── SessionManager.jsx  # Multi-device session mgmt
│   │       │   └── index.js
│   │
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── useDebounce.test.js
│   │   ├── useClickOutside.js
│   │   ├── useDebounce.js
│   │   ├── useFocusTrap.js          # Modal focus trapping
│   │   ├── useKeyboardShortcuts.js  # Global keyboard shortcuts
│   │   ├── useMediaQuery.js
│   │   ├── useRealtimeSubscription.js  # postgres_changes subscription
│   │   ├── useSupabaseChannel.js    # Channel management
│   │   └── useWebRTC.js
│   │
│   ├── lib/
│   │   ├── __tests__/
│   │   │   └── utils.test.js
│   │   ├── constants.js             # App-wide constants
│   │   ├── env.js                   # Env validation + config
│   │   ├── logger.js                # Structured logging
│   │   ├── supabase.js              # Re-export from supabaseClient
│   │   └── utils.js
│   │
│   ├── services/                    # Service layer (API/DB logic)
│   │   ├── groupService.js
│   │   ├── index.js
│   │   ├── messageService.js
│   │   ├── notificationService.js
│   │   ├── userService.js
│   │
│   ├── test/
│   │   └── setup.js                 # Test setup with mocks
│   │
│   ├── ui/                          # Shared UI primitives
│   │   ├── __tests__/
│   │   │   └── Button.test.jsx
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FileAttachment.jsx
│   │   ├── LiveRegion.jsx           # Screen reader announcements
│   │   ├── Modal.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── utils/
│   │   ├── crypto.js                # E2EE encryption/decryption
│   │   └── validation.js            # Input sanitization + validation
│   │
│   ├── App.jsx                      # Root with lazy loading + Suspense
│   ├── main.jsx                     # Entry with env validation
│   ├── index.css
│   └── supabaseClient.js
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI pipeline
│
├── supabase-schema.sql
├── supabase-migration-v2.sql
├── supabase-migration-v3.sql
├── supabase-migration-v4.sql
├── supabase-migration-v5.sql        # Performance indexes + DB functions
├── vitest.config.js                 # Test configuration
├── eslint.config.js
├── vite.config.js                   # Build config + path aliases
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── package.json
└── index.html
```

---

## Keyboard Shortcuts

| Shortcut       | Action                |
| -------------- | --------------------- |
| `Ctrl + K`     | Open search           |
| `Ctrl + N`     | New chat              |
| `Escape`       | Close modal/panel     |
| `Enter`        | Send message          |
| `Shift + Enter`| New line in message   |

---

## Available Themes

| Theme               | Description                          |
| ------------------- | ------------------------------------ |
| Glass Dark          | Elegant frosted-glass interface      |
| Vibrant Amethyst    | Purple gradient with glowing effects |
| Retro Cyberpunk     | Neon-inspired cyberpunk aesthetic    |

---

## Security Features

- Supabase Authentication with protected routes
- Row Level Security (RLS) on all database tables
- End-to-End Encryption (AES-256-GCM + ECDH P-256)
- Input sanitization and validation (`sanitizeInput`, `validateMessage`, etc.)
- Secure file storage with access policies
- Environment variable validation on startup
- Structured error logging (no secrets exposed)

---

## Testing

36 tests across 3 test suites:

```bash
npm run test
```

- `src/lib/__tests__/utils.test.js` - 29 utility function tests
- `src/ui/__tests__/Button.test.jsx` - 5 component tests
- `src/hooks/__tests__/useDebounce.test.js` - 2 hook tests

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push/PR to `master`/`main`:

1. **Lint** - ESLint with 0 errors, 0 warnings
2. **Build** - Vite production build with code splitting
3. **Test** - Vitest test suite

---

## Code Splitting

The production build is split into 16 optimized chunks:

| Chunk               | Size (gzip)  | Description                    |
| ------------------- | ------------ | ------------------------------ |
| `react-vendor`      | 57 KB        | React + ReactDOM                |
| `supabase`          | 51 KB        | Supabase client                |
| `framer`            | 43 KB        | Framer Motion                  |
| `index`             | 5 KB         | App entry                      |
| `Sidebar`           | 8 KB         | Sidebar component              |
| `ChatWindow`        | 4 KB         | DM chat window                 |
| `GroupChatWindow`   | 3 KB         | Group chat window              |
| `messageService`    | 9 KB         | Message service layer          |
| `CallHandler`       | 3 KB         | Call handling                   |
| `date-fns`          | 6 KB         | Date utilities                 |
| + 6 more lazy chunks|              | Auth, ThemeSelector, Avatar    |

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Run lint and tests before committing:
   ```bash
   npm run lint && npm run test && npm run build
   ```
4. Commit your changes
5. Push to your branch
6. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Vishnu Sree Vidya**

GitHub: https://github.com/VishnuSreeVidya

If you found this project helpful, consider giving it a star on GitHub.
