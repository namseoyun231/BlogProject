import { NavLink } from "react-router-dom";

export default function Header() {
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
                        <NavLink to="/write" className="page__nav-link">
                            글쓰기
                        </NavLink>
                    </li>
                    <li className="page__nav-item">
                        <NavLink to="/auth" className="page__nav-link">
                            인증
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
