import { NavLink } from "react-router-dom";
import type { Post } from "../../types/Post";
import { dummyImage1 } from "../../assets/images/images";

export default function PostItem({ post }: { post: Post }) {
    const thumb = post.thumbnail ? post.thumbnail : dummyImage1;

    return (
        <article className="posts-area__post">
            <NavLink to={`/read/${post.id}`} className="posts-area__post-link">
                <img src={thumb} alt="thumbnail" className="posts-area__post-image" />
                <em className="posts-area__post-tag">{post.category}</em>
                <h2 className="posts-area__post-title">{post.title}</h2>
                <p className="posts-area__post-meta">{post.username}</p>
                <p className="posts-area__post-excerpt">{post.desc}</p>
            </NavLink>
        </article>
    );
}
