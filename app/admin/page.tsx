"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  if (loading) return <p>Checking admin access…</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
