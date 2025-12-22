const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const app = express();

// =====================
// 0) 기본 미들웨어
// =====================
app.use(express.json());
app.use(cookieParser());

// CORS (프론트: Vite 기본 5173)
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.options("*", cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// =====================
// 1) JSON 파일 영구 저장 설정
// =====================
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

async function ensureDataFiles() {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) await fsp.writeFile(USERS_FILE, "[]", "utf-8");
    if (!fs.existsSync(POSTS_FILE)) await fsp.writeFile(POSTS_FILE, "[]", "utf-8");
}

async function loadJson(filePath, fallback) {
    try {
        const txt = await fsp.readFile(filePath, "utf-8");
        return JSON.parse(txt);
    } catch {
        return fallback;
    }
}

async function saveJson(filePath, data) {
    await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// =====================
// 2) "Mock DB" (메모리) -> 서버 시작 시 파일에서 로드
// =====================
let users = []; // { email, username, password }
let blogPosts = []; // posts 배열 (id, title, category, author, username, thumbnail, desc, regdate)
let refreshTokens = []; // refresh token은 굳이 파일 저장 안 함 (과제용)

// =====================
// 3) JWT 설정 (과제용 기본값)
// =====================
const ACCESS_TOKEN_SECRET = "access_secret_key";
const REFRESH_TOKEN_SECRET = "refresh_secret_key";

// access token 생성
function generateAccessToken(userEmail) {
    return jwt.sign({ email: userEmail }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

// refresh token 생성
function generateRefreshToken(userEmail) {
    return jwt.sign({ email: userEmail }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// access token 검증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "토큰이 없습니다." });

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.status(403).json({ message: "토큰이 유효하지 않습니다." });
        req.userEmail = payload.email;
        next();
    });
}

// =====================
// 4) 라우터
// =====================
const router = express.Router();

/**
 * 회원가입
 * POST /register
 * body: { email, username, password }
 */
router.post("/register", async (req, res) => {
    const { email, username, password } = req.body || {};

    if (!email || !username || !password) {
        return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
    }

    const exists = users.find((u) => u.email === email);
    if (exists) {
        return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const newUser = { email, username, password };
    users.push(newUser);

    // ✅ 파일 저장
    await saveJson(USERS_FILE, users);

    return res.status(201).json({ message: "회원가입 성공" });
});

/**
 * 로그인
 * POST /login
 * body: { email, password }
 * response: { user, accessToken }
 * + refreshToken은 쿠키로 저장
 */
router.post("/login", (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ message: "이메일/비밀번호를 입력하세요." });
    }

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const accessToken = generateAccessToken(user.email);
    const refreshToken = generateRefreshToken(user.email);
    refreshTokens.push(refreshToken);

    // refresh 토큰은 httpOnly 쿠키로 저장
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // 배포(https)에서는 true 권장
        sameSite: "lax",
    });

    return res.json({
        user: { email: user.email, username: user.username },
        accessToken,
    });
});

/**
 * 로그아웃
 * POST /logout
 * 쿠키의 refreshToken 제거
 */
router.post("/logout", (req, res) => {
    const token = req.cookies.refreshToken;
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.clearCookie("refreshToken");
    return res.json({ message: "로그아웃 성공" });
});

/**
 * 토큰 재발급
 * POST /token
 */
router.post("/token", (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "refreshToken 없음" });
    if (!refreshTokens.includes(refreshToken))
        return res.status(403).json({ message: "refreshToken 유효하지 않음" });

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) return res.status(403).json({ message: "refreshToken 검증 실패" });
        const newAccessToken = generateAccessToken(payload.email);
        return res.json({ accessToken: newAccessToken });
    });
});

/**
 * 글 목록
 * GET /posts
 */
router.get("/posts", (req, res) => {
    // 최신순으로 주고 싶으면 정렬해서 반환
    const sorted = [...blogPosts].sort((a, b) => Number(b.id) - Number(a.id));
    res.json(sorted);
});

/**
 * 검색
 * GET /posts/search?q=...
 */
router.get("/posts/search", (req, res) => {
    const q = (req.query.q || "").toString().trim().toLowerCase();
    if (!q) return res.json([]);

    const filtered = blogPosts.filter((p) => {
        return (
            (p.title || "").toLowerCase().includes(q) ||
            (p.desc || "").toLowerCase().includes(q) ||
            (p.username || "").toLowerCase().includes(q)
        );
    });

    res.json(filtered);
});

/**
 * 글 상세
 * GET /posts/:id
 */
router.get("/posts/:id", (req, res) => {
    const id = Number(req.params.id);
    const post = blogPosts.find((p) => Number(p.id) === id);
    if (!post) return res.status(404).json({ message: "게시글이 없습니다." });
    res.json(post);
});

/**
 * 추천 글
 * GET /posts/:id/related
 * 같은 category에서 3개 정도 추천(자기 글 제외)
 */
router.get("/posts/:id/related", (req, res) => {
    const id = Number(req.params.id);
    const current = blogPosts.find((p) => Number(p.id) === id);
    if (!current) return res.json([]);

    const related = blogPosts
        .filter((p) => p.category === current.category && Number(p.id) !== id)
        .slice(0, 3);

    res.json(related);
});

/**
 * 글 작성
 * POST /posts
 * headers: Authorization: Bearer <accessToken>
 * body: { title, category, username, thumbnail, desc }
 */
router.post("/posts", authenticateToken, async (req, res) => {
    const { title, category, username, thumbnail, desc } = req.body || {};

    if (!title || !category || !username || !thumbnail || !desc) {
        return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
    }

    const id = Date.now(); // 간단 ID
    const newPost = {
        id,
        title,
        category,
        author: req.userEmail, // ✅ 토큰에서 가져온 실제 작성자 이메일
        username,              // 화면에 보여줄 작성자 이름
        thumbnail,             // base64(DataURL)
        desc,
        regdate: new Date().toISOString(),
    };

    blogPosts.push(newPost);

    // ✅ 파일 저장
    await saveJson(POSTS_FILE, blogPosts);

    return res.status(201).json(newPost);
});

/**
 * 글 삭제 (작성자만)
 * DELETE /posts/:id
 */
router.delete("/posts/:id", authenticateToken, async (req, res) => {
    const id = Number(req.params.id);
    const idx = blogPosts.findIndex((p) => Number(p.id) === id);
    if (idx === -1) return res.status(404).json({ message: "게시글이 없습니다." });

    const post = blogPosts[idx];
    if (post.author !== req.userEmail) {
        return res.status(403).json({ message: "작성자만 삭제할 수 있습니다." });
    }

    blogPosts.splice(idx, 1);

    // ✅ 파일 저장
    await saveJson(POSTS_FILE, blogPosts);

    return res.status(204).send();
});

app.use("/", router);

// =====================
// 5) 서버 시작 (파일에서 로드)
// =====================
async function startServer() {
    await ensureDataFiles();
    users = await loadJson(USERS_FILE, []);
    blogPosts = await loadJson(POSTS_FILE, []);

    app.listen(3000, () =>
        console.log("Server running on http://localhost:3000")
    );
}

startServer();
