import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Home, Users, Briefcase, MessageSquare, Bell, User, Sparkles, Map, Shield, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

const roleColor = {
  student: "bg-blue-50 text-blue-700 border-blue-200",
  alumni: "bg-emerald-50 text-emerald-700 border-emerald-200",
  employer: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-amber-50 text-amber-700 border-amber-200",
};

const navFor = (role) => {
  const base = [
    { to: "/dashboard", label: "Home", icon: Home, testid: "nav-dashboard" },
    { to: "/feed", label: "Feed", icon: Users, testid: "nav-feed" },
    { to: "/jobs", label: "Jobs", icon: Briefcase, testid: "nav-jobs" },
    { to: "/messages", label: "Messages", icon: MessageSquare, testid: "nav-messages" },
  ];
  if (role === "student" || role === "alumni") {
    base.push({ to: "/ai", label: "AI Coach", icon: Sparkles, testid: "nav-ai" });
    base.push({ to: "/careers", label: "Careers", icon: Map, testid: "nav-careers" });
  }
  if (role === "admin") base.push({ to: "/admin", label: "Admin", icon: Shield, testid: "nav-admin" });
  return base;
};

const NavItem = ({ item }) => (
  <NavLink to={item.to} data-testid={item.testid}
    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
    <item.icon className="w-4 h-4" /> {item.label}
  </NavLink>
);

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return children;
  const items = navFor(user.role);
  const initials = `${(user.first_name || "?")[0]}${(user.last_name || "")[0] || ""}`.toUpperCase();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <NavLink to="/dashboard" data-testid="brand-link" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-slate-900 flex items-center justify-center text-white font-bold font-heading">R</div>
            <div className="font-heading font-extrabold text-lg tracking-tight hidden sm:block">Richfield Connect</div>
          </NavLink>
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {items.map((it) => <NavItem key={it.to} item={it} />)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/notifications" data-testid="nav-notifications" className="p-2 rounded-lg hover:bg-slate-100 relative">
              <Bell className="w-5 h-5 text-slate-700" />
            </NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu-trigger" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100">
                  <Avatar className="w-8 h-8"><AvatarFallback className="bg-slate-900 text-white text-xs">{initials}</AvatarFallback></Avatar>
                  <Badge variant="outline" className={`hidden sm:inline-flex text-[10px] ${roleColor[user.role]}`}>{user.role}</Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.first_name} {user.last_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} data-testid="menu-profile"><User className="w-4 h-4 mr-2" /> My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/network")} data-testid="menu-network"><Users className="w-4 h-4 mr-2" /> My Network</DropdownMenuItem>
                {(user.role === "student" || user.role === "alumni") && (
                  <DropdownMenuItem onClick={() => navigate("/applications")} data-testid="menu-applications"><Briefcase className="w-4 h-4 mr-2" /> Applications</DropdownMenuItem>
                )}
                {user.role === "employer" && (
                  <DropdownMenuItem onClick={() => navigate("/employer/jobs")} data-testid="menu-employer-jobs"><Briefcase className="w-4 h-4 mr-2" /> My Jobs</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="menu-logout"><LogOut className="w-4 h-4 mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-trigger"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="mt-8 flex flex-col gap-1">
                  {items.map((it) => <NavItem key={it.to} item={it} />)}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-6">{children}</main>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="grid grid-cols-5 h-16">
          {items.slice(0, 5).map((it) => (
            <NavLink key={it.to} to={it.to} data-testid={`mnav-${it.label.toLowerCase()}`}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 text-xs ${isActive ? "text-blue-700" : "text-slate-500"}`}>
              <it.icon className="w-5 h-5" /><span className="text-[10px]">{it.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
