"use client";

import { useEffect, useState } from "react";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [imageView, setImageView] = useState("");

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : data.orders || []);
  };

  // Update statuses
  const updateOrder = async (id: string, field: string, value: string) => {
    let endpoint = "";
    let body = {};

    if (field === "paymentStatus") {
      endpoint = `http://localhost:5000/orders/payment/${id}`;
      body = { status: value }; // backend expects `status`
    } else if (field === "orderStatus") {
      endpoint = `http://localhost:5000/orders/status/${id}`;
      body = { orderStatus: value }; // backend expects `orderStatus`
    } else {
      alert("Invalid update type");
      return;
    }

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;

    const res = await fetch(`http://localhost:5000/orders/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (data.success) fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((o: any) => {
    const match =
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.telegram.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return match;
    return match && (o.paymentStatus === filter || o.orderStatus === filter);
  });

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Orders</h1>

        {/* TOP BAR */}
        <div className={styles.topBar}>
          <input
            className={styles.search}
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
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
                <th>Email</th>
                <th>Telegram</th>
                <th>Screenshot</th>
                <th>Payment</th>
                <th>Order</th>
                <th>Placed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o: any) => (
                <tr key={o._id}>
                  <td>{o.productName}</td>
                  <td>{o.plan}</td>
                  <td>{o.email}</td>
                  <td>{o.telegram}</td>

                  <td>
                    {o.screenshot ? (
                      <button
                        className={styles.ssBtn}
                        onClick={() =>
                          setImageView(`http://localhost:5000${o.screenshot}`)
                        }
                      >
                        View
                      </button>
                    ) : (
                      "No file"
                    )}
                  </td>

                  {/* PAYMENT STATUS */}
                  <td>
                    <span
                      className={`${styles.badge} ${styles[o.paymentStatus]}`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>

                  {/* ORDER STATUS */}
                  <td>
                    <span
                      className={`${styles.badge} ${styles[o.orderStatus]}`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>

                  <td>{new Date(o.createdAt).toLocaleString()}</td>

                  {/* ACTIONS */}
                  <td className={styles.actions}>
                    <button
                      className={styles.green}
                      onClick={() => updateOrder(o._id, "paymentStatus", "paid")}
                    >
                      Mark Paid
                    </button>

                    <button
                      className={styles.blue}
                      onClick={() =>
                        updateOrder(o._id, "orderStatus", "delivered")
                      }
                    >
                      Delivered
                    </button>

                    <button
                      className={styles.yellow}
                      onClick={() =>
                        updateOrder(o._id, "orderStatus", "pending")
                      }
                    >
                      Pending
                    </button>

                    <button
                      className={styles.red}
                      onClick={() =>
                        updateOrder(o._id, "orderStatus", "cancelled")
                      }
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
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Screenshot Viewer */}
        {imageView && (
          <div className={styles.overlay} onClick={() => setImageView("")}>
            <img src={imageView} className={styles.imagePreview} />
          </div>
        )}
      </div>
    </div>
  );
}
