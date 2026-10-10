import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminAuth';
import {
  CreditCard,
  Lock,
  Unlock,
  Ban,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function AdminCardsFleet() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCards();
      setCards(res.cards || []);
    } catch (err) {
      setError(err.message || 'تعذر تحميل أسطول الكروت.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleUpdateStatus = async (walletId, newStatus) => {
    setActionInProgress(walletId);
    try {
      await adminApi.updateCardStatus(walletId, newStatus);
      // Update local state
      setCards((prev) =>
        prev.map((c) => (c.wallet_id === walletId ? { ...c, card_status: newStatus } : c))
      );
    } catch (err) {
      alert(`فشل تحديث حالة الكارت: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = cards.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (c.cardholder_name || '').toLowerCase();
    const pan = (c.card_number || '').toLowerCase();
    return name.includes(q) || pan.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>أسطول كروت ميزة المصرفية (Meeza Fleet)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            إدارة والتحكم المركزي في جميع الكروت الصادرة للأطفال والعائلات مع خيارات التجميد الفوري
          </p>
        </div>
        <button
          onClick={loadCards}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>تحديث الأسطول</span>
        </button>
      </div>

      {/* PCI-DSS Security Notice & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>أرقام البطاقات مقنعة ومشفرة وفق معيار الأمان المصرفي PCI-DSS (BIN 5061 - Meeza Prepaid)</span>
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الحامل أو الكارت..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Cards Grid / Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium">جاري فحص حالة الكروت في Neon DB...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">لا توجد كروت مصدرة حتى الآن</h3>
          <p className="text-xs text-slate-500">
            عندما يقوم أي ولي أمر بإضافة طفل في التطبيق، سيظهر كارته في هذه القائمة فوراً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((card) => {
            const isFrozen = card.card_status === 'frozen';
            const isDeactivated = card.card_status === 'deactivated';
            const isActive = card.card_status === 'active';
            const isBusy = actionInProgress === card.wallet_id;

            return (
              <div
                key={card.wallet_id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg backdrop-blur-sm relative overflow-hidden flex flex-col justify-between"
              >
                {/* Meeza Card Header Simulation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-widest text-amber-400">MEEZA</span>
                      <span className="text-[10px] text-slate-400">Prepaid</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          : isFrozen
                          ? 'bg-amber-950 border border-amber-800 text-amber-400'
                          : 'bg-red-950 border border-red-800 text-red-400'
                      }`}
                    >
                      {isActive ? 'نشط ✅' : isFrozen ? 'مجمد 🔒' : 'معطل 🚫'}
                    </span>
                  </div>

                  {/* Masked PAN */}
                  <div className="font-mono text-base tracking-widest font-black text-slate-100 my-2">
                    {card.card_number || '5061 •••• •••• 0000'}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <div className="text-[10px] text-slate-500">حامل الكارت</div>
                      <div className="font-bold text-slate-200">{card.cardholder_name || 'بطل مالي'}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-500">الرصيد المتاح</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {(card.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 1 })} ج.م
                      </div>
                    </div>
                  </div>
                </div>

                {/* Limits & Controls */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>الحد اليومي: {card.daily_limit ? `${card.daily_limit} ج.م` : 'غير محدد'}</span>
                    <span>الحد الشهري: {card.monthly_limit ? `${card.monthly_limit} ج.م` : 'غير محدد'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {isActive ? (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(card.wallet_id, 'frozen')}
                        className="py-2 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>تجميد الكارت</span>
                      </button>
                    ) : (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(card.wallet_id, 'active')}
                        className="py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>فك التجميد</span>
                      </button>
                    )}

                    <button
                      disabled={isBusy || isDeactivated}
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من تعطيل كارت ${card.cardholder_name} نهائياً؟`)) {
                          handleUpdateStatus(card.wallet_id, 'deactivated');
                        }
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>تعطيل دائم</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
