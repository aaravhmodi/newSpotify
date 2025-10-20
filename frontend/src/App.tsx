import React, { useState, useEffect } from 'react';
import { SpotifyService } from './spotifyService';
import { SessionRecorder } from './sessionRecorder';
import { spotifyAuthorizeUrl, getStoredToken, storeTokens, clearTokens } from './auth';
import { SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyPlaybackState } from './types';
import './App.css';

// Your Spotify app credentials
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || '4098bcdb0b324483aceb93a29c6e6a96';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'https://spotifywrapped.xo.je/callback.php';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [currentPlayback, setCurrentPlayback] = useState<SpotifyPlaybackState | null>(null);
  const [sessionRecorder] = useState(() => new SessionRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for tokens in URL (from callback)
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      storeTokens(accessToken, refreshToken || undefined);
      // Clean URL
      window.history.replaceState({}, '', '/');
      setIsAuthenticated(true);
    } else if (getStoredToken()) {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    const accessToken = getStoredToken();
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const spotifyService = new SpotifyService(accessToken);
      
      // Load user profile
      const userData = await spotifyService.getCurrentUser();
      setUser(userData);

      // Load top tracks and artists
      const [tracksData, artistsData] = await Promise.all([
        spotifyService.getTopTracks('medium_term', 10),
        spotifyService.getTopArtists('medium_term', 10)
      ]);

      setTopTracks(tracksData.items);
      setTopArtists(artistsData.items);

      // Load current playback
      const playback = await spotifyService.getCurrentPlayback();
      setCurrentPlayback(playback);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load Spotify data. Please try logging in again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    const authUrl = spotifyAuthorizeUrl(CLIENT_ID, REDIRECT_URI);
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    setTopTracks([]);
    setTopArtists([]);
    setCurrentPlayback(null);
    setError(null);
    
    if (isRecording) {
      sessionRecorder.stopRecording();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      sessionRecorder.stopRecording();
      setIsRecording(false);
    } else {
      sessionRecorder.startRecording();
      setIsRecording(true);
    }
  };

  const downloadSession = () => {
    sessionRecorder.downloadSession();
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatProgress = (current: number, total: number): number => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div>Loading your Spotify data...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1>🎵 Spotify Wrapped</h1>
          <p>Discover your music listening patterns and create your personal Spotify analytics</p>
          <button className="btn" onClick={handleLogin}>
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🎵 Spotify Wrapped</h1>
        <div>
          <button className="btn" onClick={handleLogout} style={{ marginRight: '10px' }}>
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {user && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            {user.images[0] && (
              <img 
                src={user.images[0].url} 
                alt={user.display_name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '20px' }}
              />
            )}
            <div>
              <h2>Welcome, {user.display_name}!</h2>
              <p>{user.followers.total.toLocaleString()} followers</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Recording Controls */}
      <div className="card">
        <h2>🎙️ Session Recording</h2>
        <p>Record your listening sessions to track your music habits over time.</p>
        <div className="session-controls">
          <button 
            className={`btn ${isRecording ? 'btn-danger' : ''}`}
            onClick={toggleRecording}
          >
            {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
          </button>
          <button className="btn" onClick={downloadSession}>
            📥 Download Session
          </button>
        </div>
        {isRecording && (
          <div style={{ marginTop: '15px', color: '#1db954' }}>
            🔴 Recording active - tracking your listening...
          </div>
        )}
      </div>

      {/* Current Playback */}
      {currentPlayback && currentPlayback.item && (
        <div className="card">
          <h2>🎵 Now Playing</h2>
          <div className="track-item">
            <img 
              src={currentPlayback.item.album.images[0]?.url} 
              alt={currentPlayback.item.album.name}
              className="track-image"
            />
            <div className="track-info">
              <h3>{currentPlayback.item.name}</h3>
              <p>{currentPlayback.item.artists.map(a => a.name).join(', ')}</p>
              <p>{currentPlayback.item.album.name}</p>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${formatProgress(currentPlayback.progress_ms, currentPlayback.item.duration_ms)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ccc' }}>
            <span>{formatDuration(currentPlayback.progress_ms)}</span>
            <span>{formatDuration(currentPlayback.item.duration_ms)}</span>
          </div>
        </div>
      )}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div className="card">
          <h2>🔥 Your Top Tracks</h2>
          {topTracks.map((track, index) => (
            <div key={track.id} className="track-item">
              <div style={{ 
                width: '30px', 
                textAlign: 'center', 
                fontWeight: 'bold', 
                color: '#1db954',
                marginRight: '15px'
              }}>
                {index + 1}
              </div>
              <img 
                src={track.album.images[0]?.url} 
                alt={track.album.name}
                className="track-image"
              />
              <div className="track-info">
                <h3>{track.name}</h3>
                <p>{track.artists.map(a => a.name).join(', ')}</p>
                <p>{track.album.name} • {formatDuration(track.duration_ms)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Artists */}
      {topArtists.length > 0 && (
        <div className="card">
          <h2>🎤 Your Top Artists</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {topArtists.map((artist, index) => (
              <div key={artist.id} style={{ textAlign: 'center' }}>
                <img 
                  src={artist.images[0]?.url} 
                  alt={artist.name}
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    marginBottom: '10px'
                  }}
                />
                <h3 style={{ margin: '5px 0' }}>{index + 1}. {artist.name}</h3>
                <p style={{ color: '#ccc', fontSize: '14px' }}>
                  {artist.followers.total.toLocaleString()} followers
                </p>
                <p style={{ color: '#1db954', fontSize: '12px' }}>
                  {artist.genres.slice(0, 2).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="card">
        <h2>📊 Your Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{topTracks.length}</div>
            <div className="stat-label">Top Tracks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{topArtists.length}</div>
            <div className="stat-label">Top Artists</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {topTracks.reduce((total, track) => total + track.duration_ms, 0) > 0 
                ? Math.round(topTracks.reduce((total, track) => total + track.duration_ms, 0) / 60000)
                : 0}
            </div>
            <div className="stat-label">Minutes of Music</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(topTracks.flatMap(track => track.artists.map(a => a.id))).size}
            </div>
            <div className="stat-label">Unique Artists</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
