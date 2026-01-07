# PredictMTT

A notification-driven tournament platform for binary cryptocurrency price predictions. Users play multiple tournaments throughout their day by responding to quick prediction prompts - like Wordle meets crypto.

## Overview

PredictMTT is **async poker** - combining the tournament structure and elimination mechanics of poker with simple binary cryptocurrency price predictions. Unlike traditional poker or games requiring constant attention, PredictMTT is designed for **casual mobile-first gameplay** where users make quick OVER/UNDER predictions and get notified 30 minutes later with results.

### The Async Model

**Traditional poker**: Sit at a table for 2-4 hours, fold 90% of hands, requires full attention.

**PredictMTT**: Make a 30-second prediction, close the app, get a notification when the round resolves. Play 10-20 rounds throughout your day while doing other things.

#### How It Works
1. **Join tournaments** - Users join 2-4 tournaments with staggered start times
2. **Get notified** - Push notification: "New round starting in 2 minutes"
3. **Quick prediction** - Open app, see chart, pick OVER or UNDER, lock in (30 seconds)
4. **Go live life** - Close app, do anything for 30 minutes
5. **Get results** - Push notification: "Round complete! You were correct ✓"
6. **Repeat** - Next round starts, make another prediction

Total active time per tournament: 15-30 minutes spread across a full day of micro-interactions. Perfect for Gen Z mobile behavior.

## Game Mechanics

### Binary Predictions (OVER/UNDER)
Every round presents a simple question: **"Will BTC be OVER or UNDER $50,000 in 30 minutes?"**

- Players see the current price and a target threshold
- Two big buttons: OVER (≥ target) or UNDER (< target)
- No complex price prediction - just a binary choice
- Designed for gut feeling + quick chart glance

### Three-Strikes Elimination
- Every player starts with **3 strikes** (⚠ indicators)
- Wrong prediction = **1 strike**
- Third strike = **ELIMINATED** from tournament
- Last players standing win the prize pool

### Round Timing (30-minute rounds)
- **0-4 minutes**: Prediction window open, can change your choice
- **4-5 minutes**: Lock-only phase, can submit but not change
- **5-30 minutes**: Predictions locked, waiting for resolution
- **30 minutes**: Round resolves, strikes assigned, next round begins

This timing enables the async model - short prediction window, long wait time perfect for notifications.

## Features

### MVP (Phase 1) - Current Implementation

- **Dashboard Screen**: Main screen for managing active tournaments
  - **Needs Attention** section - urgent predictions needed
  - **Waiting** section - tournaments awaiting round results
  - **Completed** section - finished tournaments with results
  - Pull-to-refresh for latest tournament states
  - Quick navigation to prediction screens

- **Notification System**: Core to the async model
  - Push notification permissions and setup
  - Scheduled notifications for round events:
    - Round starting (2 minutes before)
    - Prediction needed (at round start)
    - Lock deadline warning (1 minute before lock)
    - Round resolved (with results)
    - Strikes and eliminations
  - Deep linking from notifications to prediction screen
  - Badge counts and notification management

- **Binary Prediction Interface**:
  - Large OVER/UNDER buttons for quick decisions
  - Current price vs. target price display
  - Two-phase timing (4min change + 1min lock)
  - Visual feedback with haptics
  - Strike indicators on player seats

- **Tournament Lobby**: Browse and join tournaments
  - Filter by asset (BTC, ETH), buy-in range, and tournament status
  - View tournament details including prize pools and entrant counts
  - Register for tournaments

- **Table View**: Core gameplay screen
  - Live price chart with real-time BTC/ETH price data from Binance
  - 9-seat table layout with player avatars and strike indicators
  - Binary prediction input (OVER/UNDER)
  - Countdown timers for prediction deadlines

- **Multi-Tournament Management**:
  - Track 2-4 simultaneous tournaments (staggered)
  - Per-tournament state (strikes, predictions, notifications)
  - Smart notification scheduling
  - Active tournament tracking

- **Real-time Price Feed**:
  - Live WebSocket connection to Binance for BTC/ETH prices
  - Historical candlestick data visualization
  - Automatic reconnection with exponential backoff

- **State Management**:
  - Zustand stores for tournaments, tables, user data, and active tournament participations
  - Multi-tournament state tracking
  - Persistent prediction and notification tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Charts**: Custom SVG-based price charts
