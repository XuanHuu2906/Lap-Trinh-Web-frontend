import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const PublicLayout: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement;
    const shouldRestoreDark =
      root.classList.contains("dark") || localStorage.getItem("theme") === "dark";

    const forcePublicLightTheme = () => {
      root.classList.remove("dark");
    };

    forcePublicLightTheme();
    const timer = window.setTimeout(forcePublicLightTheme, 0);

    return () => {
      window.clearTimeout(timer);
      if (shouldRestoreDark && localStorage.getItem("theme") === "dark") {
        root.classList.add("dark");
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-800 transition-colors duration-150">
      <Header />
      <main className="flex grow flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
