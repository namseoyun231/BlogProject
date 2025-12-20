import { useMemo, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

export default function Auth() {
    const [mode, setMode] = useState<Mode>("login");
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    // 로그인 입력
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // 회원가입 입력
    const [signupEmail, setSignupEmail] = useState("");
    const [signupName, setSignupName] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm] = useState("");

    const [message, setMessage] = useState<string>("");

    const isSignupPasswordMismatch = useMemo(() => {
        if (mode !== "signup") return false;
        if (!signupPassword || !signupConfirm) return false;
        return signupPassword !== signupConfirm;
    }, [mode, signupPassword, signupConfirm]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await axiosInstance.post("/login", {
                email: loginEmail,
                password: loginPassword,
            });

            const { accessToken, user } = res.data;

            if (!accessToken || !user) {
                setMessage("로그인 응답 형식이 예상과 달라요. 콘솔의 res.data를 보여주세요.");
                console.log("login res.data =", res.data);
                return;
            }

            setAuth({
                accessToken,
                user: {
                    email: user.email,
                    username: user.username,
                },
            });

            navigate("/");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                "로그인 실패: 입력을 확인하세요.";
            setMessage(String(msg));
        }
    };


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (signupPassword !== signupConfirm) {
            setMessage("비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        try {
            await axiosInstance.post("/register", {
                email: signupEmail,
                username: signupName,
                password: signupPassword,
            });

            setMessage("회원가입 성공! 이제 로그인 해주세요.");
            setMode("login");
            setLoginEmail(signupEmail);
            setLoginPassword("");
            setSignupPassword("");
            setSignupConfirm("");
        } catch (err: any) {
            setMessage("요청 실패. (서버 주소/라우트를 확인하세요)");
            console.log(err?.response?.data);
        }
    };

    return (
        <main className="page__main">
            <article className="page-auth">
                <section className="page-auth__container">
                    {/* 탭 */}
                    <nav className="page-auth__toggle">
                        <button
                            type="button"
                            id="login-tab"
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
                            id="signup-tab"
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
                        {/* 로그인 폼 */}
                        <form
                            className={"auth-form " + (mode === "login" ? "auth-form--active" : "")}
                            id="login-form"
                            onSubmit={handleLogin}
                        >
                            <label htmlFor="login-email" className="a11y-hidden">
                                이메일
                            </label>
                            <input
                                type="email"
                                id="login-email"
                                className="auth-form__input"
                                placeholder="이메일"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />

                            <label htmlFor="login-password" className="a11y-hidden">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                className="auth-form__input"
                                placeholder="비밀번호"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />

                            <button type="submit" className="auth-form__submit">
                                로그인
                            </button>
                        </form>

                        {

                        }
                        <form
                            className={"auth-form " + (mode === "signup" ? "auth-form--active" : "")}
                            id="signup-form"
                            onSubmit={handleSignup}
                        >
                            <label htmlFor="signup-email" className="a11y-hidden">
                                이메일
                            </label>
                            <input
                                type="email"
                                id="signup-email"
                                className="auth-form__input"
                                placeholder="이메일"
                                required
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                            />

                            <label htmlFor="signup-name" className="a11y-hidden">
                                이름
                            </label>
                            <input
                                type="text"
                                id="signup-name"
                                className="auth-form__input"
                                placeholder="이름"
                                required
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                            />

                            <label htmlFor="signup-password" className="a11y-hidden">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="signup-password"
                                className="auth-form__input"
                                placeholder="비밀번호"
                                required
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                            />

                            <label htmlFor="signup-confirm-password" className="a11y-hidden">
                                비밀번호 확인
                            </label>
                            <input
                                type="password"
                                id="signup-confirm-password"
                                className="auth-form__input"
                                placeholder="비밀번호 확인"
                                required
                                value={signupConfirm}
                                onChange={(e) => setSignupConfirm(e.target.value)}
                            />

                            {

                            }
                            {isSignupPasswordMismatch && (
                                <p style={{ marginTop: 8, fontSize: 13 }}>
                                    비밀번호가 일치하지 않습니다.
                                </p>
                            )}

                            <button type="submit" className="auth-form__submit">
                                회원가입
                            </button>
                        </form>
                    </div>

                    {/* 메시지 */}
                    {message && (
                        <p style={{ marginTop: 12, textAlign: "center" }}>
                            {message}
                        </p>
                    )}

                    {

                    }
                    <div style={{ display: "none" }}>
                    </div>
                </section>
            </article>
        </main>
    );
}
