import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./state/useAuth";
import useRefresh from "./hooks/useRefresh";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Video from "./pages/Video";
import { useShallow } from "zustand/react/shallow";
import ProtectedRoute from "./ProtectedRoute";
import Videos from "./pages/Videos";

export default function App() {
  const auth = useAuth(useShallow((state) => state.auth));
  useRefresh();

  return (
    <Routes>
      <Route
        path="/video/:id"
        // element={auth.isAuth ? <Video /> : <Navigate to="/auth/login" />}
        element={
          <ProtectedRoute>
            <Video />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/"
        // element={auth.isAuth ? <Home /> : <Navigate to="/auth/login" />}
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={!auth.isAuth ? <Auth /> : <Navigate to="/" />}
      />
      <Route
        path="/auth/login"
        element={
          !auth.isAuth ? <Login /> : <Navigate to="/" />
          // <UnProtectedRoute>
          //   <Login />
          // </UnProtectedRoute>
        }
      />
      <Route
        path="/auth/register"
        element={!auth.isAuth ? <Register /> : <Navigate to="/" />}
      />
    </Routes>
  );
}
