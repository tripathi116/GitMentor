import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Report from "./pages/Report.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
    return (
        <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/"
                element={<Home />}
            />

            <Route element={<ProtectedRoute />}>

                <Route
                    path="/report/:id"
                    element={<Report />}
                />

            </Route>

        </Routes>
    );
};

export default App;