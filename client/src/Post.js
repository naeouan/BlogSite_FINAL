import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";
import { API_URL } from "./config.js";

export default function Post({ _id, title, summary, cover, createdAt, author }) {
  const initial = author?.username?.charAt(0).toUpperCase() || "?";

  return (
    <div className="post">
      {/* Cover image */}
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={`${API_URL}/${cover}`} alt={title} />
        </Link>
      </div>

      {/* Text content */}
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>

        <p className="info">
          <span className="author-badge">
            <span className="author-avatar">{initial}</span>
            {author?.username}
          </span>
          <span className="info-separator" />
          <time className="post-date">{formatISO9075(new Date(createdAt))}</time>
        </p>

        <p className="summary">{summary}</p>

        <Link to={`/post/${_id}`} className="read-more">
          Read article →
        </Link>
      </div>
    </div>
  );
}
