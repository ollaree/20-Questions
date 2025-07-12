# 20 Questions Online

*A real-time, two-player implementation of the classic "20 Questions" guessing game. Built with Node.js, WebSockets, and modern web technologies, featuring a terminal-inspired aesthetic designed for seamless multiplayer gameplay.*

---

## Description

The objective of the game is for one player (the Guesser) to guess a secret word chosen by the other player (the Answerer) within 20 yes/no questions. The Answerer responds with "Yes," "No," or "Maybe" to each question. The Guesser wins if they successfully guess the word, while the Answerer wins if the Guesser runs out of questions.

---

## Functionalities

- **Real-Time Multiplayer**: Two players can play from different devices using WebSockets.
- **Game Room System**: Players can create games and share a unique 5-character Game ID for others to join.
- **Turn-Based System**: Players alternate between asking questions and providing answers.
- **Interactive Chat Interface**: Real-time question and answer display with distinct message styling.
- **Live Question Counter**: Dynamic tracking of remaining questions out of 20.
- **Instant Win Detection**: Automatic game ending when the Guesser identifies the word.
- **Connection Handling**: Graceful handling of player disconnections with opponent notification.
- **Responsive Design**: Optimized for various screen sizes with full viewport usage.
- **Secure Word Entry**: Password-masked input for secret word creation.

---

## How It Works

The game consists of two main components: a Node.js server (`server.js`) and a client-side interface (`index.html`).

### Server Architecture (`server.js`):

- **Express Server**: Serves the static HTML file and handles HTTP requests.
- **WebSocket Server**: Manages real-time communication between players.
- **Game State Management**: Maintains in-memory storage of active games with complete game state.
- **Game Logic**: Handles question validation, answer processing, turn management, and win/loss detection.

### Game State Structure:

- `secretWord`: The word chosen by Player 1 that Player 2 must guess.
- `guessesLeft`: Number of questions remaining (starts at 20).
- `currentPlayer`: Tracks whose turn it is (1 for Answerer, 2 for Guesser).
- `messages`: Array of all questions and answers exchanged during the game.
- `lastQuestion`: The most recent question asked by the Guesser.
- `status`: Game status ('waiting', 'active', 'finished').
- `winner`: Which player won the game (1 or 2).

### Client-Side (`index.html`):

- **Modal System**: Clean interface for game creation, joining, and end-game screens.
- **Chat Interface**: Real-time display of questions and answers with distinct styling.
- **WebSocket Communication**: Bidirectional communication with the server for moves and game updates.
- **UI Management**: Dynamic status updates, turn indicators, and game controls.

### Gameplay Flow:

1. **Game Creation**: Player 1 creates a game with a secret word and receives a unique Game ID.
2. **Game Joining**: Player 2 joins using the Game ID.
3. **Question Phase**: Player 2 asks yes/no questions about the secret word.
4. **Answer Phase**: Player 1 responds with "Yes," "No," or "Maybe."
5. **Victory Conditions**: Player 2 wins by guessing correctly, Player 1 wins if questions run out.

### Key Algorithms:

- **Turn Management**: Alternates between question asking and answer providing phases.
- **Question Tracking**: Decrements remaining questions and checks for game end conditions.
- **Game State Synchronization**: Sanitizes and broadcasts game state to both players in real-time.
- **Win/Loss Detection**: Automatically determines game outcome based on question count or successful guess.

---

## How to Play

### Setup:
1. Make sure you have Node.js installed on your system.
2. Run `npm install express ws` to install the required dependencies.
3. Start the server by running `node server.js`.
4. Open your browser and navigate to `http://localhost:8080`.

### Gameplay:
1. **Create a Game**: Click "Create Game" and enter a secret word (keep it hidden from your opponent).
2. **Share Game ID**: Share the generated 5-character Game ID with your opponent.
3. **Join Game**: The second player enters the Game ID and clicks "Join Game".
4. **Ask Questions**: Player 2 asks yes/no questions about the secret word.
5. **Provide Answers**: Player 1 responds with "Yes," "No," or "Maybe."
6. **Guess or Run Out**: Player 2 wins by guessing correctly or loses when questions run out.

### Controls:
- **Question Input**: Type your question and press Enter or click "Ask."
- **Answer Buttons**: Click "Yes," "No," or "Maybe" to respond to questions.
- **Guess Victory**: Click "You Guessed It!" when you know the answer.
- **Game Code**: Click the game code in the top bar to copy it to clipboard.

---

## Technical Features

- **Real-Time Communication**: WebSocket-based multiplayer with instant message synchronization.
- **Responsive Interface**: Adapts to various screen sizes while maintaining optimal usability.
- **Clean Game State**: Sanitized data transmission preventing WebSocket serialization issues.
- **Error Handling**: Comprehensive error handling for network issues and invalid game states.
- **Memory Management**: Automatic cleanup of disconnected games and players.
- **Visual Feedback**: Distinct message styling, turn indicators, and smooth animations.

---

## File Structure

```
├── server.js      # Node.js server with WebSocket handling and game logic
├── index.html     # Complete client-side application with UI and game interface
└── README.md      # This file
```

---

## Dependencies

- **express**: Web server framework
- **ws**: WebSocket library for real-time communication

---

## AI
AI was used to assist throughout all phases of the project, including game logic implementation, WebSocket communication, user interface design, and gameplay mechanics.
