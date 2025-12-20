import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

type Mode = "login" | "signup";

export default function Auth() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [mode, setMode] = useState<Mode>("login");

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); // 회원가입용
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState(""); // 회원가입 비밀번호 확인

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isSignup = mode === "signup";

    const canSubmit = useMemo(() => {
        if (!email.trim() || !password.trim()) return false;
        if (isSignup) {
            if (!username.trim()) return false;
            if (!password2.trim()) return false;
            if (password !== password2) return false;
        }
        return !isLoading;
    }, [email, password, password2, username, isSignup, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!canSubmit) {
            setMessage("입력값을 확인해 주세요.");
            return;
        }

        try {
            setIsLoading(true);

            // 1) 회원가입이면 먼저 /register
            if (isSignup) {
                await axiosInstance.post("/register", { email, username, password });
            }

            // 2) 로그인 /login
            const res = await axiosInstance.post("/login", { email, password });

            // 서버가 { user, accessToken } 반환
            const { user, accessToken } = res.data;
            setAuth({ user, accessToken });

            navigate("/");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === "string" ? err.response.data : null) ||
                "요청 실패";
            setMessage(String(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page__main">
            <article className="page-auth">
                <section className="page-auth__container">
                    <nav className="page-auth__toggle">
                        <button
                            type="button"
                            className={
                                "page-auth__toggle-button " +
                                (mode === "login" ? "page-auth__toggle-button--active" : "")
                            }
                            onClick={() => setMode("login")}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            className={
                                "page-auth__toggle-button " +
                                (mode === "signup" ? "page-auth__toggle-button--active" : "")
                            }
                            onClick={() => setMode("signup")}
                        >
                            회원가입
                        </button>
                    </nav>

                    <div className="page-auth__form-section">
                        <form className="auth-form auth-form--active" onSubmit={handleSubmit}>
                            {/* 이메일 */}
                            <label htmlFor="auth-email" className="a11y-hidden">
                                이메일
                            </label>
                            <input
                                id="auth-email"
                                type="email"
                                className="auth-form__input"
                                placeholder="이메일"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                            />

                            {/* 회원가입일 때만 이름 */}
                            {isSignup && (
                                <>
                                    <label htmlFor="auth-username" className="a11y-hidden">
                                        이름
                                    </label>
                                    <input
                                        id="auth-username"
                                        type="text"
                                        className="auth-form__input"
                                        placeholder="이름"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="off"
                                    />
                                </>
                            )}

                            {/* 비밀번호 */}
                            <label htmlFor="auth-password" className="a11y-hidden">
                                비밀번호
                            </label>
                            <input
                                id="auth-password"
                                type="password"
                                className="auth-form__input"
                                placeholder="비밀번호"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* 회원가입일 때만 비밀번호 확인 */}
                            {isSignup && (
                                <>
                                    <label htmlFor="auth-password2" className="a11y-hidden">
                                        비밀번호 확인
                                    </label>
                                    <input
                                        id="auth-password2"
                                        type="password"
                                        className="auth-form__input"
                                        placeholder="비밀번호 확인"
                                        required
                                        value={password2}
                                        onChange={(e) => setPassword2(e.target.value)}
                                    />
                                </>
                            )}

                            <button type="submit" className="auth-form__submit" disabled={!canSubmit}>
                                {isLoading ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
                            </button>
                        </form>
                    </div>

                    {message && (
                        <p style={{ marginTop: 12, textAlign: "center" }}>{message}</p>
                    )}
                </section>
            </article>
        </main>
    );
}
