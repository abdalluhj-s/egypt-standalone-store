import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('id');
  const code = searchParams.get('code');

  if (!orderId || !code) {
    return NextResponse.json({ error: 'بيانات التحقق غير مكتملة' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceKey && !supabaseUrl.includes('placeholder')) {
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, verification_code')
      .eq('id', orderId)
      .single();

    if (error || !order || order.verification_code !== code) {
      return NextResponse.json({ error: 'رمز التأكيد غير صحيح أو منتهي الصلاحية' }, { status: 400 });
    }

    await supabase
      .from('orders')
      .update({ status: 'confirmed', is_verified: true })
      .eq('id', orderId);
  }

  return NextResponse.redirect(new URL(`/order-success?id=${orderId}`, req.url));
}
