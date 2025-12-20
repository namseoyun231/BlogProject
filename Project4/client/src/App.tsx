import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Write from "./pages/Write";
import Auth from "./pages/Auth";
import Read from "./pages/Read";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "write", element: <Write /> },
            { path: "auth", element: <Auth /> },
            { path: "read/:id", element: <Read /> },
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
