import PostItem from "./PostItem";
import type { Post } from "../../types/Post";

type Props = {
    posts: Post[];
};

export default function PostArea({ posts }: Props) {
    return (
        <section className="posts-area">
            {posts.map((p) => (
                <PostItem key={p.id} post={p} />
            ))}
        </section>
    );
}
