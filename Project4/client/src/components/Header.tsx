import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

export default function Header() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const handleLogout = async () => {
        try {
            const { status } = await axiosInstance.post("/logout"); // api.js에 있음 :contentReference[oaicite:3]{index=3}
            if (status === 200 || status === 204) {
                clearAuth();
                navigate("/");
            } else {
                alert("로그아웃 실패");
            }
        } catch {
            clearAuth();
            navigate("/");
        }
    };

    return (
        <header className="page__header">
            <h1 className="page__logo">
                <Link to="/" className="page__logo-link">
                    JBNU
                </Link>
            </h1>

            <nav className="page__navigation">
                <ul className="page__nav-list">
                    <li className="page__nav-item">
                        <Link to="/write" className="page__nav-link">
                            글쓰기
                        </Link>
                    </li>

                    <li className="page__nav-item">
                        {user ? (
                            <button type="button" className="page__nav-link" onClick={handleLogout}>
                                로그아웃
                            </button>
                        ) : (
                            <Link to="/auth" className="page__nav-link">
                                인증
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}
