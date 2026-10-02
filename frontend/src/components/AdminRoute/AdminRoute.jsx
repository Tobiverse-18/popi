import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../api/api";

export default function AdminRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
        if (mounted) {
          setStatus("unauthenticated");
        }

        return;
      }

      try {
        const response = await api.get(
          "/users/me/"
        );

        if (!mounted) {
          return;
        }

        if (response.data?.is_staff === true) {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      } catch (error) {
        console.error(
          "Admin authentication error:",
          error
        );

        if (!mounted) {
          return;
        }

        setStatus("unauthenticated");
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  if (status === "denied") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}