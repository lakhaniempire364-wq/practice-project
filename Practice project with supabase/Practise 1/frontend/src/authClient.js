const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STORAGE_KEY = "mongodb_todo_session";

let listeners = [];

function emitAuthStateChange(session) {
  listeners.forEach((callback) => {
    try {
      callback("SIGNED_IN", session);
    } catch (e) {
      console.error(e);
    }
  });
}

export const auth = {
  // Sign up a new user via the backend Express / MongoDB API
  async signUp({ email, password }) {
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { data: null, error: { message: data.message || "Failed to sign up" } };
      }

      const session = {
        access_token: data.access_token,
        user: data.user,
      };

      // Automatically store session and log in upon successful sign up
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      emitAuthStateChange(session);

      return { data: { session, user: data.user }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message || "Network error" } };
    }
  },

  // Log in an existing user
  async signInWithPassword({ email, password }) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { data: null, error: { message: data.message || "Failed to log in" } };
      }

      const session = {
        access_token: data.access_token,
        user: data.user,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      emitAuthStateChange(session);

      return { data: { session, user: data.user }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message || "Network error" } };
    }
  },

  // Retrieve existing logged-in session from localStorage
  async getSession() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const session = stored ? JSON.parse(stored) : null;
      return { data: { session }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  // Listen to login / logout state changes
  onAuthStateChange(callback) {
    listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners = listeners.filter((cb) => cb !== callback);
          },
        },
      },
    };
  },

  // Log out current user
  async signOut() {
    localStorage.removeItem(STORAGE_KEY);
    emitAuthStateChange(null);
    return { error: null };
  },
};

// Aliased as supabase for backward-compatibility with existing components
export const supabase = { auth };
