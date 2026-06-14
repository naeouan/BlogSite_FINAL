
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import { API_URL } from "../config.js";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [fileName, setFileName] = useState("");

  async function createNewPost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files[0]);
    const response = await fetch(`${API_URL}/post`, {
      method: "POST",
      body: data,
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="form-page" style={{ alignItems: "flex-start", paddingTop: "40px" }}>
      <div className="form-card form-card-wide">
        <div className="form-header">
          <span className="form-eyebrow">Share your thoughts</span>
          <h1>New Post</h1>
        </div>

        <form onSubmit={createNewPost}>
          <div className="input-group">
            <label className="input-label" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              placeholder="Give your post a compelling title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="post-summary">
              Summary
            </label>
            <input
              id="post-summary"
              type="text"
              placeholder="A short description of what this post is about"
              value={summary}
              onChange={(ev) => setSummary(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Cover Image</label>
            <div className="file-upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(ev) => {
                  setFiles(ev.target.files);
                  setFileName(ev.target.files[0]?.name || "");
                }}
              />
              <div className="file-upload-icon">🖼️</div>
              <p className="file-upload-text">
                {fileName ? (
                  <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>
                    {fileName}
                  </span>
                ) : (
                  <>
                    <span>Click to upload</span> or drag &amp; drop a cover image
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Content</label>
            <Editor value={content} onChange={setContent} />
          </div>

          <button type="submit" className="btn-primary">
            Publish Post →
          </button>
        </form>
      </div>
    </div>
  );
}