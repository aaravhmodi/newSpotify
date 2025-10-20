// src/auth.ts
export const SPOTIFY_SCOPES = [
  "user-read-recently-played",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-top-read",
  "user-modify-playback-state"
].join(" ");

export function spotifyAuthorizeUrl(clientId: string, redirectUri: string) {
  const base = "https://accounts.spotify.com/authorize";
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES
  });
  return `${base}?${params.toString()}`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('spotify_access_token');
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem('spotify_refresh_token');
}

export function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('spotify_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('spotify_refresh_token', refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://spotifywrapped.xo.je';
    const response = await fetch(`${backendUrl}/refresh.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh_token: refreshToken })
    });
    const data = await response.json();
    
    if (data.access_token) {
      storeTokens(data.access_token, data.refresh_token || refreshToken);
      return data.access_token;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  
  return null;
}

export async function makeSpotifyRequest(url: string, accessToken: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const newToken = await refreshAccessToken();
    if (newToken) {
      return makeSpotifyRequest(url, newToken);
    } else {
      throw new Error('Authentication failed');
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
