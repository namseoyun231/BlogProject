import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

export default function Write() {
    const navigate = useNavigate();

    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    if (!accessToken || !user) return <Navigate to="/auth" replace />;

    // form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [writer, setWriter] = useState(user.username ?? "");
    const [desc, setDesc] = useState("");

    // thumbnail
    const [thumbnailBase64, setThumbnailBase64] = useState<string>("");
    const [thumbnailName, setThumbnailName] = useState<string>("");

    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => {
        return (
            title.trim().length > 0 &&
            category.trim().length > 0 &&
            writer.trim().length > 0 &&
            desc.trim().length > 0 &&
            thumbnailBase64.trim().length > 0 &&
            !isSubmitting
        );
    }, [title, category, writer, desc, thumbnailBase64, isSubmitting]);

    const onChangeFile = (file: File | null) => {
        if (!file) {
            setThumbnailBase64("");
            setThumbnailName("");
            return;
        }

        setThumbnailName(file.name);

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") setThumbnailBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!canSubmit) {
            setMessage("모든 항목을 입력해 주세요.");
            return;
        }

        try {
            setIsSubmitting(true);

            let tokenToUse = accessToken;

            try {
                const tokenRes = await axiosInstance.post("/token", null, { withCredentials: true });
                const newAccessToken = tokenRes.data?.accessToken;
                if (newAccessToken) {
                    tokenToUse = newAccessToken;
                    useAuthStore.getState().setAuth({ accessToken: newAccessToken, user });
                }
            } catch {
            }

            const res = await axiosInstance.post(
                "/posts",
                {
                    title,
                    category,
                    username: writer,
                    thumbnail: thumbnailBase64,
                    desc,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenToUse}`,
                    },
                    withCredentials: true,
                }
            );

            const newPostId = res.data?.id;
            if (newPostId) navigate(`/read/${newPostId}`);
            else navigate("/");
        } catch (err: any) {
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === "string" ? err.response.data : null) ||
                "글등록 실패(서버/토큰 확인)";

            if (status === 401 || status === 403) {
                setMessage("로그인이 만료됐어요. 다시 로그인해 주세요.");
                useAuthStore.getState().clearAuth();
                navigate("/auth", { replace: true });
                return;
            }

            setMessage(String(msg));
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <main className="page__main">
            <div className="page__write">
                <h2 className="page__write-text">새로운 글 작성</h2>

                <form action="#" onSubmit={handleSubmit}>
                    <div className="page__write-form">
                        <div className="page__write-group">
                            <label htmlFor="title" className="page__write-label">
                                제목
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                className="page__write-input"
                                placeholder="Type product name"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="page__write-label">
                                카테고리
                            </label>
                            <select
                                id="category"
                                className="page__write-select"
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select category</option>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Life">Life</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="writer" className="page__write-label">
                                작성자
                            </label>
                            <input
                                type="text"
                                name="writer"
                                id="writer"
                                className="page__write-input"
                                placeholder="Type product name"
                                required
                                value={writer}
                                onChange={(e) => setWriter(e.target.value)}
                            />
                        </div>

                        <div className="page__write-group">
                            <div>
                                <label htmlFor="user_avatar" className="page__write-label">
                                    썸네일
                                </label>
                                <label className="page__write-file--hidden" htmlFor="user_avatar">
                                    Upload file
                                </label>
                                <input
                                    className="page__write-file"
                                    aria-describedby="user_avatar_help"
                                    id="user_avatar"
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
                                />
                                {thumbnailName && (
                                    <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                                        선택된 파일: {thumbnailName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="page__write-group">
                            <label htmlFor="description" className="page__write-label">
                                내용
                            </label>
                            <textarea
                                id="description"
                                className="page__write-textarea"
                                placeholder="Your description here"
                                required
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="page--btn" disabled={!canSubmit}>
                        {isSubmitting ? "등록 중..." : "글등록"}
                    </button>
                </form>
                <div style={{ marginTop: 16, fontSize: 12, opacity: 0.85 }}>
                    <strong>입력값 확인(실시간)</strong>
                    <div>title: {title}</div>
                    <div>category: {category}</div>
                    <div>writer: {writer}</div>
                    <div>thumbnail: {thumbnailName || "(없음)"}</div>
                    <div>desc: {desc}</div>
                </div>

                {message && (
                    <p style={{ marginTop: 12, textAlign: "center" }}>{message}</p>
                )}
            </div>
        </main>
    );
}
