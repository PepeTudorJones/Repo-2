# PredictMTT

A multi-table tournament platform for price predictions styled like a classic online poker client. Users compete in elimination tournaments by predicting asset prices over timed rounds.

## Overview

PredictMTT combines the excitement of poker tournaments with cryptocurrency price prediction. Players compete in real-time tournaments, making predictions on BTC/ETH prices and trying to outlast opponents through multiple rounds.

## Features

### MVP (Phase 1) - Current Implementation

- **Tournament Lobby**: Browse and filter available tournaments
  - Filter by asset (BTC, ETH), buy-in range, and tournament status
  - View tournament details including prize pools and entrant counts
  - Register for tournaments with modal confirmation

- **Table View**: Core gameplay screen with poker-client aesthetic
  - Live price chart with real-time BTC/ETH price data from Binance
  - 9-seat table layout with player avatars and status indicators
  - Prediction input with countdown timer and price adjustment controls
  - Visual feedback for locked-in predictions

- **Real-time Price Feed**:
  - Live WebSocket connection to Binance for BTC/ETH prices
  - Historical candlestick data visualization
  - Automatic reconnection with exponential backoff

- **State Management**:
  - Zustand stores for tournaments, tables, and user data
  - Persistent prediction tracking
  - Filter state management

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Charts**: Custom SVG-based price charts
- **Navigation**: Expo Router
- **Real-time Data**: WebSocket (Binance API)
- **Backend**: Supabase (configured, not yet implemented)
- **Platform**: iOS (Landscape-only)

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
  /index.tsx            # Redirect to lobby
  /lobby.tsx            # Tournament lobby screen
  /table/[id].tsx       # Table view screen

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
    PlayerSeat.tsx
    PredictionInput.tsx
    PriceChart.tsx

/hooks                  # Custom React hooks (planned)

/services
  priceService.ts       # Binance WebSocket integration
  supabase.ts           # Supabase client configuration

/stores
  tableStore.ts         # Table state management
  tournamentStore.ts    # Tournament state management
  userStore.ts          # User state management

/types
  index.ts              # TypeScript type definitions

/utils
  calculations.ts       # Game logic utilities
  formatters.ts         # Display formatting utilities
  mockData.ts           # Development mock data
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

## Key Components

### PriceChart
Displays live price data using SVG-based rendering:
- Real-time price updates from Binance
- Historical candlestick visualization
- Prediction line overlays
- Responsive scaling

### PredictionInput
Allows users to input and lock in predictions:
- Current price display
- Fine-tuned adjustment controls (+/- 1, 10, 100)
- Countdown timer with urgency states
- Lock-in confirmation with haptic feedback

### PlayerSeat
Displays player information at the table:
- Avatar with active/eliminated states
- Lock-in status indicators
- Prediction reveals (when appropriate)
- Empty seat placeholders

## Architecture Decisions

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

1. Implement round resolution logic
2. Add Supabase backend integration
3. Build WebSocket table synchronization
4. Add animations for reveals and eliminations
5. Implement tournament progression

## License

[To be determined]

## Acknowledgments

- Inspired by classic online poker clients (PokerStars, GGPoker)
- Price data provided by Binance API
- Built with Expo and React Native
