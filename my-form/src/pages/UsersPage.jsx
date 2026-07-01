import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/beyondsure-logo.png";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

function calcAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Enter the full name.";
  else if (!/^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(name))
    errors.name = "Use letters only, at least 2 characters.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = "Enter a valid email address.";

  if (!values.dob) errors.dob = "Enter a date of birth.";
  else {
    const dobDate = new Date(values.dob);
    if (dobDate > new Date())
      errors.dob = "Date of birth can't be in the future.";
    else if (calcAge(values.dob) < 18) errors.dob = "Must be 18 or older.";
  }

  const mobile = values.mobile.trim();
  if (!mobile) errors.mobile = "Enter a mobile number.";
  else if (!/^\d{10}$/.test(mobile))
    errors.mobile = "Enter a 10-digit mobile number.";
  else if (!/^6/.test(mobile))
    errors.mobile = "Mobile number must start with 6.";

  if (!values.gender) errors.gender = "Select a gender.";

  return errors;
}

// Convert an ISO / date-like string into yyyy-mm-dd for the <input type="date">
function toDateInputValue(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Edit modal state
  const [editUser, setEditUser] = useState(null); // holds the raw user row being edited
  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
    gender: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editServerError, setEditServerError] = useState("");

  // Delete confirmation state
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load users. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDob = (dob) => {
    if (!dob) return "-";
    const d = new Date(dob);
    if (isNaN(d)) return dob;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---------- Edit flow ----------
  const openEdit = (user) => {
    setEditUser(user);
    setEditValues({
      name: user.fullname || "",
      email: user.email || "",
      dob: toDateInputValue(user.dob),
      mobile: user.mobile || "",
      gender: user.gender || "",
    });
    setEditErrors({});
    setEditTouched({});
    setEditServerError("");
  };

  const closeEdit = () => {
    if (editSaving) return;
    setEditUser(null);
  };

  const handleEditChange = (field) => (e) => {
    let val = e.target.value;
    if (field === "mobile") val = val.replace(/\D/g, "").slice(0, 10);
    const next = { ...editValues, [field]: val };
    setEditValues(next);
    if (editTouched[field]) {
      setEditErrors(validate(next));
    }
  };

  const handleEditBlur = (field) => () => {
    setEditTouched((t) => ({ ...t, [field]: true }));
    setEditErrors(validate(editValues));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(editValues).map((k) => [k, true])
    );
    setEditTouched(allTouched);

    const newErrors = validate(editValues);
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setEditSaving(true);
    setEditServerError("");
    try {
      const response = await fetch(
        `http://localhost:5000/users/${editUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullname: editValues.name,
            email: editValues.email,
            dob: editValues.dob,
            mobile: editValues.mobile,
            gender: editValues.gender,
          }),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                fullname: editValues.name,
                email: editValues.email,
                dob: editValues.dob,
                mobile: editValues.mobile,
                gender: editValues.gender,
              }
            : u
        )
      );
      setEditUser(null);
    } catch (err) {
      console.error(err);
      setEditServerError("Couldn't save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  // ---------- Delete flow ----------
  const openDelete = (user) => {
    setDeleteUser(user);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(
        `http://localhost:5000/users/${deleteUser.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      console.error(err);
      setDeleteError("Couldn't delete this record. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="up-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .up-root {
          --bg: #e8f6f0;
          --hex-a: #9fe3b8;
          --hex-b: #57c48a;
          --ink: #142a22;
          --sub: #52645d;
          --line: rgba(79, 157, 128, 0.28);
          --line-focus: #3f8c6e;
          --field-bg: rgba(255, 255, 255, 0.38);
          --accent: #1f8a5b;
          --accent-dark: #146245;
          --error: #c94f4f;

          position: relative;
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(900px 600px at 12% 8%, rgba(159, 227, 184, 0.55), transparent 60%),
            radial-gradient(800px 560px at 88% 92%, rgba(87, 196, 138, 0.5), transparent 60%),
            linear-gradient(160deg, #eafaf3, #dcf1e8 55%, #cfeadf);
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 56px 20px;
          box-sizing: border-box;
        }

        .up-root *, .up-root *::before, .up-root *::after {
          box-sizing: border-box;
        }

        .up-hex {
          position: absolute;
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
          background: linear-gradient(160deg, var(--hex-a), var(--hex-b));
        }
        .up-hex-1 { width: 340px; height: 340px; top: -150px; left: -120px; opacity: 0.55; }
        .up-hex-3 { width: 300px; height: 300px; bottom: -140px; right: -100px; opacity: 0.5; }

        .up-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 940px;
          background: rgba(255, 255, 255, 0.46);
          backdrop-filter: blur(28px) saturate(165%);
          -webkit-backdrop-filter: blur(28px) saturate(165%);
          border-radius: 24px;
          padding: 36px 36px 40px;
          border: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow:
            0 30px 70px -24px rgba(15, 46, 34, 0.35),
            0 2px 8px rgba(15, 46, 34, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .up-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 26px;
          flex-wrap: wrap;
        }

        .up-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .up-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .up-titles h1 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--ink);
          margin: 0 0 2px;
        }
        .up-titles p {
          font-size: 13px;
          color: var(--sub);
          margin: 0;
        }

        .up-actions { display: flex; gap: 10px; }

        .up-btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: transform 0.12s ease, filter 0.12s ease, background 0.15s ease;
        }

        .up-btn-primary {
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #ffffff;
          box-shadow: 0 10px 22px -8px rgba(20, 98, 69, 0.5);
        }
        .up-btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .up-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .up-btn-ghost {
          border: 1.5px solid var(--line);
          background: rgba(255, 255, 255, 0.45);
          color: var(--ink);
        }
        .up-btn-ghost:hover { border-color: var(--line-focus); background: rgba(255, 255, 255, 0.65); }
        .up-btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }

        .up-btn-danger {
          border: 1px solid rgba(201, 79, 79, 0.35);
          background: linear-gradient(135deg, #d15a5a, #b23c3c);
          color: #ffffff;
          box-shadow: 0 10px 22px -8px rgba(178, 60, 60, 0.5);
        }
        .up-btn-danger:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .up-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .up-table-wrap {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.32);
        }

        table.up-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .up-table thead th {
          text-align: left;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 11.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--sub);
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.4);
          border-bottom: 1px solid var(--line);
          white-space: nowrap;
        }

        .up-table tbody td {
          padding: 14px 16px;
          color: var(--ink);
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }

        .up-table tbody tr:last-child td { border-bottom: none; }
        .up-table tbody tr:hover td { background: rgba(255, 255, 255, 0.35); }

        .up-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .up-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--hex-a), var(--hex-b));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
        }

        .up-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          background: rgba(31, 138, 91, 0.12);
          color: var(--accent-dark);
          border: 1px solid rgba(31, 138, 91, 0.22);
        }

        .up-row-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .up-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--line);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
        }
        .up-icon-btn:hover { transform: translateY(-1px); }

        .up-icon-btn.edit:hover {
          border-color: var(--line-focus);
          background: rgba(31, 138, 91, 0.1);
        }
        .up-icon-btn.delete:hover {
          border-color: rgba(201, 79, 79, 0.5);
          background: rgba(201, 79, 79, 0.1);
        }

        .up-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--sub);
        }
        .up-state-title {
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: var(--ink);
          margin: 14px 0 6px;
        }
        .up-state p { font-size: 13.5px; margin: 0 0 18px; }

        .up-spinner {
          width: 30px;
          height: 30px;
          margin: 0 auto;
          border-radius: 50%;
          border: 3px solid var(--line);
          border-top-color: var(--accent);
          animation: up-spin 0.8s linear infinite;
        }
        @keyframes up-spin { to { transform: rotate(360deg); } }

        .up-error-icon, .up-empty-icon {
          width: 46px;
          height: 46px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .up-error-icon { background: rgba(201, 79, 79, 0.12); }
        .up-empty-icon { background: rgba(31, 138, 91, 0.12); }

        .up-count {
          margin-top: 18px;
          text-align: right;
          font-size: 12px;
          color: var(--sub);
        }

        /* ---------- Modal shared ---------- */
        .up-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 26, 20, 0.45);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 50;
        }

        .up-modal {
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 30px 70px -20px rgba(15, 46, 34, 0.4);
          padding: 28px;
        }

        .up-modal-edit { max-width: 420px; }
        .up-modal-delete { max-width: 380px; text-align: center; }

        .up-modal h3 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 19px;
          color: var(--ink);
          margin: 0 0 6px;
        }
        .up-modal-sub {
          font-size: 13px;
          color: var(--sub);
          margin: 0 0 22px;
        }

        .up-field { margin-bottom: 16px; }
        .up-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .up-input, .up-select {
          width: 100%;
          border: 1.5px solid var(--line);
          background: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .up-input:focus, .up-select:focus {
          border-color: var(--line-focus);
          box-shadow: 0 0 0 4px rgba(63, 140, 110, 0.16);
        }
        .up-field.has-error .up-input,
        .up-field.has-error .up-select {
          border-color: var(--error);
        }
        .up-field-error {
          margin-top: 5px;
          font-size: 11.5px;
          color: var(--error);
        }

        .up-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }
        .up-modal-actions .up-btn { flex: 1; }

        .up-server-error {
          margin-top: 14px;
          font-size: 12.5px;
          color: var(--error);
          text-align: center;
        }

        .up-warn-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: rgba(201, 79, 79, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .up-delete-name {
          font-weight: 700;
          color: var(--ink);
        }

        @media (max-width: 640px) {
          .up-card { padding: 26px 18px 30px; border-radius: 18px; }
          .up-table-wrap { overflow-x: auto; }
          table.up-table { min-width: 700px; }
        }
      `}</style>

      <div className="up-hex up-hex-1" />
      <div className="up-hex up-hex-3" />

      <div className="up-card">
        <div className="up-header">
          <div className="up-mark">
            <img src={logo} alt="UAT BeyondSure" className="up-logo" />
            <div className="up-titles">
              <h1>Registered Users</h1>
              <p>Everyone who has submitted the registration form.</p>
            </div>
          </div>
          <div className="up-actions">
            <button
              className="up-btn up-btn-ghost"
              onClick={() => navigate("/")}
            >
              Back to Form
            </button>
            <button className="up-btn up-btn-primary" onClick={fetchUsers}>
              Refresh
            </button>
          </div>
        </div>

        <div className="up-table-wrap">
          {loading ? (
            <div className="up-state">
              <div className="up-spinner" />
              <div className="up-state-title">Loading users…</div>
              <p>Fetching the latest submissions from the server.</p>
            </div>
          ) : error ? (
            <div className="up-state">
              <div className="up-error-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#c94f4f"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v5"
                    stroke="#c94f4f"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1" fill="#c94f4f" />
                </svg>
              </div>
              <div className="up-state-title">Something went wrong</div>
              <p>{error}</p>
              <button className="up-btn up-btn-primary" onClick={fetchUsers}>
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="up-state">
              <div className="up-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                    stroke="#1f8a5b"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
                    stroke="#1f8a5b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="up-state-title">No users yet</div>
              <p>Submissions will show up here once someone fills the form.</p>
              <button
                className="up-btn up-btn-primary"
                onClick={() => navigate("/")}
              >
                Go to Form
              </button>
            </div>
          ) : (
            <table className="up-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Mobile</th>
                  <th>Gender</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const name = user.fullname || user.name || "-";
                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join("");
                  return (
                    <tr key={user.id ?? idx}>
                      <td>
                        <div className="up-name-cell">
                          <div className="up-avatar">{initials || "?"}</div>
                          {name}
                        </div>
                      </td>
                      <td>{user.email || "-"}</td>
                      <td>{formatDob(user.dob)}</td>
                      <td>{user.mobile || "-"}</td>
                      <td>
                        <span className="up-badge">{user.gender || "-"}</span>
                      </td>
                      <td>
                        <div className="up-row-actions">
                          <button
                            className="up-icon-btn edit"
                            title="Edit"
                            onClick={() => openEdit(user)}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                                stroke="#1f8a5b"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            className="up-icon-btn delete"
                            title="Delete"
                            onClick={() => openDelete(user)}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M4 7h16M9 7V4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V7m2 0-.8 12.1A2 2 0 0114.2 21H9.8a2 2 0 01-2-1.9L7 7"
                                stroke="#c94f4f"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && users.length > 0 && (
          <div className="up-count">
            {users.length} {users.length === 1 ? "user" : "users"} total
          </div>
        )}
      </div>

      {/* ---------- Edit Modal ---------- */}
      {editUser && (
        <div className="up-overlay" onClick={closeEdit}>
          <div
            className="up-modal up-modal-edit"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit User</h3>
            <p className="up-modal-sub">
              Update the details and save your changes.
            </p>

            <form onSubmit={handleEditSave} noValidate>
              <div
                className={`up-field ${
                  editTouched.name && editErrors.name ? "has-error" : ""
                }`}
              >
                <label className="up-label" htmlFor="edit-name">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  className="up-input"
                  type="text"
                  value={editValues.name}
                  onChange={handleEditChange("name")}
                  onBlur={handleEditBlur("name")}
                />
                {editTouched.name && editErrors.name && (
                  <div className="up-field-error">{editErrors.name}</div>
                )}
              </div>

              <div
                className={`up-field ${
                  editTouched.email && editErrors.email ? "has-error" : ""
                }`}
              >
                <label className="up-label" htmlFor="edit-email">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  className="up-input"
                  type="email"
                  value={editValues.email}
                  onChange={handleEditChange("email")}
                  onBlur={handleEditBlur("email")}
                />
                {editTouched.email && editErrors.email && (
                  <div className="up-field-error">{editErrors.email}</div>
                )}
              </div>

              <div
                className={`up-field ${
                  editTouched.dob && editErrors.dob ? "has-error" : ""
                }`}
              >
                <label className="up-label" htmlFor="edit-dob">
                  Date of Birth
                </label>
                <input
                  id="edit-dob"
                  className="up-input"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={editValues.dob}
                  onChange={handleEditChange("dob")}
                  onBlur={handleEditBlur("dob")}
                />
                {editTouched.dob && editErrors.dob && (
                  <div className="up-field-error">{editErrors.dob}</div>
                )}
              </div>

              <div
                className={`up-field ${
                  editTouched.mobile && editErrors.mobile ? "has-error" : ""
                }`}
              >
                <label className="up-label" htmlFor="edit-mobile">
                  Mobile Number
                </label>
                <input
                  id="edit-mobile"
                  className="up-input"
                  type="tel"
                  inputMode="numeric"
                  value={editValues.mobile}
                  onChange={handleEditChange("mobile")}
                  onBlur={handleEditBlur("mobile")}
                />
                {editTouched.mobile && editErrors.mobile && (
                  <div className="up-field-error">{editErrors.mobile}</div>
                )}
              </div>

              <div
                className={`up-field ${
                  editTouched.gender && editErrors.gender ? "has-error" : ""
                }`}
              >
                <label className="up-label" htmlFor="edit-gender">
                  Gender
                </label>
                <select
                  id="edit-gender"
                  className="up-select"
                  value={editValues.gender}
                  onChange={handleEditChange("gender")}
                  onBlur={handleEditBlur("gender")}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {editTouched.gender && editErrors.gender && (
                  <div className="up-field-error">{editErrors.gender}</div>
                )}
              </div>

              <div className="up-modal-actions">
                <button
                  type="button"
                  className="up-btn up-btn-ghost"
                  onClick={closeEdit}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="up-btn up-btn-primary"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>

              {editServerError && (
                <div className="up-server-error">{editServerError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {deleteUser && (
        <div className="up-overlay" onClick={closeDelete}>
          <div
            className="up-modal up-modal-delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="up-warn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4M12 17h.01M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
                  stroke="#c94f4f"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Delete this record?</h3>
            <p className="up-modal-sub">
              Are you sure you want to delete{" "}
              <span className="up-delete-name">
                {deleteUser.fullname || deleteUser.name}
              </span>
              ? This action can't be undone.
            </p>

            <div className="up-modal-actions">
              <button
                className="up-btn up-btn-ghost"
                onClick={closeDelete}
                disabled={deleting}
              >
                No, keep it
              </button>
              <button
                className="up-btn up-btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>

            {deleteError && (
              <div className="up-server-error">{deleteError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
