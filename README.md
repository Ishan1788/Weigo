# WEIGO

WEIGO is a mobile-first fitness and weight-loss tracker built for people who want to stay consistent with their health goals. The app helps users log weight, monitor body measurements, track food intake, log workouts, and stay motivated through progress visuals and fitness competition with friends.

This project is a React + Vite frontend connected to Supabase for authentication, profile storage, and all health/activity data.

## Overview

WEIGO combines the everyday essentials of a fitness app into a single streamlined experience:

- Weight tracking with trend overview and goal comparison
- Nutrition logging with quick-entry Nepali food items and custom entries
- Workout logging with exercise and set tracking
- Progress charts and body measurement insights
- Friend requests and a friendly leaderboard for exercise challenges
- Secure user accounts using Supabase Auth

## Features

### Dashboard
- Personalized welcome experience
- Current weight, goal progress, weight trend, and streak summary
- Last 14 days weight chart
- Quick actions to log weight and food

### Track
- Log weight entries with notes
- Add body measurements (waist, hips, chest, arms, thighs)
- View recent history and progress deltas

### Food Log
- Track daily calories and macros
- Search and add common Nepali meals
- Add custom food entries
- View calorie summaries by meal

### Workout
- Create and manage workout sessions
- Add exercise names and sets with reps and weight
- Save workout data to Supabase
- View trainer-friendly exercise progression charts

### Progress
- Weight history graph
- Body silhouette comparison using earliest vs latest measurements
- Total progress summary

### Friends
- Send friend requests by email
- Accept/decline incoming requests
- See friends list
- View exercise leaderboards in a social competition view

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React icons
- Supabase JS client

## Project Structure

```text
weigo-app/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── silhouette/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .env.local
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- npm
- A Supabase project

## Setup

1. Open the app folder:

```bash
cd weigo-app
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the app in development mode:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## Supabase Notes

The app expects a Supabase project with authentication enabled and tables such as:

- profiles
- weight_logs
- measurements
- food_logs
- workout_sessions
- workout_sets
- friends
- friend_requests

Policies and database functions should be configured to support user-specific access and friend/leaderboard logic.

## Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # lint the project
```

## Notes

This is a frontend-heavy app that relies on Supabase for persistence and auth. It is designed as a mobile-friendly fitness tracker rather than a traditional backend-driven application.

## License

This project is currently unlicensed unless you add a license file for your own distribution requirements.
