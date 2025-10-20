// api/callback.js (Node, serverless)
import querystring from "querystring";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Missing code");
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.REDIRECT_URI);
  params.append("client_id", process.env.SPOTIFY_CLIENT_ID);
  params.append("client_secret", process.env.SPOTIFY_CLIENT_SECRET);

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error("Token error:", tokenData);
      return res.status(500).json({ error: tokenData });
    }

    // redirect to frontend with tokens (short demo). For production, set httpOnly cookie.
    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const qs = querystring.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
    return res.redirect(`${frontend}/?${qs}`);
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
