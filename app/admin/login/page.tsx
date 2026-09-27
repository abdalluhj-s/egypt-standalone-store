'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول. تأكد من صحة البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 p-4 font-cairo">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white font-black text-xl">
            E
          </span>
          <h1 className="text-xl font-black text-neutral-900">تسجيل دخول الإدارة</h1>
          <p className="text-xs text-neutral-500">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                dir="ltr"
                placeholder="admin@egyptwear.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 pr-10 text-xs focus:border-black focus:outline-none font-mono"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-3 pr-10 text-xs focus:border-black focus:outline-none font-mono"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
          </button>
        </form>

        <div className="border-t border-neutral-100 pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black transition"
          >
            <span>العودة إلى واجهة المتجر</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
