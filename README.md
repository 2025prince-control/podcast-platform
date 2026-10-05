# Podcast Platform

A full-stack web platform for publishing, streaming, and reviewing podcast episodes. Built with a Node.js/Express REST API backend, MongoDB for data storage, and a React 19 frontend with an integrated audio player.

---

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Multer
- **Frontend**: React 19, Vite, Vanilla CSS
- **Audio**: HTML5 Audio streaming from local uploads

---

## Features

- **Authentication**: JWT-based sign up & sign in with password hashing.
- **Episodes**: Create, read, search, update, delete, and stream podcast episodes.
- **Audio Streaming**: Sticky player bar with play/pause, seek scrubber, and volume controls.
- **Subscriptions**: Subscribe and unsubscribe to podcast episodes.
- **Reviews & Ratings**: Rate episodes (1–5 stars) and submit listener feedback.
- **Analytics Dashboard**: Aggregated platform metrics and per-episode performance.

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |

### Episodes (`/api/episodes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/episodes` | Public | Get all episodes (sorted newest first) |
| `GET` | `/api/episodes/search?q=` | Public | Search episodes by title regex |
| `GET` | `/api/episodes/:id` | Public | Get single episode details |
| `POST` | `/api/episodes` | Protected | Create new episode (`title`, `description`, `category`) |
| `PUT` | `/api/episodes/:id` | Protected | Update episode (author only) |
| `DELETE` | `/api/episodes/:id` | Protected | Delete episode (author only) |
| `POST` | `/api/episodes/:id/audio` | Protected | Upload audio file (`.mp3`, `.wav`, `.m4a`, `.ogg`) |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/subscriptions` | Protected | Subscribe to an episode (`episodeId`) |
| `DELETE` | `/api/subscriptions/:id` | Protected | Unsubscribe from an episode |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews` | Public | Get all reviews across platform |
| `GET` | `/api/reviews/episode/:id` | Public | Get reviews for a specific episode |
| `POST` | `/api/reviews` | Protected | Add review & rating 1–5 (`episodeId`, `rating`, `comment`) |

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics` | Public | Platform totals (episodes, reviews, subs, avg rating) |
| `GET` | `/api/analytics/episode/:id` | Public | Metrics for a single episode |

### Audio Streaming
- `GET /uploads/:filename` — Stream uploaded audio file directly.

---

## Project Structure

```text
podcast-platform/
├── README.md
├── .gitignore
└── podcast/
    ├── backend/
    │   ├── config/             # Database connection (Mongoose)
    │   ├── controllers/        # Route controllers (Auth, Episode, Review, Sub, Analytics)
    │   ├── middleware/         # Auth & Multer upload middlewares
    │   ├── models/             # Mongoose schemas (User, Episode, Subscription, Review)
    │   ├── routes/             # API routes
    │   ├── uploads/            # Uploaded audio tracks
    │   ├── server.js           # Express server entrypoint
    │   ├── package.json        # Backend dependencies
    │   └── .env.example        # Environment variable template
    └── frontend/               # React 19 + Vite client app
        ├── src/
        │   ├── components/     # Modals, cards, navigation & audio player
        │   ├── context/        # Auth context & state
        │   ├── services/       # API fetch client
        │   ├── App.jsx         # Main layout & tabs
        │   └── index.css       # Clean design system styles
        ├── package.json        # Frontend dependencies
        └── vite.config.js      # Vite config & API proxy
```

---

## Environment Variables

Create a `.env` file in the `podcast/backend/` directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## Getting Started

### 1. Backend

```bash
# Navigate to backend
cd podcast/backend

# Install dependencies
npm install

# Start server (runs on port 5001)
node server.js
```

### 2. Frontend

```bash
# Navigate to frontend
cd podcast/frontend

# Install dependencies
npm install

# Start Vite dev server (runs on port 3000)
npm run dev
```
