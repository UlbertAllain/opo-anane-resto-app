// components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ClipboardList, Info } from "lucide-react"; // Ganti User jadi Info

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/track", label: "Orders", icon: ClipboardList },
  { href: "/info", label: "Info", icon: Info }, // Ganti href dan icon
];

export default function BottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = ["/admin", "/kitchen", "/cashier", "/cart", "/login", "/register", "/detail"];
  if (hiddenRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-soft-caramel/20 shadow-[0_-4px_20px_rgba(122,78,45,0.05)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-warm-brown" : "text-text-secondary hover:text-soft-caramel"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}