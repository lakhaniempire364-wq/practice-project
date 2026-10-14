import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import "./App.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/todos`;
const NOTES_URL = `${BASE_URL}/notes`;

function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("todos"); // which panel is showing: "todos" or "notes"
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  // NOTES - same pattern as the todo state above
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  // AUTH - track the logged-in user's session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // READ - load todos and notes whenever a user logs in
  useEffect(() => {
    if (session) {
      fetchTodos();
      fetchNotes();
    }
  }, [session]);

  // Attaches the logged-in user's token so the backend knows who is making the request
  const authHeaders = () => ({
    Authorization: `Bearer ${session.access_token}`,
  });

  const fetchTodos = async () => {
    const res = await fetch(API_URL, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setTodos(data);
  };

  // CREATE
  const addTodo = async (e) => {
    e.preventDefault();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message); // shows the message sent by validateTodo middleware
      return;
    }

    setError("");
    setText("");
    fetchTodos();
  };

  // UPDATE
  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text: editText }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setError("");
    setEditId(null);
    setEditText("");
    fetchTodos();
  };

  // DELETE
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchTodos();
  };

  // ----- NOTES - the same four calls, pointed at the /notes API -----

  const fetchNotes = async () => {
    const res = await fetch(NOTES_URL, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setNotes(data);
  };

  // CREATE
  const addNote = async (e) => {
    e.preventDefault();

    const res = await fetch(NOTES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message); // shows the message sent by validateNote middleware
      return;
    }

    setError("");
    setNoteTitle("");
    setNoteContent("");
    fetchNotes();
  };

  // UPDATE
  const startEditNote = (note) => {
    setEditNoteId(note.id);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
  };

  const saveEditNote = async (id) => {
    const res = await fetch(`${NOTES_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title: editNoteTitle, content: editNoteContent }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setError("");
    setEditNoteId(null);
    setEditNoteTitle("");
    setEditNoteContent("");
    fetchNotes();
  };

  // DELETE
  const deleteNote = async (id) => {
    await fetch(`${NOTES_URL}/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchNotes();
  };

  // DEMO - calls the backend's /crash route to test errorHandler
  const triggerServerError = async () => {
    const res = await fetch(`${BASE_URL}/crash`);
    const data = await res.json();
    setError(data.message); // this is the generic message sent by errorHandler
  };

  const logOut = () => supabase.auth.signOut();

  // Switching panels clears any error left over from the other one
  const switchTab = (next) => {
    setTab(next);
    setError("");
  };

  // Not logged in - show the login/signup form instead of the todo list
  if (!session) return <Auth />;

  const showingTodos = tab === "todos";
  const items = showingTodos ? todos : notes;
  const itemLabel = showingTodos ? "todo" : "note";

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <div className="brand">
            <div className="logo-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 9 17 20 6" />
              </svg>
            </div>
            <div>
              <h1>{showingTodos ? "Todo List" : "Notes"}</h1>
              <p className="count">
                {items.length} {items.length === 1 ? itemLabel : `${itemLabel}s`}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logOut}>
            Log Out
          </button>
        </div>

        <div className="tabs">
          <button
            className={showingTodos ? "tab active" : "tab"}
            onClick={() => switchTab("todos")}
          >
            Todos
          </button>
          <button
            className={showingTodos ? "tab" : "tab active"}
            onClick={() => switchTab("notes")}
          >
            Notes
          </button>
        </div>

        {error && (
          <p className="error">
            <span className="error-icon">!</span>
            {error}
          </p>
        )}

        {showingTodos ? (
          <>
            <form onSubmit={addTodo}>
              <input
                type="text"
                placeholder="Add a new todo..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Add
              </button>
            </form>

            {todos.length === 0 ? (
              <div className="empty">
                <p>No todos yet</p>
                <p className="empty-sub">Add your first one above</p>
              </div>
            ) : (
              <ul>
                {todos.map((todo) => (
                  <li key={todo.id}>
                    {editId === todo.id ? (
                      <>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(todo.id)}>
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{todo.text}</span>
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(todo)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTodo(todo.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <form className="stacked" onSubmit={addNote}>
              <input
                type="text"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Details (optional)..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Add Note
              </button>
            </form>

            {notes.length === 0 ? (
              <div className="empty">
                <p>No notes yet</p>
                <p className="empty-sub">Add your first one above</p>
              </div>
            ) : (
              <ul>
                {notes.map((note) => (
                  <li key={note.id} className={editNoteId === note.id ? "note-editing" : ""}>
                    {editNoteId === note.id ? (
                      <>
                        <input
                          type="text"
                          value={editNoteTitle}
                          onChange={(e) => setEditNoteTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                        />
                        <div className="row-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => saveEditNote(note.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditNoteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="note-main">
                          <strong>{note.title}</strong>
                          {note.content && <p>{note.content}</p>}
                        </div>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => startEditNote(note)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="divider" />
        <div className="demo-note">
          <button className="btn btn-ghost btn-sm" onClick={triggerServerError}>
            Test Server Error
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
