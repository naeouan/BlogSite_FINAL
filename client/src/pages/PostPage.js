import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { API_URL } from "../config.js";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/post/${id}`)
      .then((response) => response.json())
      .then((postInfo) => setPostInfo(postInfo));
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/post/${postInfo._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete the post.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  if (!postInfo) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading post…</span>
      </div>
    );
  }

  const initial = postInfo.author?.username?.charAt(0).toUpperCase() || "?";
  const isAuthor = userInfo?.id === postInfo.author._id;

  return (
    <div className="post-page">
      {/* Back navigation */}
      <Link to="/" className="post-page-back">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to posts
      </Link>

      {/* Hero image */}
      <div className="post-page-hero">
        <img src={`${API_URL}/${postInfo.cover}`} alt={postInfo.title} />
        <div className="post-page-hero-overlay" />
      </div>

      {/* Post meta */}
      <div className="post-page-meta">
        <h1>{postInfo.title}</h1>

        <div className="post-meta-row">
          <span className="author-chip">
            <span className="author-avatar">{initial}</span>
            @{postInfo.author.username}
          </span>
          <time className="post-meta-time">
            {formatISO9075(new Date(postInfo.createdAt))}
          </time>
        </div>

        {/* Edit / Delete row — only for author */}
        {isAuthor && (
          <div className="edit-row">
            <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit post
            </Link>
            <button onClick={handleDelete} className="delete-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
    </div>
  );
}
