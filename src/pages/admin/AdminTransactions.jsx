import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminAuth';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

const DECLINE_REASON_MAP = {
  daily_limit_exceeded: {
    label: 'تجاوز الحد اليومي المحدد للطفل',
    badge: 'bg-red-950/80 text-red-300 border-red-800',
  },
  weekly_limit_exceeded: {
    label: 'تجاوز الحد الأسبوعي المحدد',
    badge: 'bg-red-950/80 text-red-300 border-red-800',
  },
  monthly_limit_exceeded: {
    label: 'تجاوز الحد الشهري المحدد',
    badge: 'bg-red-950/80 text-red-300 border-red-800',
  },
  blocked_category: {
    label: 'شراء من فئة تجارية محظورة (ألعاب/مطاعم...)',
    badge: 'bg-orange-950/80 text-orange-300 border-orange-800',
  },
  insufficient_funds: {
    label: 'رصيد كارت ميزة غير كافٍ لإتمام العملية',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
  },
  card_frozen: {
    label: 'كارت ميزة مجمد أمنياً من ولي الأمر',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-800',
  },
  pin_locked: {
    label: 'حساب مقفل بسبب تجاوز محاولات PIN الخاطئة',
    badge: 'bg-red-950/90 text-red-200 border-red-700',
  },
  card_deactivated: {
    label: 'الكارت ملغي نهائياً',
    badge: 'bg-slate-900 text-slate-300 border-slate-700',
  },
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTransactions({
        status: statusFilter || undefined,
        limit: 100,
      });
      setTransactions(res.transactions || []);
    } catch (err) {
      setError(err.message || 'تعذر استدعاء سجل العمليات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  const filtered = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const desc = (tx.description || '').toLowerCase();
    const merchant = (tx.merchant || '').toLowerCase();
    const id = (tx.id || '').toLowerCase();
    const reason = (tx.decline_reason || '').toLowerCase();
    return desc.includes(q) || merchant.includes(q) || id.includes(q) || reason.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>سجل المعاملات المصرفية وحالات الرفض</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            سجل تدقيق كامل لكافة معاملات كروت ميزة، عمليات المصروف، وأسباب الرفض بالتفصيل
          </p>
        </div>
        <button
          onClick={loadTransactions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            { id: '', label: 'كافة المعاملات' },
            { id: 'approved', label: 'الناجحة والمقبولة' },
            { id: 'declined', label: 'المرفوضة والفاشلة' },
            { id: 'pending', label: 'المعلقة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالتاجر، الوصف، أو الـ ID..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table or Empty/Error State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium">جاري فحص وتصفية سجلات Neon DB...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">لا توجد معاملات مطابقة للفلتر المحدد</h3>
          <p className="text-xs text-slate-500">
            {statusFilter
              ? `لم يتم العثور على أي معاملات بحالة "${statusFilter}".`
              : 'لم يتم تسجيل أي معاملات في قاعدة البيانات حتى الآن.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">رقم العملية</th>
                  <th className="py-3.5 px-4">المبلغ</th>
                  <th className="py-3.5 px-4">النوع / التاجر</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">سبب الرفض (إن وجد)</th>
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((tx) => {
                  const isApproved = tx.status === 'approved' || tx.status === 'settled';
                  const isDeclined = tx.status === 'declined' || tx.status === 'failed';
                  const declineInfo = tx.decline_reason
                    ? DECLINE_REASON_MAP[tx.decline_reason] || {
                        label: tx.decline_reason,
                        badge: 'bg-red-950 text-red-300 border-red-800',
                      }
                    : null;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      {/* ID */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {tx.id ? tx.id.substring(0, 12) : '---'}...
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-black text-sm ${
                            isDeclined
                              ? 'text-slate-500 line-through'
                              : tx.amount < 0
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ج.م
                        </span>
                      </td>

                      {/* Merchant & Type */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-200">
                          {tx.merchant || tx.description || 'معاملة غير معنونة'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          نوع: {tx.type || 'كارت ميزة'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 font-sans">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مقبولة وناجحة</span>
                          </span>
                        ) : isDeclined ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-[11px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            <span>مرفوضة / فاشلة</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>معلقة</span>
                          </span>
                        )}
                      </td>

                      {/* Decline Reason */}
                      <td className="py-3.5 px-4 font-sans">
                        {declineInfo ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${declineInfo.badge}`}
                          >
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                            <span>{declineInfo.label}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString('ar-EG') : 'الآن'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