- **Navigation**: Expo Router
- **Notifications**: Expo Notifications (push notifications, scheduling, deep linking)
- **Real-time Data**: WebSocket (Binance API)
- **Backend**: Supabase (configured, not yet implemented)
- **Platform**: iOS & Android (Landscape-only)

## Design Aesthetic

PredictMTT follows a classic online poker client aesthetic:

- **Color Palette**:
  - Background: Dark blues and blacks (#0f0f1a, #1a1a2e, #16213e)
  - Accent: Emerald green (#10b981) for primary actions
  - Secondary: Gold (#f59e0b) for highlights and winners
  - Text: Light gray (#e5e5e5) on dark backgrounds

- **Typography**:
  - Monospace fonts for prices, timers, and numeric data
  - Clean, utilitarian information density
  - Uppercase labels for section headers

- **Layout**:
  - Landscape-only orientation
  - Table-based layouts mimicking poker software
  - Sharp corners and precise alignments

## Project Structure

```
/app
  /_layout.tsx          # Root navigation layout
  /index.tsx            # Redirect to dashboard
  /dashboard.tsx        # Main screen - active tournaments overview
  /lobby.tsx            # Tournament lobby screen
  /table/[id].tsx       # Table view screen with binary predictions

/components
  /common               # Reusable UI components
    Avatar.tsx
    Badge.tsx
    Button.tsx
    Modal.tsx
  /lobby                # Lobby-specific components
    FilterSidebar.tsx
    TournamentRow.tsx
  /table                # Table-specific components
    PlayerSeat.tsx      # Shows strikes, predictions, eliminated state
    PredictionInput.tsx # Binary OVER/UNDER interface
    PriceChart.tsx      # Live BTC/ETH price chart

/hooks
  useNotifications.ts   # Notification permissions and listeners

/services
  notificationService.ts # Push notification scheduling and management
  priceService.ts        # Binance WebSocket integration
  supabase.ts            # Supabase client configuration

/stores
  myTournamentsStore.ts  # User's active tournament participations
  tableStore.ts          # Table state management
  tournamentStore.ts     # Tournament lobby state
  userStore.ts           # User state management

/types
  index.ts               # TypeScript type definitions (includes NotificationData, etc.)

/utils
  calculations.ts        # Game logic (determineStrikes, binary OVER/UNDER)
  formatters.ts          # Display formatting utilities
  mockData.ts            # Development mock data

/PRIMARY_PERSONA.md      # Jordan - the casual crypto enthusiast
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Repo-2
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials if needed
```

### Running the App

Start the Expo development server:

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web (limited functionality)

Or use platform-specific commands:

```bash
npm run ios      # Run on iOS
npm run android  # Run on Android
npm run web      # Run on web
```

### Development Mode

The app is currently configured with mock data for development. The tournament lobby will show sample tournaments, and the table view includes mock players and a simulated round.

Live price data is fetched from Binance WebSocket API, so you'll see real BTC/ETH prices on the chart.

## Current Limitations & Next Steps

### Phase 2 Features (Not Yet Implemented)

- **Backend Integration**:
  - Connect Supabase for persistent tournaments and user data
  - Real-time table updates via Supabase Realtime
  - User authentication and profiles

- **Game Logic**:
  - Round resolution algorithm
  - Elimination calculations
  - Prize distribution
  - Tournament progression

- **Additional Features**:
  - Multiple assets (stocks via Polygon.io)
  - Multiple tournament types (Turbo, Regular, Deep Stack)
  - Crypto wallet integration for real buy-ins
  - Social features (friends, leaderboards)
  - Shareable result cards
  - Player statistics

- **Polish**:
  - Elimination animations
  - Prediction reveal animations
  - Sound effects (with toggle)
  - Haptic feedback refinements
  - Loading states and error handling

## Target Audience

**Jordan** - 22-year-old casual crypto enthusiast (see `PRIMARY_PERSONA.md`)

Key behaviors:
- Mobile-first, checks phone 50+ times per day
- Plays for fun and social sharing, not profit grinding
- Wants quick sessions (30 seconds of attention)
- Plays 2-4 tournaments simultaneously throughout the day
- Shares wins on Discord/group chats
- $5-15 buy-in sweet spot (coffee money for entertainment)

**Design principle**: If it requires more than TikTok-level attention, it's too complex.

## Key Components

### Dashboard
Main screen showing tournament portfolio:
- **Needs Attention**: Urgent predictions with countdown timers
- **Waiting**: Active tournaments awaiting results
- **Completed**: Finished tournaments with placement/prizes
- Pull-to-refresh and quick navigation

### PriceChart
Displays live price data using SVG-based rendering:
- Real-time price updates from Binance
- Historical candlestick visualization
- Target price threshold line
- Responsive scaling

### PredictionInput (Binary Interface)
Two big buttons for instant decisions:
- **OVER button**: Green border, predicts price ≥ target
- **UNDER button**: Red border, predicts price < target
- Current price vs. target price display
- Two-phase countdown (4min change + 1min lock)
- Lock-in confirmation with haptic feedback

### PlayerSeat
Displays player information at the table:
- Avatar with active/eliminated states
- Strike indicators (○ ○ ○ becoming ⚠ ⚠ ⚠)
- Binary prediction reveals (OVER/UNDER with colored borders)
- Lock-in status indicators
- Empty seat placeholders

### NotificationService
Core to the async experience:
- Schedules notifications for round events
- Handles permission requests
- Deep linking to prediction screens
- Badge count management
- Quiet hours support (future)

## Architecture Decisions

### Why Async/Notification-Driven?
Traditional prediction markets and poker require constant attention. We pivoted to an async model because:

**User behavior insight**: "Most people like to make a quick decision and then go do something else until the next hand."

With 30-minute rounds:
- 5-minute prediction window (short, focused attention)
- 25-minute waiting period (perfect for notifications)
- Users can play full tournaments throughout their day without constant attention
- Multiple simultaneous tournaments create steady stream of decisions without overwhelm

This model fits modern mobile behavior: quick micro-interactions triggered by notifications, like Wordle or daily puzzle games.

### Why Binary Predictions (OVER/UNDER)?
Exact price predictions require:
- Study and analysis (high barrier)
- Charts and technical analysis knowledge
- Feels like work for casual users

Binary predictions are:
- Instant to understand (50/50 choice)
- Based on gut feeling + quick chart glance
- Social and debatable ("I'm going OVER, what about you?")
- Still influenced by skill/knowledge but accessible to anyone

Trade-off: Lower skill ceiling, but massively broader appeal for casual/social audience.

### Why Three-Strikes Elimination?
Creates tournament structure without complex chip stacks:
- Simple to understand (baseball metaphor)
- Visual feedback (⚠ indicators)
- Multiple chances reduces frustration from variance
- Clear elimination moment for notifications

Everyone with wrong prediction gets a strike = high variance but fair (no "worst predictor" complaints).

### Why Zustand?
Chosen for its simplicity and excellent TypeScript support. The app's state management needs are straightforward, and Zustand provides a minimal API without boilerplate.

### Why Custom Charts?
Victory Native was attempted but had network issues during installation. A custom SVG-based chart solution was implemented instead, providing:
- Full control over styling and animations
- Better performance for real-time updates
- Smaller bundle size

### Why Landscape-Only?
The poker-client aesthetic requires landscape orientation to:
- Display the full table layout with 9 seats
- Show the price chart as the centerpiece
- Maintain information density without scrolling

## Contributing

This is a work in progress. Current development priorities:

### Phase 2: Backend Integration & Notifications
1. **Supabase backend setup**
   - User authentication
   - Tournament and table data models
   - Real-time subscriptions for table updates
   - Round resolution triggers

2. **Notification infrastructure**
   - Push notification server setup
   - Scheduled notification delivery
   - Notification preference management
   - Background round processing

3. **Multi-tournament coordination**
   - Staggered tournament scheduling
   - Smart notification batching (avoid spam)
   - Tournament state synchronization

### Phase 3: Social Features
4. **Friend system**
   - Friend lists and invites
   - See friends' active tournaments
   - Join same tournaments as friends
   - Shared leaderboards

5. **Sharing & virality**
   - Screenshot tournament results
   - Share to Discord/Twitter/Instagram
   - Referral system
   - Tournament highlights

### Phase 4: Polish & Optimization
6. **Animations**
   - Strike reveal animations
   - Elimination celebrations/commiserations
   - Round resolution reveals
   - Prize win celebrations

7. **Performance**
   - Optimize notification delivery
   - Reduce app launch time
   - Smooth 60fps animations
   - Background state persistence

## License

[To be determined]

## Acknowledgments

- Inspired by classic online poker clients (PokerStars, GGPoker)
- Price data provided by Binance API
- Built with Expo and React Native
