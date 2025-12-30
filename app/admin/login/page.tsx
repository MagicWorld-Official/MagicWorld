"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError("Invalid credentials");
      return;
    }

    // ✅ SAVE TOKEN
    localStorage.setItem("adminToken", data.token);

    // ✅ GO TO DASHBOARD
    window.location.href = "/admin";
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={submit}>Login</button>
    </div>
  );
}
