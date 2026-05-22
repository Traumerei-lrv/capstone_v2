const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function fetchSessionProfile(accessToken) {
  const response = await fetch(`${backendBaseUrl}/api/auth/session`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || 'Failed to load profile.');
    error.status = response.status;
    throw error;
  }

  return payload;
}
