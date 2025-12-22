import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

/**
 * ✅ 훅 에러(Rendered fewer hooks...) 방지:
 * - 절대 컴포넌트 상단에서 if (...) return ... 하지 말 것
 * - 로그인 체크는 useEffect에서 navigate로 처리
 *
 * ✅ 글등록 실패(토큰) 방지:
 * - /posts 요청 전에 /token으로 accessToken 재발급 시도
 * - 성공하면 store에 토큰 갱신 후 글등록
 */

export default function Write() {
    const navigate = useNavigate();

    // auth
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const setAuth = useAuthStore((s) => s.setAuth);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    // form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [writer, setWriter] = useState("");
    const [desc, setDesc] = useState("");
    const [thumbnailBase64, setThumbnailBase64] = useState<string>("");

    // ui state
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ 로그인 안 됐으면 /auth로 보내기 (조기 return 금지)
    useEffect(() => {
        if (!user || !accessToken) {
            navigate("/auth", { replace: true });
        }
    }, [user, accessToken, navigate]);

    // ✅ writer 기본값: 로그인 유저 닉네임으로 자동 채우기(원하면 삭제 가능)
    useEffect(() => {
        if (user?.username && !writer) setWriter(user.username);
    }, [user, writer]);

    const canSubmit = useMemo(() => {
        return (
            !!user &&
            !!accessToken &&
            title.trim().length > 0 &&
            category.trim().length > 0 &&
            writer.trim().length > 0 &&
            desc.trim().length > 0 &&
            !!thumbnailBase64
        );
    }, [user, accessToken, title, category, writer, desc, thumbnailBase64]);

    const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setThumbnailBase64(String(reader.result));
        reader.readAsDataURL(file);
    };

    const refreshAccessTokenIfNeeded = async (): Promise<string | null> => {
        // accessToken이 있으면 그대로 사용
        if (accessToken) return accessToken;

        // accessToken이 없으면 refreshToken 쿠키로 재발급 시도
        try {
            const res = await axiosInstance.post("/token", null, { withCredentials: true });
            const newAccessToken = res.data?.accessToken;
            const newUser = res.data?.user ?? user;

            if (newAccessToken && newUser) {
                // ✅ 너 store의 setAuth가 (user, accessToken) 형태라면 이게 정답
                // 만약 setAuth가 payload 객체 형태면 setAuth({ user: newUser, accessToken: newAccessToken })로 바꿔
                setAuth(newUser, newAccessToken);
                return newAccessToken;
            }
            return null;
        } catch {
            return null;
        }
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

            // ✅ 토큰 재발급 한 번 시도 (갑자기 만료되는 문제 방지)
            const tokenToUse = (await refreshAccessTokenIfNeeded()) ?? accessToken;

            if (!tokenToUse) {
                setMessage("로그인이 만료됐어요. 다시 로그인해 주세요.");
                clearAuth();
                navigate("/auth", { replace: true });
                return;
            }

            // ✅ 글 등록 (백엔드가 Authorization 필요)
            const res = await axiosInstance.post(
                "/posts",
                {
                    title,
                    category,
                    username: writer, // 백엔드에서 username 필드를 쓰는 경우가 많음
                    thumbnail: thumbnailBase64, // base64(dataURL)
                    desc,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenToUse}`,
                    },
                    withCredentials: true,
                }
            );

            const newId = res.data?.id;
            if (newId) navigate(`/read/${newId}`);
            else navigate("/");
        } catch (err: any) {
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === "string" ? err.response.data : null) ||
                "글등록 실패(서버/토큰 확인)";

            // 401/403이면 로그인 만료로 처리
            if (status === 401 || status === 403) {
                clearAuth();
                navigate("/auth", { replace: true });
                return;
            }

            setMessage(`${String(msg)}${status ? ` (HTTP ${status})` : ""}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page__main">
            <div className="page__write">
                <h2 className="page__write-text">새로운 글 작성</h2>

                <form onSubmit={handleSubmit}>
                    <div className="page__write-form">
                        <div className="page__write-group">
                            <label htmlFor="title" className="page__write-label">
                                제목
                            </label>
                            <input
                                id="title"
                                className="page__write-input"
                                placeholder="Type product name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="page__write-label">
                                카테고리
                            </label>
                            <select
                                id="category"
                                className="page__write-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
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
                                id="writer"
                                className="page__write-input"
                                placeholder="Type writer name"
                                value={writer}
                                onChange={(e) => setWriter(e.target.value)}
                                required
                            />
                        </div>

                        <div className="page__write-group">
                            <label htmlFor="thumb" className="page__write-label">
                                썸네일
                            </label>
                            <input
                                id="thumb"
                                className="page__write-file"
                                type="file"
                                accept="image/*"
                                onChange={onChangeFile}
                                required
                            />
                        </div>

                        <div className="page__write-group">
                            <label htmlFor="desc" className="page__write-label">
                                내용
                            </label>
                            <textarea
                                id="desc"
                                className="page__write-textarea"
                                placeholder="Your description here"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="page--btn" disabled={isSubmitting}>
                        {isSubmitting ? "등록 중..." : "글등록"}
                    </button>

                    {message && <p style={{ marginTop: 12 }}>{message}</p>}
                </form>
            </div>
        </main>
    );
}
