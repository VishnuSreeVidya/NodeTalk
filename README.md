# NodeTalk — Real-time Messenger

> **Live Demo:** [https://nodetalk-sli6.onrender.com/](https://nodetalk-sli6.onrender.com/)

A feature-rich real-time chat application built with **React + Vite**, powered by **Supabase** (auth, database, realtime, storage) and styled with **Tailwind CSS**.

## Features

- **Real-time messaging** — messages appear instantly via Supabase Realtime
- **User authentication** — sign up / sign in with email & password
- **Presence & online status** — see who's online
- **Typing indicators** — see when someone is typing
- **Image sharing** — upload & send images via Supabase Storage
- **Emoji picker** — quick emoji selection
- **Audio & Video calls** — WebRTC peer-to-peer calls with Supabase broadcast
- **Themes** — Glass Dark, Vibrant Amethyst, Retro Cyberpunk
- **Responsive design** — works on desktop & mobile

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | React 19, Vite 8, Tailwind CSS 3                |
| Backend      | Supabase (PostgreSQL, Auth, Realtime, Storage)  |
| Real-time    | Supabase Realtime (Postgres changes + Broadcast)|
| Calls        | WebRTC (RTCPeerConnection)                      |
| Icons        | Heroicons (inline SVG)                          |

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

## Setup

1. **Clone & install**
   ```bash
   cd NodeTalk
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase project URL and anon key:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Database setup**
   - Run the SQL in `supabase-schema.sql` in your Supabase SQL editor
   - This creates `profiles`, `messages` tables with RLS policies, triggers, and indexes

4. **Storage setup**
   - In Supabase Dashboard → Storage, create a public bucket named `chat-images`
   - Or uncomment and run the storage SQL at the bottom of `supabase-schema.sql`

5. **Start dev server**
   ```bash
   npm run dev
   ```

## Available Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |

## Project Structure

```
NodeTalk/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Auth.jsx           # Login / signup form
│   │   ├── CallHandler.jsx    # WebRTC audio/video calls
│   │   ├── ChatWindow.jsx     # Message list & input
│   │   ├── EmojiPicker.jsx    # Emoji grid picker
│   │   ├── ImageUpload.jsx    # Image upload to Supabase Storage
│   │   ├── Sidebar.jsx        # User list, search, presence
│   │   └── ThemeSelector.jsx  # Theme switcher dropdown
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth state management
│   │   └── ThemeContext.jsx   # Theme state management
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css              # Tailwind + themes + utilities
│   └── supabaseClient.js      # Supabase client singleton
├── supabase-schema.sql        # Full DB schema & RLS policies
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
