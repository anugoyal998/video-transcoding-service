import React from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import useAuth from "./state/useAuth";
import { useShallow } from "zustand/react/shallow";

export default function UnProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth(useShallow((state) => state.auth));
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirect_to = searchParams.get("redirect_to");

  if (auth.isAuth) {
    // Save the intended path in the state
    return Navigate({
      to: `/?redirect_to=${redirect_to ? redirect_to : location.pathname}`,
    });
  }

  return children;
}
