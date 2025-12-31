"use client";

import { useEffect, useState } from "react";
import styles from "./orders.module.css";

// Order Interface
interface Order {
  _id: string;
  productName: string;
  plan: string;
  price: number;
  email: string;
  telegram: string;
  paymentStatus: "paid" | "pending";
  orderStatus: "delivered" | "pending" | "cancelled";
  screenshot?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get token from sessionStorage
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

// Authenticated fetch helper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token. Please log in.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
    throw new Error("Session expired. Redirecting to login...");
  }

  return response;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "delivered" | "cancelled">("all");
  const [imageView, setImageView] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/orders");

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      const fetchedOrders = Array.isArray(data) ? data : data.orders || [];
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Update order field
  const updateOrder = async (id: string, field: "paymentStatus" | "orderStatus", value: string) => {
    let endpoint = "";
    let body = {};

    if (field === "paymentStatus") {
      endpoint = `/orders/payment/${id}`;
      body = { status: value };
    } else if (field === "orderStatus") {
      endpoint = `/orders/status/${id}`;
      body = { orderStatus: value };
    } else {
      alert("Invalid update type");
      return;
    }

    try {
      const res = await apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update order");
      }

      await fetchOrders();
      alert("Order updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update order");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    try {
      const res = await apiFetch(`/orders/${id}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }

      await fetchOrders();
      alert("Order deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to delete order");
    }
  };

  // Filter and search logic
  useEffect(() => {
    const results = orders.filter((o) => {
      const matchesSearch =
        o.email.toLowerCase().includes(search.toLowerCase()) ||
        o.telegram.toLowerCase().includes(search.toLowerCase()) ||
        o.productName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        o.paymentStatus === filter ||
        o.orderStatus === filter;

      return matchesSearch && matchesFilter;
    });

    setFilteredOrders(results);
  }, [search, filter, orders]);

  // Fetch on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Close image on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && imageView) setImageView("");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [imageView]);

  if (loading) {
    return <div className="container"><p>Loading orders...</p></div>;
  }

  if (error) {
    return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Manage Orders</h1>

        {/* TOP BAR */}
        <div className={styles.topBar}>
          <input
            className={styles.search}
            placeholder="Search by email, telegram, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Email</th>
                <th>Telegram</th>
                <th>Screenshot</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.empty}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.productName}</td>
                    <td>{o.plan}</td>
                    <td>₹{o.price}</td>
                    <td>{o.email}</td>
                    <td>{o.telegram}</td>
                    <td>
                      {o.screenshot ? (
                        <button
                          className={styles.ssBtn}
                          onClick={() => setImageView(`${API_URL}${o.screenshot}`)}
                        >
                          View
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[o.paymentStatus.toLowerCase()]}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[o.orderStatus.toLowerCase()]}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.green}
                        onClick={() => updateOrder(o._id, "paymentStatus", "paid")}
                      >
                        Mark Paid
                      </button>
                      <button
                        className={styles.blue}
                        onClick={() => updateOrder(o._id, "orderStatus", "delivered")}
                      >
                        Delivered
                      </button>
                      <button
                        className={styles.yellow}
                        onClick={() => updateOrder(o._id, "orderStatus", "pending")}
                      >
                        Pending
                      </button>
                      <button
                        className={styles.red}
                        onClick={() => updateOrder(o._id, "orderStatus", "cancelled")}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.delete}
                        onClick={() => deleteOrder(o._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Screenshot Viewer */}
        {imageView && (
          <div className={styles.overlay} onClick={() => setImageView("")}>
            <img src={imageView} className={styles.imagePreview} alt="Payment Screenshot" />
          </div>
        )}
      </div>
    </div>
  );
}