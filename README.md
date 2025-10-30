# 🎬 CineRate

**CineRate** is a multiplayer movie-rating guessing game inspired by nights working on film sets and playing “guess the IMDb score” with my brother. What started as a quick way to kill time between shifts has evolved into a full-stack web game where players compete to see who knows movies best.

Built with **Next.js**, **Firebase**, **Socket.IO**, and **MongoDB**, CineRate lets you host or join live movie sessions, chat with friends, and compete to 5 points — guessing IMDb scores without going over.

---

## 🧠 Concept

Each round, one player becomes the **Picker** and selects a movie using the **OMDb API**.  
Other players use a **slider (0.0 – 10.0, step 0.1)** to guess the IMDb rating.  
The closest guess **without going over** earns a point.  
First player to reach **5 points** wins the match.

Players can:

- Create or join **public** and **private** rooms.
- Chat during matches.
- View stats, history, and leaderboard results.
- Listen to persistent background music while playing.

---

## ⚙️ Tech Stack

**Frontend**

- [Next.js 14+](https://nextjs.org/) (App Router)
- [React Context API](https://react.dev/reference/react/useContext) for Auth and Music state
- Firebase Authentication (Email/Password + Google)
- Socket.IO client
- Plain CSS via `/styles/index.css`, `palette.css`, `font.css`
- Persistent music modal with play, pause, skip, shuffle, volume, and tracklist

**Backend**

- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Mongoose](https://mongoosejs.com/)
- Firebase Admin SDK (for ID token verification)
- OMDb API (movie data)
- Bcrypt for private room passwords

**Database**

- MongoDB Atlas  
  Collections:
  - `games`
  - `userstats`

---

## 🧩 Features

- 🔐 **Firebase Auth** (Google or Email + Password)
- 🏠 **Protected Dashboard** (requires login)
- 🎮 **Create / Join Rooms**
  - Public or Private (password protected)
  - Choose player limit (2–10)
  - Copy & share room ID
- 🗣️ **Real-time Chat**
  - Persistent within room
  - Anti-spam (2-second cooldown)
  - Unread bubble indicator
- 🎬 **Game Flow**
  - 1 min for movie pick
  - 30 sec for guessing
  - Auto-advance or skip on timeout
  - Auto-win if others disconnect
- 📊 **Player Stats**
  - Wins, losses, average deviation, guess history
  - Reset or delete account
- 🏆 **Leaderboard**
  - Sorted by best average delta
- 🎧 **Persistent Music Player**
  - Tracks served from `/music` directory (`track1.mp3` – `track20.mp3`)
  - Play/pause/next/prev/shuffle/volume control
- 👤 **Profile Page**
  - Full guess history
  - Account reset/delete options
- 📜 **About Page**
  - Origin story of the game
- 🎞️ **How To Play Page**
  - Rules and flow explained

---

❤️ About

CineRate began when two brothers were working as movie-set security guards — living cheap, trading shifts, and inventing games to stay awake.
Between gigs, they’d pull up random films and guess their IMDb scores, refining the game during long Mardi Gras nights and quiet parking lots.

One of their other inventions was a questionable game of Russian roulette with airsoft guns — probably better left offline.

CineRate is a digital version of that tradition: a mix of humor, competition, and nostalgia.

Created by Sunbalm

© 2024–2025 CineRate
