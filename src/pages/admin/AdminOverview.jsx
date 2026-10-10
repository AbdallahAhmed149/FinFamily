import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminAuth';
import {
  Users,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message || 'تعذر تحميل الإحصائيات المركزية.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-sm font-medium">جاري استدعاء المؤشرات المركزية من Neon DB...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800/80 text-white text-xs font-semibold"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: 'إجمالي السيولة المودعة (EGP)',
      value: `${(data?.system_liquidity_egp || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`,
      sub: 'في جميع محافظ العائلات',
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-400',
    },
    {
      label: 'العائلات المسجلة',
      value: data?.counts?.families || 0,
      sub: `${data?.counts?.parents || 0} ولي أمر · ${data?.counts?.children || 0} أطفال`,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400',
    },
    {
      label: 'أسطول كروت ميزة',
      value: data?.counts?.total_cards || 0,
      sub: `${data?.counts?.active_cards || 0} نشط · ${data?.counts?.frozen_cards || 0} مجمد`,
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-400',
    },
    {
      label: 'نسبة نجاح العمليات',
      value: `${data?.success_rate_percent || 100}%`,
      sub: `${data?.counts?.transactions || 0} معاملة كلية`,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">نظرة العمليات والسيولة المركزية</h1>
          <p className="text-sm text-slate-400 mt-1">
            متابعة حية لشبكة كروت ميزة العائلية وأداء منظومة FinFamily
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>تحديث مباشر</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-slate-950 shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black tracking-tight ${kpi.textColor} font-mono`}>
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Fleet & Operations Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Fleet Breakdown */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>توزيع كروت ميزة (Meeza)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">{data?.counts?.total_cards || 0} كارت</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300">كروت نشطة (Active)</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {data?.counts?.active_cards || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">كروت مجمدة (Frozen)</span>
              </div>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {data?.counts?.frozen_cards || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-slate-300">كروت معطلة (Deactivated)</span>
              </div>
              <span className="text-xs font-bold text-red-400 font-mono">
                {data?.counts?.deactivated_cards || 0}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              جميع الكروت مشفرة بنظام PCI-DSS مع حماية ضد السحب النقدي المفرط والعمليات المشبوهة.
            </span>
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>أحدث أنشطة وسجلات المنظومة (Audit Log)</span>
            </h2>
            <span className="text-xs text-slate-500">Live DB Stream</span>
          </div>

          {(!data?.recent_audit_logs || data.recent_audit_logs.length === 0) ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد أنشطة مسجلة حديثاً في سجل التدقيق.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
              {data.recent_audit_logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-amber-400 font-mono">
                        {log.action}
                      </span>
                      <span>بواسطة {log.actor_role}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      IP: {log.ip_address || '127.0.0.1'} · {log.created_at ? new Date(log.created_at).toLocaleTimeString('ar-EG') : ''}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    {log.target_type ? `Target: ${log.target_type}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
