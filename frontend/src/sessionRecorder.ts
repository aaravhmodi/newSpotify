// src/sessionRecorder.ts
import { SpotifyTrack, ListeningSession } from './types';

export class SessionRecorder {
  private sessionId: string;
  private isRecording: boolean = false;
  private recordingInterval: NodeJS.Timeout | null = null;
  private currentSession: ListeningSession | null = null;
  private lastTrackId: string | null = null;
  private lastProgress: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  startRecording(): void {
    if (this.isRecording) return;

    this.isRecording = true;
    this.currentSession = {
      sessionId: this.sessionId,
      startedAt: new Date().toISOString(),
      stops: [],
      totalListeningMs: 0
    };

    // Record every 30 seconds
    this.recordingInterval = setInterval(() => {
      this.recordCurrentState();
    }, 30000);

    console.log('Session recording started');
  }

  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.currentSession) {
      this.saveSession();
    }

    console.log('Session recording stopped');
  }

  private async recordCurrentState(): Promise<void> {
    try {
      const accessToken = localStorage.getItem('spotify_access_token');
      if (!accessToken) return;

      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) return;

      const playbackState = await response.json();
      
      if (playbackState && playbackState.item && playbackState.is_playing) {
        const currentTrack = playbackState.item;
        const currentProgress = playbackState.progress_ms;
        const deviceName = playbackState.device?.name || 'Unknown Device';

        // Only record if track changed or significant progress made
        if (currentTrack.id !== this.lastTrackId || 
            Math.abs(currentProgress - this.lastProgress) > 10000) {
          
          if (this.currentSession) {
            this.currentSession.stops.push({
              timestamp: new Date().toISOString(),
              track: currentTrack,
              progress_ms: currentProgress,
              device: deviceName
            });

            this.currentSession.totalListeningMs += Math.abs(currentProgress - this.lastProgress);
          }

          this.lastTrackId = currentTrack.id;
          this.lastProgress = currentProgress;
        }
      }
    } catch (error) {
      console.error('Error recording session state:', error);
    }
  }

  private saveSession(): void {
    if (!this.currentSession) return;

    // Save to localStorage
    const existingSessions = this.getStoredSessions();
    existingSessions.push(this.currentSession);
    localStorage.setItem('spotify_sessions', JSON.stringify(existingSessions));

    // Also save current session separately for easy access
    localStorage.setItem('current_session', JSON.stringify(this.currentSession));
  }

  getStoredSessions(): ListeningSession[] {
    try {
      const sessions = localStorage.getItem('spotify_sessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  getCurrentSession(): ListeningSession | null {
    try {
      const session = localStorage.getItem('current_session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error loading current session:', error);
      return null;
    }
  }

  exportSession(sessionId?: string): string | null {
    const sessions = this.getStoredSessions();
    const session = sessionId 
      ? sessions.find(s => s.sessionId === sessionId)
      : this.getCurrentSession();

    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  downloadSession(sessionId?: string): void {
    const sessionData = this.exportSession(sessionId);
    if (!sessionData) return;

    const blob = new Blob([sessionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotify-session-${sessionId || 'current'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearAllSessions(): void {
    localStorage.removeItem('spotify_sessions');
    localStorage.removeItem('current_session');
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
