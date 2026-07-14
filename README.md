<div align="center">

<img src="public/favicon.svg" width="80" alt="NodeTalk Logo">

# NodeTalk

### *Real-time messenger with WebRTC calls, typing indicators, and themeable UI*

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-Peer-4CAF50?style=for-the-badge&logo=webrtc&logoColor=white)

**[Live Demo](https://nodetalk-sli6.onrender.com/)**

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Chat & UI
- **Real-time messaging** — instant delivery via Supabase Realtime
- **User authentication** — email & password sign up/in
- **Online presence** — see who's online in real time
- **Typing indicators** — animated dots when someone types
- **Image sharing** — upload & send images inline
- **Emoji picker** — 48 hand-curated emojis
- **3 Themes** — Glass Dark, Vibrant Amethyst, Retro Cyberpunk
- **Responsive** — works on desktop & mobile

</td>
<td width="50%">

### Technical
- **Supabase Realtime** — Postgres changes + Broadcast channels
- **WebRTC calls** — peer-to-peer audio/video via `RTCPeerConnection`
- **Row Level Security** — DB-level access control on all tables
- **Broadcast signaling** — typing events & call signaling via Supabase Broadcast
- **Context API** — clean auth & theme state management
- **CSS theming** — CSS custom properties with smooth transitions
- **Image storage** — Supabase Storage with 5MB limit validation

</td>
</tr>
</table>

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/VishnuSreeVidya/NodeTalk.git
cd NodeTalk

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Set up database
# Run supabase-schema.sql in your Supabase SQL Editor

# 5. Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

### Supabase Setup

1. **Database** — Run `supabase-schema.sql` in SQL Editor (creates `profiles`, `messages` tables + RLS + triggers)
2. **Storage** — Create a public bucket named `chat-images`
3. **Realtime** — Enable `messages` and `profiles` tables for Realtime:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
   ```

---

## How It Works

### Real-time Messaging

```
┌──────────┐    INSERT     ┌────────────┐    Postgres Changes    ┌──────────┐
│  Sender  │──────────────▶│  Supabase  │───────────────────────▶│ Receiver │
│  (React) │               │  Database  │                        │  (React) │
└──────────┘               └────────────┘                        └──────────┘
                                │
                                │ Broadcast (typing)
                                ▼
                          ┌──────────┐
                          │ Receiver │
                          │  (React) │
                          └──────────┘
```

- Messages stored in `messages` table with `sender_id`, `receiver_id`, `message_text`, `image_url`
- Supabase Realtime pushes new inserts to all subscribed clients
- Typing events sent via Supabase Broadcast (throttled to 1 per 2s)

### WebRTC Call Flow

```
┌──────────┐   offer/answer   ┌────────────┐   offer/answer   ┌──────────┐
│  Caller  │◀────────────────▶│  Supabase  │◀────────────────▶│ Receiver │
│          │   ICE candidates │  Broadcast │   ICE candidates │          │
└────┬─────┘                  └────────────┘                  └────┬─────┘
     │                                                            │
     └────────────────── Direct P2P (WebRTC) ────────────────────┘
                          Audio / Video
```

- Signaling via Supabase Broadcast channels (offer → answer → ICE candidates)
- STUN servers: `stun:stun.l.google.com:19302`
- Call controls: mute, video toggle, end call

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
NodeTalk/
├── public/
│   ├── favicon.svg              ⚡  App logo
│   └── icons.svg                🔗  Social icons (Bluesky, Discord, GitHub, X)
├── src/
│   ├── components/
│   │   ├── Auth.jsx             🔐  Login / signup form
│   │   ├── CallHandler.jsx      📞  WebRTC audio/video calls
│   │   ├── ChatWindow.jsx       💬  Message list, input, typing, images
│   │   ├── EmojiPicker.jsx      😊  48-emoji grid picker
│   │   ├── ImageUpload.jsx      📷  Upload to Supabase Storage
│   │   ├── Sidebar.jsx          👥  User list, search, presence, typing
│   │   └── ThemeSelector.jsx    🎨  Theme switcher dropdown
│   ├── context/
│   │   ├── AuthContext.jsx      🔑  Auth state, sign in/up/out, online status
│   │   └── ThemeContext.jsx     🌗  Theme state, localStorage + DB persistence
│   ├── App.jsx                  🏠  Root layout
│   ├── main.jsx                 🚀  Entry point
│   ├── index.css                🎨  Tailwind + 3 theme CSS variable sets
│   └── supabaseClient.js        🔌  Supabase client singleton
├── supabase-schema.sql          🗄️  Full DB schema, RLS, triggers, indexes
├── .env.example                 ⚙️  Environment variable template
├── index.html                   📄  HTML entry (Google Fonts - Inter)
├── package.json                 📦  Dependencies & scripts
├── postcss.config.js            🔧  PostCSS + Tailwind + Autoprefixer
├── tailwind.config.js           ⚙️  Custom animations + Inter font
└── vite.config.js               🔧  Vite + React plugin
```

---

## Themes

| Theme | Vibe | Colors |
|-------|------|--------|
| **Glass Dark** | Frosted glass | Sky-blue accents, light blue gradient |
| **Vibrant Amethyst** | Purple glow | Purple accents, deep purple gradient |
| **Retro Cyberpunk** | Neon on black | Hot pink/neon, near-black background |

Switch themes from the sidebar header dropdown. Selection persists across sessions.

---

## License

MIT License — feel free to fork, modify, and share!

<div align="center">

**[Live Demo](https://nodetalk-sli6.onrender.com/)** · **[Report Bug](https://github.com/VishnuSreeVidya/NodeTalk/issues)** · **[Request Feature](https://github.com/VishnuSreeVidya/NodeTalk/issues)**

</div>
