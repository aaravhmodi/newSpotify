# 🎵 Spotify Wrapped - Personal Music Analytics

A beautiful, modern web application that provides Spotify Wrapped-style analytics for your music listening habits. Track your top tracks, artists, and record listening sessions with a sleek, responsive interface.

## ✨ Features

- **🔐 Secure Authentication** - OAuth 2.0 with Spotify
- **📊 Personal Analytics** - View your top tracks and artists
- **🎵 Real-time Playback** - See what you're currently playing
- **📝 Session Recording** - Track your listening habits over time
- **💾 Data Export** - Download your session data as JSON
- **📱 Responsive Design** - Works perfectly on all devices
- **🚀 Serverless Backend** - Deploy easily with Vercel

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: PHP (hosted separately)
- **Styling**: CSS3 with modern gradients and animations
- **Authentication**: Spotify Web API OAuth 2.0
- **Data Storage**: LocalStorage for session data

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Spotify Developer Account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/aaravhmodi/newSpotify.git
cd newSpotify
npm install
```

### 2. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your **Client ID** and **Client Secret**
4. Add these redirect URIs:
   - `https://spotifywrapped.xo.je/callback.php` (for PHP backend)
   - `https://your-app.vercel.app/api/callback` (for serverless backend)

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret_here
REACT_APP_REDIRECT_URI=https://spotifywrapped.xo.je/callback.php
```

### 4. Run Locally

```bash
npm start
```

Visit `http://localhost:3000` and click "Login with Spotify" to get started!

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `REACT_APP_SPOTIFY_CLIENT_ID`: Your Spotify Client ID
   - `REACT_APP_SPOTIFY_CLIENT_SECRET`: Your Spotify Client Secret
   - `REACT_APP_REDIRECT_URI`: Your callback URL

4. **Update Spotify App Settings**:
   - Add your production redirect URI to Spotify Developer Dashboard

## 📁 Project Structure

```
newSpotify/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── auth.ts           # Authentication utilities
│   ├── spotifyService.ts # Spotify API service
│   ├── sessionRecorder.ts # Session recording logic
│   ├── types.ts          # TypeScript interfaces
│   ├── App.tsx           # Main application component
│   └── index.tsx         # App entry point
├── backend/              # PHP backend (deploy separately)
│   ├── callback.php      # OAuth callback handler
│   ├── refresh.php       # Token refresh endpoint
│   └── .htaccess         # Security configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 API Endpoints

### Authentication Flow

1. **Authorization**: `GET /` → Redirects to Spotify OAuth
2. **Callback**: `GET /api/callback` → Exchanges code for tokens
3. **Refresh**: `GET /api/refresh` → Refreshes expired tokens

### Spotify API Integration

- **User Profile**: `/me`
- **Top Tracks**: `/me/top/tracks`
- **Top Artists**: `/me/top/artists`
- **Recently Played**: `/me/player/recently-played`
- **Current Playback**: `/me/player`

## 🎨 Customization

### Styling
- Modify `src/index.css` for global styles
- Update `src/App.css` for component-specific styles
- Colors and themes can be customized in CSS variables

### Features
- Add new Spotify API endpoints in `spotifyService.ts`
- Extend session recording in `sessionRecorder.ts`
- Add new UI components in the `src/` directory

## 🔒 Security Features

- **Server-side Token Exchange** - Client secrets never exposed
- **Automatic Token Refresh** - Seamless authentication
- **CORS Protection** - Proper cross-origin handling
- **Environment Variables** - Secure credential storage

## 📊 Session Recording

The app includes a powerful session recording feature:

- **Automatic Tracking** - Records every 30 seconds
- **Local Storage** - Data stored securely in browser
- **Export Functionality** - Download sessions as JSON
- **Progress Tracking** - Monitor listening time and patterns

## 🐛 Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure exact match between Spotify dashboard and environment variables
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client"**
   - Verify Client ID and Secret are correct
   - Check environment variables are set properly

3. **CORS errors**
   - Ensure backend is running on correct port
   - Check CORS headers in serverless functions

4. **Token refresh fails**
   - Verify refresh token is stored correctly
   - Check network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Spotify Web API for providing the music data
- Vercel for serverless hosting
- React team for the amazing framework
- All contributors and users

---

**Happy listening! 🎵**

Built with ❤️ using React, TypeScript, and the Spotify Web API.
