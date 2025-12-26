"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./movies.module.css";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchMovies = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`);
    const data = await res.json();
    setMovies(data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const deleteMovie = async (slug: string) => {
    if (!confirm("Delete this movie?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/movies/${slug}`, {
      method: "DELETE",
    });

    fetchMovies();
  };

  const toggleSelect = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return alert("No movies selected.");
    if (!confirm("Delete selected movies?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/movies/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: selected }),
    });

    setSelected([]);
    fetchMovies();
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.topBar}>
          <h1>Manage Movies & Webseries</h1>

          <div>
            {selected.length > 0 && (
              <button onClick={deleteSelected} className={styles.delete}>
                Delete Selected ({selected.length})
              </button>
            )}

            <Link href="/admin/movies/add" className={styles.addBtn}>
              Add New
            </Link>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Select</th>
              <th>Image</th>
              <th>Name</th>
              <th>Industry</th>
              <th>Type</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {movies.map((movie: any) => (
              <tr key={movie._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(movie.slug)}
                    onChange={() => toggleSelect(movie.slug)}
                  />
                </td>

                <td>
                  <img src={movie.image} className={styles.img} />
                </td>

                <td>{movie.name}</td>
                <td>{movie.industry}</td>
                <td>{movie.type}</td>
                <td>{movie.category}</td>

                <td>
                  <Link
                    href={`/admin/movies/${movie.slug}`}
                    className={styles.edit}
                  >
                    Edit
                  </Link>

                  <button
                    className={styles.delete}
                    onClick={() => deleteMovie(movie.slug)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movies.length === 0 && <p>No movies found.</p>}
      </div>
    </div>
  );
}
