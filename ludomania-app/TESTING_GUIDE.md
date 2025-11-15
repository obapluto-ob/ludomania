# 🧪 Ludomania Testing Guide

## 🚀 How to Test the Complete Flow

### **Prerequisites**
1. Make sure the dev server is running:
   ```bash
   cd ludomania-app
   npm run dev
   ```
2. Server should start on `http://localhost:3000`
3. Socket.IO server runs on the same port (integrated)

---

## 📋 **Test Scenario 1: Bot Game (Single Player)**

### **Steps:**
1. **Open browser** → `http://localhost:3000`
2. **Sign in** with your account
3. **Go to Dashboard** → Click "Free Games"
4. **Create Bot Game:**
   - Select "2 Players"
   - Check "Play with Bot"
   - Click "Create Room"
5. **Wait for bot to join** (automatic)
6. **Click "Ready to Play"**
7. **Game should auto-start** and redirect to game board

### **What to Test:**
- ✅ Bot appears in player list immediately
- ✅ Bot is marked as "Ready" automatically
- ✅ Game starts when you click ready
- ✅ You are redirected to game board
- ✅ Board displays correctly (15x15 grid)
- ✅ Your turn - you can roll dice
- ✅ Bot's turn - bot auto-rolls after 1 second
- ✅ Bot auto-plays after 1.5 seconds
- ✅ 50-second timeout - dice auto-rolls if you wait
- ✅ Turn indicator shows whose turn it is
- ✅ Tokens are visible and clickable
- ✅ Valid moves are highlighted

### **Console Logs to Check:**
```
📊 Fetching room data for room: [room-id]
👥 Players data: [{ username: 'You', ... }, { username: 'Bot', is_bot: true }]
🎮 All players ready - auto-starting game...
✅ Game started successfully!
```

---

## 📋 **Test Scenario 2: Multiplayer Game (2 Real Players)**

### **Steps:**

#### **Player 1 (Host):**
1. **Open browser** → `http://localhost:3000`
2. **Sign in** with account 1
3. **Go to Dashboard** → Click "Free Games"
4. **Create Multiplayer Game:**
   - Select "2 Players"
   - **Uncheck** "Play with Bot"
   - Click "Create Room"
5. **Copy the room code** (e.g., ABC123)
6. **Wait for Player 2 to join**
7. **Click "Ready to Play"** when Player 2 joins
8. **Wait for Player 2 to click ready**
9. **Game should auto-start** and redirect both players

#### **Player 2 (Joiner):**
1. **Open new incognito window** → `http://localhost:3000`
2. **Sign in** with account 2 (or create new account)
3. **Go to Dashboard** → Click "Free Games"
4. **Join Game:**
   - Enter room code from Player 1 (e.g., ABC123)
   - Click "Join Room"
5. **Should see Player 1** in player list
6. **Click "Ready to Play"**
7. **Game should auto-start** and redirect both players

### **What to Test:**
- ✅ Player 2 joins and appears in Player 1's UI immediately
- ✅ Player 1 appears in Player 2's UI
- ✅ "Waiting for player..." disappears when Player 2 joins
- ✅ Both players can click "Ready to Play"
- ✅ Game auto-starts when both players ready
- ✅ Both players redirected to game board
- ✅ Mic controls appear (bottom-right corner)
- ✅ Mute/Unmute button works
- ✅ Deafen button works
- ✅ Connection status shows "Connected"
- ✅ Only current player can roll dice
- ✅ Other player sees "Waiting for [Player]'s turn"
- ✅ Real-time updates (no refresh needed)
- ✅ 50-second timeout works for both players

### **Console Logs to Check (Player 1):**
```
📊 Fetching room data for room: [room-id]
👥 Player update detected: { event: 'INSERT', ... }
✅ Processed players: [Player1, Player2]
🎮 Toggling ready state to: true
✅ All players ready? true
🎮 All players ready - auto-starting game...
✅ Game started successfully!
```

### **Console Logs to Check (Player 2):**
```
📊 Fetching room data for room: [room-id]
✅ Processed players: [Player1, Player2]
🎮 Toggling ready state to: true
🎮 Room update detected: { status: 'playing' }
🎮 Game started! Redirecting to game board...
```

