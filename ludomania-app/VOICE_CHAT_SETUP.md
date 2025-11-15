# 🎤 VOICE CHAT INTEGRATION GUIDE

## 📋 OVERVIEW

This guide will help you integrate voice chat into Ludomania using **Daily.co** - a simple, reliable video/audio API.

---

## 🎯 WHY DAILY.CO?

✅ **Free Tier**: 10,000 minutes/month (enough for 166 hours of gameplay)  
✅ **Easy Integration**: Simple JavaScript SDK  
✅ **High Quality**: Crystal-clear audio  
✅ **Built-in Features**: Mute/unmute, volume control  
✅ **No Backend Required**: Works client-side  
✅ **Mobile Support**: Works on iOS and Android browsers  

---

## 🚀 SETUP STEPS

### **STEP 1: Create Daily.co Account**

1. Go to https://dashboard.daily.co/signup
2. Sign up with your email
3. Verify your email
4. You'll be redirected to the dashboard

---

### **STEP 2: Get API Key**

1. In the Daily.co dashboard, click **"Developers"** in the left sidebar
2. Click **"API Keys"**
3. Copy your **API key** (starts with a long string)
4. Save it - you'll need it for the `.env.local` file

---

### **STEP 3: Add Environment Variable**

Add this to your `ludomania-app/.env.local` file:

```env
NEXT_PUBLIC_DAILY_API_KEY=your_daily_api_key_here
```

**IMPORTANT:** Also add this to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_DAILY_API_KEY` with your API key
3. Select all environments (Production, Preview, Development)
4. Click Save

---

### **STEP 4: Install Daily.co Package**

Run this command in the `ludomania-app` directory:

```bash
npm install @daily-co/daily-js
```

---

### **STEP 5: Create Voice Chat Components**

I've already created these components for you:

```
components/VoiceChat/
├── VoiceRoom.tsx           # Main voice chat component
├── MicButton.tsx           # Mute/unmute button
├── SpeakingIndicator.tsx   # Visual feedback for who's speaking
└── index.ts                # Exports
```

---

### **STEP 6: Integrate into Game**

The voice chat is automatically integrated into the game room. When players join a game:

1. **Voice room is created** with the game ID
2. **Players auto-join** the voice room
3. **Microphone is muted by default** (players can unmute)
4. **Speaking indicators** show who's talking
5. **Players can mute/unmute** themselves
6. **Voice room closes** when game ends

---

## 🎮 HOW IT WORKS

### **Room Creation Flow:**

```
1. Player creates money game
   ↓
2. GameAdapter creates Daily.co room
   ↓
3. Room URL is stored in game state
   ↓
4. When opponent joins, they get the room URL
   ↓
5. Both players join the voice room
   ↓
6. Voice chat is active during gameplay
```

### **Voice Room Lifecycle:**

```
Game Start → Create Room → Players Join → Voice Active → Game End → Room Closes
```

---

## 🔧 COMPONENT USAGE

### **VoiceRoom Component**

**Props:**
```typescript
interface VoiceRoomProps {
  roomUrl: string;          // Daily.co room URL
  username: string;         // Player's username
  onJoined?: () => void;    // Callback when joined
  onLeft?: () => void;      // Callback when left
  onError?: (error: string) => void;  // Error callback
}
```

**Features:**
- Auto-joins room on mount
- Auto-leaves room on unmount
- Mute/unmute button
- Speaking indicators for all participants
- Error handling
- Connection status display

---

### **MicButton Component**

**Features:**
- Toggle mute/unmute
- Visual feedback (red when muted, green when active)
- Microphone icon changes
- Tooltip showing status
- Keyboard shortcut (M key)

---

### **SpeakingIndicator Component**

**Features:**
- Shows all participants
- Pulsing animation when speaking
- Volume level visualization
- Muted indicator
- Color-coded by player

---

## 📱 USER EXPERIENCE

### **Player Perspective:**

1. **Join Game** → "Connecting to voice chat..."
2. **Connected** → "Voice chat connected ✓"
3. **Muted by Default** → Click mic button to unmute
4. **See Who's Talking** → Pulsing indicator around speaking player
5. **Mute/Unmute Anytime** → Click mic button or press M key
6. **Game Ends** → Voice chat automatically disconnects

---

## 🎨 UI ELEMENTS

### **Mic Button:**
- **Muted**: Red background, crossed-out mic icon
- **Active**: Green background, mic icon
- **Hover**: Scale animation
- **Position**: Bottom-right of game board

### **Speaking Indicators:**
- **Not Speaking**: Gray circle
- **Speaking**: Pulsing colored ring
- **Muted**: Red slash icon
- **Position**: On player panels

---

## 🔒 PRIVACY & PERMISSIONS

### **Microphone Permission:**

When a player joins a game, the browser will ask:
> "Ludomania wants to use your microphone"

**Players must click "Allow"** to use voice chat.

If they click "Block":
- Voice chat won't work
- They can still play the game
- They can enable it later in browser settings

---

## 💰 COST BREAKDOWN

### **Daily.co Free Tier:**
- **10,000 minutes/month** = 166 hours
- **Unlimited rooms**
- **Up to 4 participants per room** (perfect for Ludo)

### **Example Usage:**
- **Average game**: 15 minutes
- **Games per month**: 10,000 ÷ 15 = 666 games
- **Cost**: $0

### **When to Upgrade:**
If you exceed 10,000 minutes/month:
- **Starter Plan**: $99/month for 50,000 minutes
- **Growth Plan**: $249/month for 150,000 minutes

---

## 🐛 TROUBLESHOOTING

### **"Microphone not working"**
- Check browser permissions
- Make sure HTTPS is enabled (required for mic access)
- Try a different browser

### **"Can't hear opponent"**
- Check opponent's mic is unmuted
- Check your volume settings
- Refresh the page

### **"Voice chat not connecting"**
- Check API key is correct
- Check environment variable is set
- Check Daily.co dashboard for errors

---

## ✅ TESTING CHECKLIST

- [ ] Create Daily.co account
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Add to Vercel environment variables
- [ ] Install `@daily-co/daily-js` package
- [ ] Test voice chat in development
- [ ] Test with 2 players
- [ ] Test mute/unmute
- [ ] Test speaking indicators
- [ ] Deploy to Vercel
- [ ] Test in production

---

## 📞 SUPPORT

**Daily.co Documentation:**  
https://docs.daily.co/

**Daily.co Support:**  
support@daily.co

**Ludomania Issues:**  
Ask me for help! 🚀

---

**Status:** READY TO IMPLEMENT  
**Estimated Time:** 30 minutes  
**Difficulty:** Easy ⭐⭐☆☆☆

