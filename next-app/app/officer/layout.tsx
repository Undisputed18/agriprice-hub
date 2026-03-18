"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/contexts/ThemeContext";
import "./marketOfficer.css";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className={`officer-shell${isDarkMode ? " officer-theme" : ""}`}>
      <aside className="officer-sidebar">
        <div className="officer-brand">Market Officer</div>

        <nav className="officer-nav">
          <Link
            href="/officer/dashboard"
            className={`officer-link${
              isActive("/officer/dashboard") ? " active" : ""
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/officer/submit-price"
            className={`officer-link${
              isActive("/officer/submit-price") ? " active" : ""
            }`}
          >
            Submit Produce Price
          </Link>

          <Link
            href="/officer/submissions"
            className={`officer-link${
              isActive("/officer/submissions") ? " active" : ""
            }`}
          >
            View Submissions
          </Link>

          <Link
            href="/officer/market-profile"
            className={`officer-link${
              isActive("/officer/market-profile") ? " active" : ""
            }`}
          >
            Market Profile
          </Link>
        </nav>
      </aside>

      <section className="officer-content">{children}</section>
    </div>
  );
}