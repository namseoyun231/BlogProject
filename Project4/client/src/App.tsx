import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Read from "./pages/Read";
import Write from "./pages/Write";
import Auth from "./pages/Auth";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RootLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/read/:id" element={<Read />} />
                    <Route path="/write" element={<Write />} />
                    <Route path="/auth" element={<Auth />} />
                    {/* 혹시 이상한 경로로 오면 홈으로 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
