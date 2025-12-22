import { NavLink, useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";

export default function Header() {
    const navigate = useNavigate();

    const accessToken = useAuthStore((s) => s.accessToken);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const isLoggedIn = !!accessToken;

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/logout", null, { withCredentials: true });
        } catch {
        } finally {
            clearAuth();
            navigate("/");
        }
    };

    return (
        <header className="page__header">
            <h1 className="page__logo">
                <NavLink to="/" className="page__logo-link">
                    JBNU
                </NavLink>
            </h1>

            <nav className="page__navigation">
                <ul className="page__nav-list">
                    <li className="page__nav-item">
                        <NavLink to={isLoggedIn ? "/write" : "/auth"} className="page__nav-link">
                            글쓰기
                        </NavLink>
                    </li>

                    <li className="page__nav-item">
                        {isLoggedIn ? (
                            <button type="button" className="page__nav-link" onClick={handleLogout}>
                                로그아웃
                            </button>
                        ) : (
                            <NavLink to="/auth" className="page__nav-link">
                                인증
                            </NavLink>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}
