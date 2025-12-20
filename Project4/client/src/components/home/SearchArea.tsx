import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "../../assets/images/images";

export default function SearchArea() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const debounceTimer = useRef<number | null>(null);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = window.setTimeout(() => {
            navigate(query ? "?q=" + query : "/");
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query, navigate]);

    return (
        <section className="search-area">
            <article className="search-area__search">
                <h2 className="search-area__title">Blog Project</h2>
                <p className="search-area__description">
                    A Blog About Food, Experience, and Recipes.
                </p>

                {/* form은 남겨도 되지만, submit은 막아두는 게 편함 */}
                <form
                    method="get"
                    className="search-area__form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="text"
                        name="q"
                        placeholder="Search"
                        className="search-area__input"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="search-area__submit">
                        <img src={search} alt="search-icon" className="search-area__icon" />
                    </button>
                </form>
            </article>
        </section>
    );
}
