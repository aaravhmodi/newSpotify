// src/spotifyService.ts
import { makeSpotifyRequest } from './auth';
import { 
  SpotifyUser, 
  SpotifyTopTracks, 
  SpotifyTopArtists, 
  SpotifyPlaybackState, 
  SpotifyRecentlyPlayed 
} from './types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return makeSpotifyRequest(`${SPOTIFY_API_BASE}/me`, this.accessToken);
  }

  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<SpotifyTopTracks> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString()
    });
    return makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/top/tracks?${params}`, this.accessToken);
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<SpotifyTopArtists> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString()
    });
    return makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/top/artists?${params}`, this.accessToken);
  }

  async getRecentlyPlayed(limit: number = 50): Promise<SpotifyRecentlyPlayed> {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    return makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/recently-played?${params}`, this.accessToken);
  }

  async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    try {
      return await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player`, this.accessToken);
    } catch (error) {
      // User might not be playing anything
      return null;
    }
  }

  async pausePlayback(): Promise<void> {
    await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/pause`, this.accessToken);
  }

  async resumePlayback(): Promise<void> {
    await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/play`, this.accessToken);
  }

  async skipToNext(): Promise<void> {
    await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/next`, this.accessToken);
  }

  async skipToPrevious(): Promise<void> {
    await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/previous`, this.accessToken);
  }

  async setVolume(volumePercent: number): Promise<void> {
    const params = new URLSearchParams({
      volume_percent: volumePercent.toString()
    });
    await makeSpotifyRequest(`${SPOTIFY_API_BASE}/me/player/volume?${params}`, this.accessToken);
  }
}
