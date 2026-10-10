import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, setAdminAuth } from '@/lib/adminAuth';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('modyhashim2006@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await adminApi.login(email.trim(), password);
      if (res.access_token) {
        setAdminAuth(res.access_token, email.trim());
        navigate('/admin/overview', { replace: true });
      } else {
        setError('تعذر تسجيل الدخول كمسؤول.');
      }
    } catch (err) {
      setError(err.message || 'بيانات الاعتماد غير صحيحة أو غير مصرح لك كمسؤول.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-black">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative backdrop-blur-xl">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-slate-800 border border-amber-500/30 flex items-center justify-center mb-4 shadow-inner">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-400 mb-2">
            <span>FinFamily Central Ops</span>
            <span>·</span>
            <span className="text-slate-400">CBE FinYology 2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">بوابة الإدارة المركزية والرقابة</h1>
          <p className="text-sm text-slate-400 mt-1">
            تسجيل دخول آمن للمسؤولين ومراقبي العمليات المصرفية
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              بريد المسؤول المصرح به
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@finfamily.eg"
                className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 mr-1">
              مسموح فقط للحسابات المعتمدة في الـ Allowlist (مثال: modyhashim2006@gmail.com)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري التحقق من الهوية والأذونات...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>دخول لوحة التحكم المركزية</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة إلى الصفحة الرئيسية للتطبيق</span>
          </button>
        </div>
      </div>
    </div>
  );
}
