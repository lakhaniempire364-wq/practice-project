import { useState } from "react";
import { supabase } from "./supabaseClient";

// Simple email/password sign up + log in form.
// Shown instead of the todo list when there is no logged-in user.
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Signed up! You can now log in.");
  };

  const logIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    // on success, App.jsx's onAuthStateChange listener updates the session automatically
  };

  return (
    <div className="page">
      <div className="card">
        <div className="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 12 9 17 20 6" />
          </svg>
        </div>
        <h1>Todo List</h1>
        <p className="subtitle">Log in or sign up to manage your todos.</p>

        {message && (
          <p className="error">
            <span className="error-icon">!</span>
            {message}
          </p>
        )}

        <form className="stacked">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" onClick={logIn}>
            Log In
          </button>
          <button className="btn btn-outline" onClick={signUp}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
