"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../movies.module.css";

export default function EditMoviePage() {
  const { slug } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);

  const fetchMovie = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${slug}`);
    const data = await res.json();
    setMovie(data);
  };

  useEffect(() => {
    fetchMovie();
  }, []);

  if (!movie) return <p>Loading...</p>;

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

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/movies/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(movie),
    });

    router.push("/admin/movies");
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1>Edit Movie</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            value={movie.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <input
            value={movie.slug}
            onChange={(e) => setMovie({ ...movie, slug: e.target.value })}
          />

          <textarea
            value={movie.description}
            onChange={(e) =>
              setMovie({ ...movie, description: e.target.value })
            }
            rows={4}
          />

          <input
            value={movie.thumbnail}
            onChange={(e) =>
              setMovie({ ...movie, thumbnail: e.target.value })
            }
          />

          {movie.thumbnail && (
            <img src={movie.thumbnail} className={styles.img} />
          )}

          <input
            value={movie.trailerUrl}
            onChange={(e) =>
              setMovie({ ...movie, trailerUrl: e.target.value })
            }
          />

          <input
            value={movie.downloadUrl}
            onChange={(e) =>
              setMovie({ ...movie, downloadUrl: e.target.value })
            }
          />

          <input
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
            <option value="hollywood">Hollywood</option>
            <option value="bollywood">Bollywood</option>
            <option value="hindi-dubbed">Hindi Dubbed</option>
          </select>

          <select
            value={movie.type}
            onChange={(e) => setMovie({ ...movie, type: e.target.value })}
          >
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>

          <select
            value={movie.category}
            onChange={(e) =>
              setMovie({ ...movie, category: e.target.value })
            }
          >
            <option value="movie">Movie</option>
            <option value="webseries">Webseries</option>
          </select>

          <button className={styles.addBtn}>Update</button>
        </form>
      </div>
    </div>
  );
}
