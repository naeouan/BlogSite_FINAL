import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import { API_URL } from "../config.js";

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/post/${id}`)
      .then((response) => response.json())
      .then((postInfo) => {
        setTitle(postInfo.title);
        setContent(postInfo.content);
        setSummary(postInfo.summary);
      });
  }, [id]);

  async function updatePost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("id", id);
    if (files?.[0]) {
      data.set("file", files[0]);
    }

    const response = await fetch(`${API_URL}/post`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    } else {
      console.log("Error:", await response.json());
    }
  }

  if (redirect) {
    return <Navigate to={"/post/" + id} />;
  }

  return (
    <div className="form-page" style={{ alignItems: "flex-start", paddingTop: "40px" }}>
      <div className="form-card form-card-wide">
        <div className="form-header">
          <span className="form-eyebrow">Make it better</span>
          <h1>Edit Post</h1>
        </div>

        <form onSubmit={updatePost}>
          <div className="input-group">
            <label className="input-label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="edit-summary">
              Summary
            </label>
            <input
              id="edit-summary"
              type="text"
              placeholder="Short description"
              value={summary}
              onChange={(ev) => setSummary(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Replace Cover Image (optional)</label>
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
                    <span>Click to upload</span> a new cover image
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
            Save Changes →
          </button>
        </form>
      </div>
    </div>
  );
}
