import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminAuth';
import {
  Database,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

export default function AdminDatabaseTelemetry() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pingTime, setPingTime] = useState(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await adminApi.getDatabaseHealth();
      const end = performance.now();
      setHealth(res);
      setPingTime(Math.round(end - start));
    } catch (err) {
      setError(err.message || 'فشل الاتصال بقاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const tableLabels = {
    users: 'المستخدمين (أولياء أمور وأطفال)',
    families: 'العائلات المسجلة',
    wallets: 'محافظ كروت ميزة',
    transactions: 'المعاملات المالية',
    card_purchases: 'عمليات الشراء بنقاط البيع (POS)',
    missions: 'المهام والتحديات المالية',
    savings_goals: 'أهداف وحصالات الادخار',
    audit_logs: 'سجل التدقيق والأمان',
    card_limits: 'قواعد وسقوف الصرف',
    refresh_tokens: 'جلسات التوكن النشطة',
    badges: 'أوسمة الإنجاز والتعلم',
    user_badges: 'الأوسمة الممنوحة للأطفال',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-amber-400" />
            <span>صحة قاعدة البيانات والقياسات الحية (Neon Telemetry)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            مراقبة زمن استجابة خادم PostgreSQL 17 السحابي وتعداد السجلات في جميع الجداول
          </p>
        </div>
        <button
          onClick={checkHealth}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>اختبار Ping مباشر</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium">جاري إرسال اختبار استعلام لخادم Neon في فرانكفورت...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={checkHealth}
            className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800/80 text-white text-xs font-semibold"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status & Latency Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Status */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">حالة الاتصال بالداتابيز</div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {health?.database === 'connected' ? 'CONNECTED (HEALTHY)' : health?.database}
                </div>
                <div className="text-[11px] text-slate-500">PostgreSQL 17.0 (Neon Serverless)</div>
              </div>
            </div>

            {/* Neon Query Latency */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">زمن استجابة الاستعلام (DB Query Ping)</div>
                <div className="text-base font-bold text-amber-400 font-mono">
                  {health?.latency_ms || 0} ms
                </div>
                <div className="text-[11px] text-slate-500">Latency from Vercel compute</div>
              </div>
            </div>

            {/* Total Records */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">إجمالي السجلات عبر الجداول</div>
                <div className="text-base font-bold text-blue-400 font-mono">
                  {health?.table_counts
                    ? Object.values(health.table_counts).reduce((a, b) => a + b, 0)
                    : 0}{' '}
                  سجل
                </div>
                <div className="text-[11px] text-slate-500">12 جدول في المخطط (Schema)</div>
              </div>
            </div>
          </div>

          {/* Tables Row Counts Grid */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>تعداد السجلات الحية في جداول قاعدة البيانات (Live Table Counts)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  بيانات مباشرة مسترجعة باستعلام `SELECT COUNT(*)` من خادم Neon الفعلي
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                Zero Mock Data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {health?.table_counts &&
                Object.entries(health.table_counts).map(([tableName, count]) => (
                  <div
                    key={tableName}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-300">{tableName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {tableLabels[tableName] || tableName}
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <span className="font-mono text-xl font-black text-amber-400">{count}</span>
                      <span className="text-[10px] text-slate-500 mr-1">سجل</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
