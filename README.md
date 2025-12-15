# Abisinya Bingo - React Native App

A professional mobile bingo app that displays cartelas (bingo cards) with the following features:

## Features
- Multiple bingo cards with blue headers
- 5x5 grid with B-I-N-G-O columns
- Free space marked with "F" in red
- Individual card marking system
- Add new cards by cartela ID (1-2000)
- Tap numbers to mark them as called
- Data persistence across sessions
- Reset called numbers functionality
- Uses predefined cartelas from cartela.js (2000+ cards available)

## Setup

1. Install dependencies:
```bash
npm install
```

2. For Android:
```bash
npm run android
```

3. For iOS:
```bash
npm run ios
```

## Usage
- Tap "+ Add Card" to add new cartelas by ID (1-2000)
- Tap any number on a card to mark it as called (red background)
- Use the menu (⋮) to reset all called numbers
- Data automatically saves and persists between sessions

## Card Features
- Blue header with cartela name and delete button
- Dark blue header row with B-I-N-G-O letters
- White cells with numbers that can be marked
- Red free space in center (marked with "F")
- Individual marking per card (no cross-card interference)
- Responsive design for mobile and tablet screens
- Uses authentic cartela data from cartela.js with 2000+ unique cards

## Integration with cartela.js
- Imports predefined bingo cards from cartela.js
- Converts row-based format to column-based format for display
- Handles both "FREE" and "Free" text variations
- Supports up to 2000 unique cartelas
- Maintains authentic bingo number distributions