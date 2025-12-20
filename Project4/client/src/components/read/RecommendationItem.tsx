import { NavLink } from "react-router-dom";
import type { Post } from "../../types/Post";

export default function RecommendationItem({ id, title, desc, thumbnail }: Post) {
    return (
        <li className="page__recommend-item">
            <NavLink to={`/read/${id}`} className="page__recommend-link">
                {thumbnail && <img src={thumbnail} alt={title} className="page__recommend-image" />}
                <h4 className="page__recommend-item-title">{title}</h4>
                <p className="page__recommend-item-desc">{desc}</p>
            </NavLink>
        </li>
    );
}
