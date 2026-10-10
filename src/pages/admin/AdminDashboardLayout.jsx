import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAdminEmail, setAdminAuth } from '@/lib/adminAuth';
import { initSecuritySentinel } from '@/lib/devtoolsDetector';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Database,
  ShieldAlert,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Activity,
  Server
} from 'lucide-react';

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminEmail = getAdminEmail();

  useEffect(() => {
    // Start tamper detection sentinel
    initSecuritySentinel();
  }, []);

  const handleLogout = () => {
    setAdminAuth(null, null);
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    {
      to: '/admin/overview',
      label: 'النظرة العامة والأرقام',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      to: '/admin/transactions',
      label: 'سجل العمليات وحالات الرفض',
      icon: Receipt,
    },
    {
      to: '/admin/cards',
      label: 'أسطول كروت ميزة',
      icon: CreditCard,
    },
    {
      to: '/admin/database',
      label: 'صحة الداتابيز وNeon Telemetry',
      icon: Database,
    },
    {
      to: '/admin/security',
      label: 'مركز التهديدات والأمان',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900/95 border-b md:border-b-0 md:border-l border-slate-800 flex flex-col justify-between p-5 shrink-0 z-20 backdrop-blur-lg">
        <div>
          {/* Brand & Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-blue-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">FinFamily</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">ADMIN</span>
              </div>
              <div className="text-[11px] text-slate-400">رقابة العمليات المصرفية · FinYology</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Identity & Logout */}
        <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-[11px] text-slate-400">المسؤول الحالي:</div>
              <div className="text-xs font-mono font-medium text-slate-200 truncate max-w-[170px]" title={adminEmail}>
                {adminEmail}
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Connected" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Server className="w-3.5 h-3.5" />
              <span>Neon PostgreSQL 17 Connected</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 text-xs text-slate-300">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Sentinel Tamper Defense Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <span>معاينة تطبيق المستخدم</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
