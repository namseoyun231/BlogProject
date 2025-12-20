import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { axiosInstance } from "../../api/axiosInstance";
import { useAxios } from "../../hooks/useAxios";
import { useAuthStore } from "../../store/authStore";
import type { Post } from "../../types/Post";

export default function ReadArea() {
    const params = useParams();
    const navigate = useNavigate();
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    const {
        data: post,
        isLoading,
        error,
    } = useAxios<Post>(`/posts/${params.id}`, {} as Post);

    const handleDelete = async () => {
        try {
            const { status } = await axiosInstance.delete(`/posts/${params.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (status === 204) {
                alert("삭제되었습니다.");
                navigate("/");
            } else {
                throw new Error("삭제 실패");
            }
        } catch (e: any) {
            alert(e?.response?.data?.message ?? "삭제 실패");
        }
    };

    if (isLoading) return <p style={{ textAlign: "center" }}>Loading...</p>;
    if (error) return <p style={{ textAlign: "center" }}>Error</p>;
    if (!post?.id) return <p style={{ textAlign: "center" }}>게시글 없음</p>;

    return (
        <article className="page__read">
            <em className="page__read-tag">{post.category}</em>
            <h2 className="page__read-title">{post.title}</h2>

            <p className="page__read-profile">
                {post.username} • {post.regdate ? format(new Date(post.regdate), "MMM dd, yyyy") : ""}
            </p>

            {post.thumbnail && (
                <img className="page__read-image" src={post.thumbnail} alt={post.title} />
            )}

            <p className="page__read-desc">{post.desc}</p>

            {/* 작성자만 삭제 버튼 */}
            {user?.email === post.author && (
                <button className="page__read-btn" onClick={handleDelete}>
                    삭제
                </button>
            )}
        </article>
    );
}
