import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminAuth';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
  RefreshCw,
  Eye,
  CheckCircle2,
  Bug,
  Globe
} from 'lucide-react';

export default function AdminSecuritySentinel() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSecurityAlerts();
      setData(res);
    } catch (err) {
      setError(err.message || 'تعذر استدعاء تنبيهات الأمان.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <span>مركز التهديدات والأمان (Security & Tamper Sentinel)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            رصد محاولات التلاعب بالمتصفح (DevTools)، هجمات الـ Brute-Force على الـ PIN، ومؤشرات الاختراق
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>تحديث التنبيهات</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium">جاري فحص مؤشرات الأمان والتهديدات...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Threat Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Locked PIN Accounts Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-200">حسابات الأطفال المقفلة (PIN Locked)</h2>
                    <p className="text-[11px] text-slate-400">تجاوزت الحد الأقصى لمحاولات إدخال الـ PIN</p>
                  </div>
                </div>
                <span className="font-mono text-lg font-black text-red-400">
                  {data?.locked_pin_accounts?.length || 0}
                </span>
              </div>

              {(!data?.locked_pin_accounts || data.locked_pin_accounts.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500">
                  ✅ لا توجد أي حسابات أطفال مقفلة حالياً. جميع الحسابات في حالة طبيعية.
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {data.locked_pin_accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-slate-950 border border-red-900/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{acc.full_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {acc.id.substring(0, 8)}... · Family: {acc.family_id.substring(0, 8)}...
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                        مقفل أمنياً 🔒
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DevTools & Tampering Beacon Status */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-200">نظام DevTools Sentinel للحماية</h2>
                    <p className="text-[11px] text-slate-400">كاشف العبث ومحاولات التعديل على الواجهة</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                  Active 🛡️
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">آلية الرصد:</span>
                  <span className="text-slate-200 font-medium">Dimension Deltas + Debugger Hooks</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">إجراء الحماية:</span>
                  <span className="text-amber-400 font-medium">تسجيل Beacon فوري ومطابقة الـ IP</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">مسار الـ Beacon:</span>
                  <span className="font-mono text-slate-400">/api/admin/security/beacon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>سجل الإنذارات والعمليات الحساسة (Audit & Security Events)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  جميع العمليات الحساسة المسجلة بعناوين الـ IP والموقع
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {data?.security_events?.length || 0} حدث
              </span>
            </div>

            {(!data?.security_events || data.security_events.length === 0) ? (
              <div className="p-12 text-center text-xs text-slate-500">
                لا توجد أحداث مشبوهة أو إنذارات مسجلة.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                {data.security_events.map((ev) => (
                  <div key={ev.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-400 text-[10px]">
                          {ev.action}
                        </span>
                        <span>بواسطة {ev.actor_role}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>IP: {ev.ip_address || '127.0.0.1'}</span>
                        </span>
                        <span>·</span>
                        <span>Target: {ev.target_type || 'system'}</span>
                      </div>
                    </div>
                    <div className="text-left font-mono text-[11px] text-slate-400">
                      {ev.created_at ? new Date(ev.created_at).toLocaleString('ar-EG') : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
