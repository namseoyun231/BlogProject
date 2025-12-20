import { useSearchParams } from "react-router-dom";
import { useAxios } from "../../hooks/useAxios";
import type { Post } from "../../types/Post";
import PostItem from "./PostItem";

export default function PostArea() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q");

    const url = q ? "/posts/search?title=" + q : "/posts";
    const { data: posts, isLoading, error } = useAxios<Post[]>(url, []);

    if (isLoading) return <section className="posts-area">Loading...</section>;
    if (error) return <section className="posts-area">Error</section>;

    return (
        <section className="posts-area">
            {posts.map((post) => (
                <PostItem key={post.id} post={post} />
            ))}
        </section>
    );
}