---

## 📋 **Test Scenario 3: Game Board Design**

### **What to Check:**
1. **Board Layout:**
   - ✅ 15x15 grid visible
   - ✅ 4 home zones (red, blue, green, yellow) in corners
   - ✅ Each home zone has 4 token spots
   - ✅ Main path (52 squares) around the board
   - ✅ Safe positions marked with gold stars
   - ✅ Finish lanes (colored paths to center)
   - ✅ Center triangle (finish area)

2. **Colors:**
   - ✅ Red home zone (bottom-left) - vibrant red gradient
   - ✅ Blue home zone (top-left) - vibrant blue gradient
   - ✅ Green home zone (top-right) - vibrant green gradient
   - ✅ Yellow home zone (bottom-right) - vibrant yellow gradient
   - ✅ Path squares - white with gray borders
   - ✅ Wooden board frame - amber/brown gradient

3. **Responsive Design:**
   - ✅ Mobile (< 640px) - smaller cells, compact layout
   - ✅ Tablet (640px - 1024px) - medium cells
   - ✅ Desktop (> 1024px) - large cells, side-by-side layout

4. **Tokens:**
   - ✅ 3D appearance with shadows
   - ✅ Correct colors matching player
   - ✅ Glow effect on valid moves
   - ✅ Pulse animation on selected token
   - ✅ Tokens stack when multiple on same square

---

## 🐛 **Common Issues to Test**

### **Issue 1: Player Join Not Showing**
**Test:** Player 2 joins but Player 1 doesn't see them
**Expected:** Player 1's UI updates immediately (real-time subscription)
**Console:** Should see `👥 Player update detected`

### **Issue 2: Ready Button Not Working**
**Test:** Both players click ready but game doesn't start
**Expected:** Game auto-starts when all players ready
**Console:** Should see `🎮 All players ready - auto-starting game...`

### **Issue 3: Bot Not Playing**
**Test:** Bot's turn but bot doesn't roll/move
**Expected:** Bot auto-rolls after 1 second, auto-plays after 1.5 seconds
**Console:** Should see `🤖 Bot's turn - auto-rolling...` and `🤖 Bot auto-playing...`

### **Issue 4: Wrong Player Can Roll**
**Test:** Try rolling dice when it's not your turn
**Expected:** Server rejects the roll
**Console:** Should see `❌ Not your turn!`

### **Issue 5: No Real-Time Updates**
**Test:** Player 1 rolls dice, Player 2 doesn't see it
**Expected:** Socket.IO broadcasts to all players
**Console:** Should see `🎲 Dice rolled:` on both clients

### **Issue 6: 50-Second Timeout Not Working**
**Test:** Wait 50 seconds without rolling
**Expected:** Dice auto-rolls and turn advances
**Console:** Should see `⏰ Turn timeout - auto-rolling dice`

---

## 📊 **Performance Checks**

1. **Page Load Time:**
   - ✅ Dashboard loads < 2 seconds
   - ✅ Game board loads < 3 seconds

2. **Real-Time Latency:**
   - ✅ Player join updates < 500ms
   - ✅ Dice roll updates < 200ms
   - ✅ Token move updates < 200ms

3. **Memory Usage:**
   - ✅ No memory leaks (check DevTools)
   - ✅ Socket connections properly cleaned up

---

## 🎯 **Success Criteria**

**All tests pass if:**
1. ✅ Bot games work perfectly (auto-play, turn management)
2. ✅ Multiplayer games work perfectly (real-time updates, auto-start)
3. ✅ Board displays correctly on all devices
4. ✅ Turn management enforced (only current player can roll)
5. ✅ 50-second timeout works
6. ✅ Mic controls work in multiplayer
7. ✅ No console errors
8. ✅ No refresh needed for updates

---

## 🔧 **Debugging Tips**

1. **Open DevTools Console** (F12) to see all logs
2. **Check Network Tab** for Socket.IO connections
3. **Check Application Tab** → Local Storage for Supabase session
4. **Use React DevTools** to inspect component state
5. **Check Supabase Dashboard** for database records

---

## 📝 **Report Issues**

If you find any issues, note:
1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Console logs** (copy relevant logs)
5. **Screenshots** (if visual issue)

