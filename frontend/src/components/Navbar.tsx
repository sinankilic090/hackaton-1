"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Ana Sayfa" },
        { href: "/complaints/new", label: "Şikayet Oluştur" },
        { href: "/complaints/my", label: "Şikayetlerim" },
        { href: "/polls", label: "Anketler" },
        ...(user.is_admin ? [{ href: "/admin", label: "Yönetim" }] : []),
      ]
    : [];

  return (
    <>
      {/* Top bar - Decidim style */}
      <div style={{ background: "#111111", color: "#fff", fontSize: "0.8rem", padding: "6px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ opacity: 0.7 }}>Vatandaş Etkileşim Platformu</span>
          {user ? (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ opacity: 0.8 }}>👤 {user.full_name}</span>
              {user.is_admin && (
                <span style={{
                  background: "#E31F26",
                  color: "#fff",
                  padding: "1px 8px",
                  borderRadius: "3px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>YÖNETİCİ</span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ color: "#9ca3af", textDecoration: "none" }}>Giriş Yap</Link>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <nav style={{
        background: "#ffffff",
        borderBottom: "3px solid #E31F26",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "#E31F26",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "#fff",
              fontWeight: 900,
            }}>🏛️</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "1rem", color: "#111", lineHeight: 1.1 }}>Akıllı Belediye</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Vatandaş Platformu</div>
            </div>
          </Link>

          {/* Nav Links */}
          {user && (
            <div style={{ display: "flex", gap: "2px" }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      textDecoration: "none",
                      padding: "6px 16px",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: isActive ? "#E31F26" : "#374151",
                      borderBottom: isActive ? "3px solid #E31F26" : "3px solid transparent",
                      marginBottom: "-3px",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {link.label === "Yönetim" ? "⚡ " + link.label : link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA */}
          {!user && (
            <Link href="/login">
              <button className="btn-primary" style={{ padding: "9px 22px" }}>
                e-Devlet Girişi
              </button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
