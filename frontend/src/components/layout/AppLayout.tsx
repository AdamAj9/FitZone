import { Outlet, useLocation } from "react-router-dom";

import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout() {
  const location = useLocation();
  const fullBleed = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className={
          fullBleed
            ? "flex-1"
            : "mx-auto w-full max-w-7xl flex-1 px-4 py-8"
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
