# 💬 NodeTalk — Real-time Messenger

**🌐 Live Demo:** https://nodetalk-sli6.onrender.com/

NodeTalk is a modern real-time messaging application built with **React**, **Vite**, and **Supabase**. It delivers instant messaging, secure authentication, online presence, file sharing, group chats, and peer-to-peer audio/video calling through WebRTC—all wrapped in a responsive, customizable interface.

---

## ✨ Features

### Messaging
* ⚡ **Real-time Messaging** – Messages are delivered instantly using Supabase Realtime.
* 🔒 **End-to-End Encryption** – Messages encrypted with AES-256-GCM using ECDH key exchange via the Web Crypto API. Server never sees plaintext.
* ✏️ **Edit & Delete** – Edit your messages or delete them for yourself or everyone.
* 📌 **Pin Messages** – Pin important messages for quick access.
* 🔍 **Search in Conversation** – Search through message history within any chat.
* 📅 **Date Separators** – Visual date dividers between message groups.
* 📝 **Markdown Support** – Bold, italic, inline code, and code blocks rendered in messages.
* ↩️ **Threaded Replies** – Quote-reply to any message with a threaded preview block.
* ❤️ **Message Reactions** – React to any message with emoji (❤️👍😂😮😢🔥). Toggle on/off.

### Read Receipts (WhatsApp-style)
* ✓ **Single tick (gray)** – Message is sending or sent.
* ✓✓ **Double tick (gray)** – Message delivered to recipient.
* ✓✓ **Double tick (accent color)** – Recipient has read the message.
* Realtime status updates via Supabase Realtime.

### Group Chats
* 🏠 **Create Groups** – Create group chats with any members.
* 💬 **Group Messaging** – Real-time group conversations with member management.
* ⌨️ **Group Typing Indicators** – See who is typing in the group.
* 📌 **Group Pinning** – Pin messages within groups.

### File Sharing & Media
* 📎 **File Sharing** – Upload and share any file type (documents, archives, audio, video).
* 🖼️ **Image Sharing** – Upload and share images with preview.
* 🎙️ **Voice Messages** – Record and send voice messages with live duration indicator.

### Calls
* 📞 **Audio & Video Calls** – Peer-to-peer communication using WebRTC.
* 🖥️ **Screen Sharing** – Share your screen during video calls.
* ⏱️ **Call Duration Timer** – Live call duration display.

### User Experience
* 🟢 **Online Presence** – View users who are currently online with last seen timestamps.
* ⌨️ **Typing Indicators** – Know when someone is typing (DM and group).
* 😀 **Emoji Picker** – Express yourself with built-in emojis.
* 👤 **Profile Editor** – Change username, status message, and avatar.
* ⚙️ **Settings Panel** – Notification sounds, privacy toggles, read receipts, enter-to-send.
* 🔔 **In-app Notifications** – Notification bell with unread count and mark-all-read.
* 🎨 **Multiple Themes** – Glass Dark, Vibrant Amethyst, Retro Cyberpunk.
* 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile devices.
* 💀 **Skeleton Loading** – Smooth loading states throughout the app.

---

## 🛠 Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | React 19, Vite 8, Tailwind CSS 3, Framer Motion    |
| Backend        | Supabase (PostgreSQL, Authentication, Storage)      |
| Database       | PostgreSQL                                          |
| Real-time      | Supabase Realtime                                   |
| Authentication | Supabase Auth                                       |
| Storage        | Supabase Storage (images, files, voice, avatars)    |
| Encryption     | Web Crypto API (ECDH + AES-256-GCM)                 |
| Audio & Video  | WebRTC (RTCPeerConnection)                          |
| Voice Recording| MediaRecorder API                                   |
| Animations     | Framer Motion                                       |
| Styling        | Tailwind CSS                                        |

---

## 📋 Prerequisites

Before running the project, ensure you have:

* Node.js 18 or later
* npm
* A Supabase project (Free Tier supported)

---

## 🚀 Installation

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

## 🗄 Database Setup

Open the Supabase SQL Editor and execute the SQL files **in order**:

### Step 1: Base Schema

```
supabase-schema.sql
```

Creates: Profiles, Messages, User Keys (E2EE), Reactions, RLS Policies, Triggers, Indexes.

### Step 2: Migration v2 — Groups, Notifications, Settings

```
supabase-migration-v2.sql
```

Creates: Groups, Group Members, Group Messages, Attachments, Notifications, Call History, User Settings, Pinned Messages. Adds columns: `is_pinned`, `is_edited`, `deleted_for_all`, `message_status`.

### Step 3: Migration v3 — File Sharing

```
supabase-migration-v3.sql
```

Adds columns: `file_url`, `file_name`, `file_type`, `file_size` to messages and group_messages.

### Step 4: Migration v4 — Read Receipts

```
supabase-migration-v4.sql
```

Adds column: `read_at` to messages. Creates index for efficient unread queries.

---

## 🖼 Storage Setup

Create a public storage bucket named:

```
chat-images
```

This bucket is used for images, files, voice messages, and avatars. Or execute the Storage SQL included at the bottom of `supabase-schema.sql`.

---

## ▶️ Run the Application

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 📜 Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build the application for production |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Run ESLint                           |

---

## 📂 Project Structure

```text
NodeTalk/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── CallHandler.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── EmojiPicker.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── ProfileModal.jsx
│   │   ├── ReactionBar.jsx
│   │   ├── ReplyPreview.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ThemeSelector.jsx
│   │   ├── Toast.jsx
│   │   └── VoiceRecorder.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── features/
│   │   └── groups/
│   │       ├── CreateGroupModal.jsx
│   │       └── GroupChatWindow.jsx
│   │
│   ├── hooks/
│   │   ├── useClickOutside.js
│   │   ├── useDebounce.js
│   │   ├── useMediaQuery.js
│   │   └── useWebRTC.js
│   │
│   ├── lib/
│   │   ├── constants.js
│   │   └── utils.js
│   │
│   ├── ui/
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FileAttachment.jsx
│   │   ├── Modal.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── utils/
│   │   └── crypto.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── supabaseClient.js
│
├── supabase-schema.sql
├── supabase-migration-v2.sql
├── supabase-migration-v3.sql
├── supabase-migration-v4.sql
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## 🎨 Available Themes

| Theme               | Description                          |
| ------------------- | ------------------------------------ |
| 🌑 Glass Dark       | Elegant frosted-glass interface      |
| 💜 Vibrant Amethyst | Purple gradient with glowing effects |
| ⚡ Retro Cyberpunk   | Neon-inspired cyberpunk aesthetic    |

---

## 🔒 Security Features

* Supabase Authentication
* Protected Routes via Row Level Security (RLS)
* End-to-End Encryption (AES-256-GCM + ECDH P-256)
* Secure File Storage with access policies
* Authenticated Database Access
* Environment Variable Configuration

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vishnu Sree Vidya**

GitHub: https://github.com/VishnuSreeVidya

If you found this project helpful, consider giving it a ⭐ on GitHub.
