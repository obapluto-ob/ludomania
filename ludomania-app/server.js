require('dotenv').config({ path: '.env.local' });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Store active games in memory
const activeGames = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('create-game', async (data) => {
      const { gameId, playerId, username, wagerAmount } = data;
      
      activeGames.set(gameId, {
        id: gameId,
        players: [{ id: playerId, username, socketId: socket.id }],
        wagerAmount,
        gameState: null,
      });

      socket.join(gameId);
      socket.emit('game-created', { gameId });
    });

    socket.on('join-game', async (data) => {
      const { gameId, playerId, username } = data;
      const game = activeGames.get(gameId);

      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (game.players.length >= 2) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }

      game.players.push({ id: playerId, username, socketId: socket.id });
      socket.join(gameId);

      // Start game when 2 players joined
      if (game.players.length === 2) {
        io.to(gameId).emit('game-started', {
          players: game.players,
        });
      }
    });

    socket.on('roll-dice', (data) => {
      const { gameId } = data;
      const diceValue = Math.floor(Math.random() * 6) + 1;
      
      io.to(gameId).emit('dice-rolled', { diceValue });
    });

    socket.on('move-token', (data) => {
      const { gameId, playerId, tokenId, newPosition } = data;
      
      io.to(gameId).emit('token-moved', {
        playerId,
        tokenId,
        newPosition,
      });
    });

    socket.on('game-won', async (data) => {
      const { gameId, winnerId } = data;
      const game = activeGames.get(gameId);

      if (!game) return;

      const winner = game.players.find((p) => p.id === winnerId);
      const loser = game.players.find((p) => p.id !== winnerId);

      if (!winner || !loser) return;

      // Update database
      try {
        // Update game status
        await supabase
          .from('games')
          .update({
            status: 'completed',
            winner_id: winnerId,
            completed_at: new Date().toISOString(),
          })
          .eq('id', gameId);

        // Get current balances
        const { data: winnerProfile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', winnerId)
          .single();

        // Update winner's wallet
        await supabase
          .from('profiles')
          .update({
            wallet_balance: (winnerProfile?.wallet_balance || 0) + game.wagerAmount * 2,
          })
          .eq('id', winnerId);

        // Create transaction records
        await supabase.from('transactions').insert([
          {
            user_id: winnerId,
            type: 'game_win',
            amount: game.wagerAmount * 2,
            status: 'completed',
          },
          {
            user_id: loser.id,
            type: 'game_loss',
            amount: game.wagerAmount,
            status: 'completed',
          },
        ]);

        io.to(gameId).emit('game-ended', {
          winnerId,
          winnerUsername: winner.username,
          loserUsername: loser.username,
          amount: game.wagerAmount * 2,
        });

        // Clean up
        activeGames.delete(gameId);
      } catch (error) {
        console.error('Error updating game result:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Handle player disconnection
      activeGames.forEach((game, gameId) => {
        const playerIndex = game.players.findIndex((p) => p.socketId === socket.id);
        if (playerIndex !== -1) {
          io.to(gameId).emit('player-disconnected', {
            playerId: game.players[playerIndex].id,
          });
        }
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

