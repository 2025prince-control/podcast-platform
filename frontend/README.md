# Podcast Platform - React Frontend (Academic Project)

This is the React frontend for the existing Podcast Platform REST API backend. It was built without modifying, deleting, renaming, or restructuring any backend files, controllers, models, routes, or middleware.

---

## 🌟 Key Features

1. **Authentication & Session Management**
   - **User Registration**: `POST /api/auth/register` (Name, Email, Password)
   - **User Login**: `POST /api/auth/login` with JWT authentication
   - Persistent user session in `localStorage`
   - Active user profile indicator with name and role badge (`user` / `admin`)
   - Secure Sign Out

2. **Episodes Catalog & Search**
   - **Fetch All Episodes**: `GET /api/episodes`
   - **Search Query**: Real-time searching via `GET /api/episodes/search?q=:query`
   - **Category Filtering**: Filter by category (Technology, Education, Science, Business, News, Entertainment, General)
   - **Episode Cards**: Title, duration (mm:ss), category badge, author details, audio availability status
   - **Publish Episode**: Modal to create episodes (`POST /api/episodes`) with optional audio attachment
   - **Edit & Delete Episode**: Author-only controls (`PUT /api/episodes/:id` & `DELETE /api/episodes/:id`)

3. **Persistent Audio Player**
   - Bottom floating audio player bar for uninterrupted playback while browsing
   - HTML5 Audio integration streaming from `/uploads/:filename`
   - Play/pause toggle, scrubber seek bar, time elapsed/duration display, and volume slider

4. **Episode Details & Interactive Feedback**
   - Deep inspection modal (`GET /api/episodes/:id`)
   - **Episode Analytics**: Shows reviews count, subscriptions count, and average star rating (`GET /api/analytics/episode/:id`)
   - **Author Audio Upload Tool**: Upload or replace episode audio file via `POST /api/episodes/:id/audio`
   - **Subscriptions**: Subscribe/Unsubscribe quick actions (`POST /api/subscriptions` & `DELETE /api/subscriptions/:id`)
   - **Episode Reviews**: View reviews and submit new ratings (1–5 stars) with comments (`GET /api/reviews/episode/:id` & `POST /api/reviews`)

5. **Platform Analytics Dashboard**
   - Displays platform-wide aggregated metrics (`GET /api/analytics`):
     - Total Published Episodes
     - Community Reviews Count
     - Total Subscriptions
     - Platform Average Star Rating
   - Performance Matrix table displaying metrics for all individual episodes

6. **Community Reviews Feed**
   - Global review stream across all podcast episodes (`GET /api/reviews`)
   - Filter reviews by star rating

---

## 📁 Frontend Directory Structure

```text
frontend/
├── index.html                 # Academic project title & metadata
├── package.json               # Frontend dependencies & scripts
├── vite.config.js             # Vite configuration with backend proxy
├── src/
│   ├── main.jsx               # React entry point with AuthProvider
│   ├── App.jsx                # Main application layout, tabs & modals
│   ├── index.css              # Academic, clean design system styling
│   ├── context/
│   │   └── AuthContext.jsx    # React Context for JWT auth & state
│   ├── services/
│   │   └── api.js             # REST API client connecting to backend
│   └── components/
│       ├── Navbar.jsx         # Header navigation & user controls
│       ├── AuthModal.jsx      # Sign In & Registration modal
│       ├── EpisodeCard.jsx    # Episode card with actions & badges
│       ├── EpisodeDetailModal.jsx # Detail view, reviews & audio upload
│       ├── CreateEpisodeModal.jsx # Form to publish new episode
│       ├── EditEpisodeModal.jsx   # Form to edit existing episode
│       ├── AudioPlayerBar.jsx # Sticky bottom audio player
│       ├── AnalyticsView.jsx  # Platform & episode analytics
│       └── ReviewsFeedView.jsx# Platform-wide reviews feed
```

---

## 🚀 How to Run

### 1. Start the Backend Server (if not already running)
From the root project directory:
```bash
node server.js
```
The backend server runs on `http://localhost:5001`.

### 2. Start the Frontend Application
From the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:3000`.
