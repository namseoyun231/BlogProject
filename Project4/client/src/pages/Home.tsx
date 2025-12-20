import { dummyImage1, dummyImage2, search } from "../assets/images/images";

export default function Home() {
    return (
        <main className="page__main">
            {/* Search */}
            <section className="search-area">
                <article className="search-area__search">
                    <h2 className="search-area__title">Blog Project</h2>
                    <p className="search-area__description">
                        A Blog About Food, Experience, and Recipes.
                    </p>

                    {/* 지금은 UI만 먼저. 다음 단계에서 검색 기능(쿼리스트링/디바운스) 붙임 */}
                    <form method="get" className="search-area__form">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search"
                            className="search-area__input"
                            autoComplete="off"
                        />
                        <button type="submit" className="search-area__submit">
                            <img src={search} alt="search-icon" className="search-area__icon" />
                        </button>
                    </form>
                </article>
            </section>

            {/* PostArea (지금은 더미 UI) */}
            <section className="posts-area">
                <article className="posts-area__post">
                    <a href="#" className="posts-area__post-link">
                        <img
                            src={dummyImage1}
                            alt="dummy-image-1"
                            className="posts-area__post-image"
                        />
                        <em className="posts-area__post-tag">Travel</em>
                        <h2 className="posts-area__post-title">
                            My Travel Stories from the Past Year
                        </h2>
                        <p className="posts-area__post-meta">George Costanazv • Aug 16, 2025</p>
                        <p className="posts-area__post-excerpt">
                            Over the past year, I had the opportunity to explore new places and
                            immerse myself in different cultures...
                        </p>
                    </a>
                </article>

                <article className="posts-area__post">
                    <a href="#" className="posts-area__post-link">
                        <img
                            src={dummyImage2}
                            alt="dummy-image-2"
                            className="posts-area__post-image"
                        />
                        <em className="posts-area__post-tag">Food</em>
                        <h2 className="posts-area__post-title">Delicious Chicken Dishes & Tips</h2>
                        <p className="posts-area__post-meta">George Costanazv • Aug 16, 2025</p>
                        <p className="posts-area__post-excerpt">
                            Chicken is one of the most versatile and beloved foods around the world...
                        </p>
                    </a>
                </article>
            </section>
        </main>
    );
}
