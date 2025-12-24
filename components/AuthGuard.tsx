"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const publicRoutes = ["/login"];

    if (!token && !publicRoutes.includes(pathname)) {
      window.location.href = "/login";
    }
  }, [pathname]);

  return <>{children}</>;
}
