import { useAuth } from "@/context/AuthContext";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { token } = useAuth();

  if (!token) {
    throw new Error("No auth token");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
};
