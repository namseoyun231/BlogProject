import { useParams } from "react-router-dom";
import { useAxios } from "../../hooks/useAxios";
import type { Post } from "../../types/Post";
import RecommendationItem from "./RecommendationItem";

export default function RecommendationArea() {
    const params = useParams();
    const { data, isLoading, error } = useAxios<Post[]>(
        `/posts/${params.id}/related`,
        []
    );

    if (isLoading) return null;
    if (error) return null;
    if (!data || data.length === 0) return null;

    return (
        <article className="page__recommend">
            <h3 className="page__recommend-title">추천 글</h3>
            <ul className="page__recommend-lists">
                {data.map((post) => (
                    <RecommendationItem key={post.id} {...post} />
                ))}
            </ul>
        </article>
    );
}
