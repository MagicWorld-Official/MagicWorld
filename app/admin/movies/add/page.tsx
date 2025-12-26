"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../movies.module.css";

export default function AddMoviePage() {
  const router = useRouter();

  const [movie, setMovie] = useState({
    name: "",
    slug: "",
    industry: "",
    type: "",
    category: "",
    description: "",
    thumbnail: "",
    trailerUrl: "",
    downloadUrl: "",
    watchUrl: ""
  });

  const handleNameChange = (v: string) => {
    setMovie({
      ...movie,
      name: v,
      slug: v.toLowerCase().replace(/\s+/g, "-")
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(movie),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Failed to add movie.");
      console.log(data);
      return;
    }

    router.push("/admin/movies");
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Add Movie / Webseries</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            placeholder="Name"
            value={movie.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <input
            placeholder="Slug"
            value={movie.slug}
            onChange={(e) => setMovie({ ...movie, slug: e.target.value })}
          />

          <textarea
            placeholder="Description"
            value={movie.description}
            onChange={(e) =>
              setMovie({ ...movie, description: e.target.value })
            }
            rows={4}
          />

          <input
            placeholder="Thumbnail URL"
            value={movie.thumbnail}
            onChange={(e) =>
              setMovie({ ...movie, thumbnail: e.target.value })
            }
          />

          <input
            placeholder="Trailer URL"
            value={movie.trailerUrl}
            onChange={(e) =>
              setMovie({ ...movie, trailerUrl: e.target.value })
            }
          />

          <input
            placeholder="Download URL"
            value={movie.downloadUrl}
            onChange={(e) =>
              setMovie({ ...movie, downloadUrl: e.target.value })
            }
          />

          <input
            placeholder="Watch URL"
            value={movie.watchUrl}
            onChange={(e) =>
              setMovie({ ...movie, watchUrl: e.target.value })
            }
          />

          <select
            value={movie.industry}
            onChange={(e) =>
              setMovie({ ...movie, industry: e.target.value })
            }
          >
            <option value="">Industry</option>
            <option value="hollywood">Hollywood</option>
            <option value="bollywood">Bollywood</option>
            <option value="hindi-dubbed">Hindi Dubbed</option>
          </select>

          <select
            value={movie.type}
            onChange={(e) =>
              setMovie({ ...movie, type: e.target.value })
            }
          >
            <option value="">Type</option>
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>

          <select
            value={movie.category}
            onChange={(e) =>
              setMovie({ ...movie, category: e.target.value })
            }
          >
            <option value="">Category</option>
            <option value="movie">Movie</option>
            <option value="webseries">Webseries</option>
          </select>

          <button className={styles.addBtn}>Save</button>
        </form>
      </div>
    </div>
  );
}
