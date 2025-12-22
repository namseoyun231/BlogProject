import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

type Tab = "login" | "signup";

export default function Auth() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [tab, setTab] = useState<Tab>("login");
    const isLogin = useMemo(() => tab === "login", [tab]);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [signupEmail, setSignupEmail] = useState("");
    const [signupName, setSignupName] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");

    const [message, setMessage] = useState<string>("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const { data } = await axiosInstance.post("/login", {
                email: loginEmail,
                password: loginPassword,
            });

            setAuth(data.user, data.accessToken);
            navigate("/");
        } catch (err: any) {
            setMessage(err?.response?.data?.message ?? "로그인 실패");
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (signupPassword !== signupConfirm) {
            setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await axiosInstance.post("/register", {
                email: signupEmail,
                username: signupName,
                password: signupPassword,
            });

            setTab("login");
            setMessage("회원가입 완료! 로그인 해주세요.");
        } catch (err: any) {
            setMessage(err?.response?.data?.message ?? "회원가입 실패");
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
                                (isLogin ? "page-auth__toggle-button--active" : "")
                            }
                            onClick={() => setTab("login")}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            className={
                                "page-auth__toggle-button " +
                                (!isLogin ? "page-auth__toggle-button--active" : "")
                            }
                            onClick={() => setTab("signup")}
                        >
                            회원가입
                        </button>
                    </nav>

                    <div className="page-auth__form-section">
                        {isLogin ? (
                            <form className="auth-form auth-form--active" onSubmit={handleLogin}>
                                <label className="a11y-hidden">이메일</label>
                                <input
                                    type="email"
                                    className="auth-form__input"
                                    placeholder="이메일"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />

                                <label className="a11y-hidden">비밀번호</label>
                                <input
                                    type="password"
                                    className="auth-form__input"
                                    placeholder="비밀번호"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />

                                <button type="submit" className="auth-form__submit">
                                    로그인
                                </button>
                            </form>
                        ) : (
                            <form className="auth-form auth-form--active" onSubmit={handleSignup}>
                                <label className="a11y-hidden">이메일</label>
                                <input
                                    type="email"
                                    className="auth-form__input"
                                    placeholder="이메일"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />

                                <label className="a11y-hidden">이름</label>
                                <input
                                    type="text"
                                    className="auth-form__input"
                                    placeholder="이름"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    required
                                />

                                <label className="a11y-hidden">비밀번호</label>
                                <input
                                    type="password"
                                    className="auth-form__input"
                                    placeholder="비밀번호"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    required
                                />

                                <label className="a11y-hidden">비밀번호 확인</label>
                                <input
                                    type="password"
                                    className="auth-form__input"
                                    placeholder="비밀번호 확인"
                                    value={signupConfirm}
                                    onChange={(e) => setSignupConfirm(e.target.value)}
                                    required
                                />

                                <button type="submit" className="auth-form__submit">
                                    회원가입
                                </button>
                            </form>
                        )}
                    </div>

                    {message ? <p style={{ marginTop: 12, textAlign: "center" }}>{message}</p> : null}
                </section>
            </article>
        </main>
    );
}
