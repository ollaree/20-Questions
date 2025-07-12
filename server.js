const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Use the PORT environment variable provided by Render, with a fallback for local development
const PORT = process.env.PORT || 8080;

// Serve static files from the project's root directory
// This will correctly serve index.html
app.use(express.static(path.join(__dirname)));

// In-memory storage for games
const games = {};

/**
 * Creates a clean, sendable version of the game state.
 * The secret word is NOT included here by default for security.
 * @param {object} game - The full game object from memory.
 * @returns {object | null} A sanitized game state object safe to send to clients.
 */
function getSanitizedGameState(game) {
    if (!game) return null;
    return {
        guessesLeft: game.guessesLeft,
        currentPlayer: game.currentPlayer,
        messages: game.messages,
        lastQuestion: game.lastQuestion,
        status: game.status,
        winner: game.winner,
    };
}

/**
 * Generates a unique 5-character game ID.
 * @returns {string} A unique game ID.
 */
function generateGameId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result;
    do {
        result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (games[result]); // Ensure the ID is unique
    return result;
}

// Broadcasts a message to all players in a game
function broadcast(game, message) {
    const messageString = JSON.stringify(message);
    if (game.player1 && game.player1.readyState === 1) {
        game.player1.send(messageString);
    }
    if (game.player2 && game.player2.readyState === 1) {
        game.player2.send(messageString);
    }
}


wss.on('connection', (ws) => {
    // Each connection gets a unique ID for tracking
    ws.id = crypto.randomUUID(); 

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const { type, payload } = data;
            const game = games[ws.gameId];

            switch (type) {
                case 'createGame': {
                    const gameId = generateGameId();
                    games[gameId] = {
                        player1: ws,
                        player2: null,
                        secretWord: payload.secretWord,
                        guessesLeft: 20,
                        currentPlayer: 1,
                        messages: [{ type: 'system', text: 'Player 1 has created the game. Waiting for Player 2...' }],
                        lastQuestion: '',
                        status: 'waiting',
                        winner: null
                    };
                    ws.gameId = gameId; // Associate this connection with the game
                    
                    ws.send(JSON.stringify({
                        type: 'gameCreated',
                        payload: { gameId: gameId, gameState: getSanitizedGameState(games[gameId]) }
                    }));
                    break;
                }

                case 'joinGame': {
                    const { gameId } = payload;
                    const gameToJoin = games[gameId];

                    if (gameToJoin) {
                        if (gameToJoin.player2 && gameToJoin.player2.readyState === 1) {
                            ws.send(JSON.stringify({ type: 'error', payload: { message: 'This game is already full.' } }));
                            return;
                        }
                        
                        gameToJoin.player2 = ws;
                        gameToJoin.status = 'active';
                        gameToJoin.currentPlayer = 2; // Give the turn to Player 2
                        ws.gameId = gameId;

                        gameToJoin.messages.push({ type: 'system', text: 'Player 2 has joined! Player 2, ask a question.' });
                        const gameState = getSanitizedGameState(gameToJoin);
                        broadcast(gameToJoin, { type: 'gameUpdate', payload: gameState });
                    } else {
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Game not found.' } }));
                    }
                    break;
                }

                case 'askQuestion': {
                    if (game && game.currentPlayer === 2) {
                        game.lastQuestion = payload.question;
                        game.messages.push({ type: 'question', text: `Q: ${payload.question}` });
                        game.currentPlayer = 1; // Switch to Player 1 to answer

                        const gameState = getSanitizedGameState(game);
                        broadcast(game, { type: 'gameUpdate', payload: gameState });
                    }
                    break;
                }

                case 'sendAnswer': {
                    if (game && game.currentPlayer === 1) {
                        game.guessesLeft--;
                        const answerText = `${game.lastQuestion}\n> ${payload.answer}`;
                        // Replace the last question with a combined question/answer message
                        game.messages.pop(); 
                        game.messages.push({ type: 'answer', text: answerText });
                        
                        if (game.guessesLeft <= 0) {
                            game.status = 'finished';
                            game.winner = 1; // Player 1 wins (guesser ran out of guesses)
                        } else {
                            game.currentPlayer = 2; // Switch back to Player 2
                        }

                        const gameState = getSanitizedGameState(game);
                        // At the end of the game, reveal the secret word
                        if (game.status === 'finished') {
                            gameState.secretWord = game.secretWord;
                        }
                        broadcast(game, { type: 'gameUpdate', payload: gameState });
                    }
                    break;
                }
                
                case 'endGame': {
                     if (game) {
                        game.status = 'finished';
                        game.winner = payload.winner; // Player 2 wins by guessing
                        
                        const gameState = getSanitizedGameState(game);
                        gameState.secretWord = game.secretWord; // Reveal the word
                        broadcast(game, { type: 'gameUpdate', payload: gameState });
                     }
                     break;
                }
            }
        } catch (error) {
            console.error("Failed to process message:", error);
        }
    });

    ws.on('close', () => {
        const game = games[ws.gameId];
        if (game) {
            const isPlayer1 = game.player1 && game.player1.id === ws.id;
            const otherPlayer = isPlayer1 ? game.player2 : game.player1;
            
            // If the other player is still connected, notify them.
            if (otherPlayer && otherPlayer.readyState === 1) {
                game.status = 'finished';
                game.winner = isPlayer1 ? 2 : 1; // The other player wins by default
                const gameState = getSanitizedGameState(game);
                gameState.secretWord = game.secretWord; // Reveal word on disconnect
                gameState.message = 'Your opponent has disconnected. You win!';
                
                otherPlayer.send(JSON.stringify({ 
                   type: 'opponentDisconnected', 
                   payload: gameState
                }));
            }
            // Clean up the game room
            delete games[ws.gameId];
            console.log(`Game ${ws.gameId} closed.`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
