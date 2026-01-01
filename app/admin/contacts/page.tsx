"use client";

import { useEffect, useState } from "react";
import styles from "../orders/orders.module.css"; // Reuse similar styles

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.contacts || []);
    } catch (err) {
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    await fetch(`${API_URL}/contact/read/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`${API_URL}/contact/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Contact Messages ({messages.length})</h1>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>No messages yet</td></tr>
              ) : (
                messages.map((m) => (
                  <tr key={m._id} style={{ background: m.read ? "#f9f9f9" : "#fff9e6" }}>
                    <td>{m.name}</td>
                    <td><a href={`mailto:${m.email}`}>{m.email}</a></td>
                    <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{m.message}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td>{m.read ? "Read" : "Unread"}</td>
                    <td className={styles.actions}>
                      {!m.read && (
                        <button className={styles.blue} onClick={() => markRead(m._id)}>
                          Mark Read
                        </button>
                      )}
                      <button className={styles.delete} onClick={() => deleteMessage(m._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}