# Autonomy App

An educational platform designed to help students develop autonomy and self-regulation skills through interactive learning modules. The app supports both students and parents, enabling families to work together on the learning journey.

## What is Autonomy?

Autonomy helps students build essential life skills through 10 structured learning modules:

- **Responsibility** - Understanding personal accountability
- **Collaboration** - Teamwork and working with others
- **Self-Monitoring** - Tracking and assessing one's own progress
- **Self-Regulation** - Managing emotions and impulses
- **Curiosity** - Embracing questions and exploration
- **Shape of Learning** - Understanding how learning works
- **Self Coach** - Developing positive self-talk
- **Mistakes** - Learning from errors and setbacks
- **Neuroplasticity** - Understanding brain growth
- **Mastery Moments** - Celebrating achievements

Each module contains 5 days of content, with separate tracks for students and parents.

## How It Works

### Family Codes
Families join using unique codes (e.g., `BEAR-1234`). This allows:
- Progress tracking across family members
- Parents to monitor student progress
- Synced learning between parent and student views

### Two Modes
- **Student Mode** - Interactive lessons and activities
- **Parent Mode** - Guidance on supporting your child's learning

Toggle between modes using the floating button in the bottom-right corner.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd autonomy-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on your preferred platform:
   - Press `w` for web
   - Press `a` for Android
   - Press `i` for iOS

### Backend Setup (Optional for full functionality)

The backend serves content from Google Docs and handles data storage.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```
   PORT=3001
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<your-service-account>
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_PROJECT_ID=<your-project-id>
   ```

4. Start the backend:
   ```bash
   npm run dev
   ```

## Project Structure

```
autonomy-app/
├── app/                    # Screens and navigation (Expo Router)
│   ├── (tabs)/            # Main tab screens (Home, Modules, Progress)
│   ├── *-module.tsx       # Student learning modules
│   └── *-parent-module.tsx # Parent guidance modules
├── components/            # Reusable React components
├── contexts/              # React Context providers (state management)
├── services/              # API clients and business logic
├── assets/                # Images, fonts, and static files
└── backend/               # Express.js API server
```

## Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: Expo Router (file-based)
- **Database**: Firebase Firestore
- **Backend**: Express.js
- **Content Management**: Google Docs API

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |

## License

This project is proprietary. All rights reserved.
