import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAxios } from "../hooks/useAxios";
import PostArea from "../components/home/PostArea";
import type { Post } from "../types/Post";
import { search } from "../assets/images/images";

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") ?? "";
    const [keyword, setKeyword] = useState(q);

    useEffect(() => {
        const t = setTimeout(() => {
            const next = keyword.trim();
            setSearchParams(next ? { q: next } : {});
        }, 300);

        return () => clearTimeout(t);
    }, [keyword, setSearchParams]);

    const url = q.trim()
        ? `/posts/search?q=${encodeURIComponent(q.trim())}`
        : "/posts";

    const { data: posts, isLoading, error } = useAxios<Post[]>(url, []);

    return (
        <main className="page__main">
            <section className="search-area">
                <article className="search-area__search">
                    <h2 className="search-area__title">Blog Project</h2>
                    <p className="search-area__description">
                        A Blog About Food, Experience, and Recipes.
                    </p>

                    <form
                        onSubmit={(e) => e.preventDefault()} // 엔터 안 눌러도 되게 막음
                        className="search-area__form"
                    >
                        <input
                            type="text"
                            name="q"
                            placeholder="Search"
                            className="search-area__input"
                            autoComplete="off"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <button type="submit" className="search-area__submit">
                            <img
                                src={search}
                                alt="search-icon"
                                className="search-area__icon"
                            />
                        </button>
                    </form>
                </article>
            </section>

            {isLoading && <p style={{ textAlign: "center" }}>Loading...</p>}
            {!!error && <p style={{ textAlign: "center" }}>{String(error)}</p>}
            {!isLoading && !error && <PostArea posts={posts} />}
        </main>
    );
}
