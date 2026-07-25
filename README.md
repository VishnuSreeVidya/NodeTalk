# 💬 NodeTalk — Real-time Messenger

**🌐 Live Demo:** https://nodetalk-sli6.onrender.com/

NodeTalk is a modern real-time messaging application built with **React**, **Vite**, and **Supabase**. It delivers instant messaging, secure authentication, online presence, image sharing, and peer-to-peer audio/video calling through WebRTC—all wrapped in a responsive, customizable interface.

---

## ✨ Features

* ⚡ **Real-time Messaging** – Messages are delivered instantly using Supabase Realtime.
* 🔐 **Secure Authentication** – Email and password sign-up/sign-in powered by Supabase Auth.
* 🟢 **Online Presence** – View users who are currently online.
* ⌨️ **Typing Indicators** – Know when someone is typing.
* 🖼️ **Image Sharing** – Upload and share images using Supabase Storage.
* 😀 **Emoji Picker** – Express yourself with built-in emojis.
* 📞 **Audio & Video Calls** – Peer-to-peer communication using WebRTC.
* 🔒 **End-to-End Encryption** – Messages encrypted with AES-256-GCM using ECDH key exchange via the Web Crypto API. Server never sees plaintext.
* ❤️ **Message Reactions** – React to any message with emoji (❤️👍😂😮😢🔥). Toggle on/off.
* 💬 **Threaded Replies** – Quote-reply to any message with a threaded preview block.
* 🎨 **Multiple Themes**

  * Glass Dark
  * Vibrant Amethyst
  * Retro Cyberpunk
* 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile devices.

---

## 🛠 Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | React 19, Vite 8, Tailwind CSS 3               |
| Backend        | Supabase (PostgreSQL, Authentication, Storage) |
| Database       | PostgreSQL                                     |
| Real-time      | Supabase Realtime                              |
| Authentication | Supabase Auth                                  |
| Storage        | Supabase Storage                               |
| Encryption     | Web Crypto API (ECDH + AES-256-GCM)            |
| Audio & Video  | WebRTC (RTCPeerConnection)                     |
| Styling        | Tailwind CSS                                   |
| Icons          | Heroicons                                      |

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

Open the Supabase SQL Editor and execute:

```
supabase-schema.sql
```

This script creates:

* Profiles table
* Messages table (with E2EE and reply columns)
* User Keys table (E2EE public key exchange)
* Reactions table (emoji reactions on messages)
* Row Level Security (RLS) Policies
* Triggers
* Indexes

---

## 🖼 Storage Setup

Create a public storage bucket named:

```
chat-images
```

Or execute the Storage SQL included at the bottom of:

```
supabase-schema.sql
```

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
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── CallHandler.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── EmojiPicker.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── ReactionBar.jsx
│   │   ├── ReplyPreview.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ThemeSelector.jsx
│   │   └── Toast.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   └── useWebRTC.js
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
* Protected Routes
* Row Level Security (RLS)
* Secure File Storage
* Authenticated Database Access
* Environment Variable Configuration
* End-to-End Encryption (AES-256-GCM + ECDH P-256)

---

## 🚀 Future Enhancements

* Group Chats & Channels
* Read Receipts
* Voice Messages
* Push Notifications
* Message Search & History
* File/Document Sharing
* User Profiles & Status
* Chat Backup & Restore

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
