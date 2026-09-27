import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const {
      customer_name,
      phone,
      governorate,
      city,
      address,
      landmark,
      items,
      payment_method,
      receipt_url,
      total_amount,
    } = payload;

    // Validate phone number format (Egyptian mobile standard)
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!phone || !egPhoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف محمول مصري صحيح (مثال: 01012345678)' },
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    let orderId = `eg-${Date.now().toString(36)}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && serviceKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, serviceKey);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name,
          phone: phone.trim(),
          governorate,
          city,
          address,
          landmark,
          total_amount,
          payment_method,
          receipt_url: payment_method === 'InstaPay' ? receipt_url : null,
          verification_code: verificationCode,
          items: items || [],
          status: 'pending',
        })
        .select('id')
        .single();

      if (!error && order) {
        orderId = order.id;
      } else if (error) {
        console.error('Supabase order insert error:', error);
      }
    }

    // Build the localized WhatsApp dispatch message
    const itemSummary = (items || [])
      .map(
        (i: any) =>
          `• ${i.title} (${i.color || ''}/${i.size || ''}) x${i.quantity}`
      )
      .join('\n');

    const rawMessage =
      `*طلب جديد من المتجر! (Egypt Wear)*\n` +
      `*رقم الطلب:* #${orderId.slice(0, 8)}\n` +
      `*الاسم:* ${customer_name}\n` +
      `*الهاتف:* ${phone}\n` +
      `*المحافظة:* ${governorate} (${city})\n` +
      `*العنوان:* ${address}${landmark ? ` (علامة مميزة: ${landmark})` : ''}\n` +
      `*طريقة الدفع:* ${payment_method === 'InstaPay' ? 'إنستاباي (InstaPay)' : 'دفع عند الاستلام (COD)'}\n` +
      `*الإجمالي:* ${Number(total_amount).toLocaleString('en-EG')} ج.م\n\n` +
      `*المنتجات المطلوبة:*\n${itemSummary}\n\n` +
      `يرجى تأكيد تجهيز الشحنة والتوصيل 🚀`;

    const storeWhatsAppNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '201012345678';
    const whatsappUrl = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(rawMessage)}`;

    return NextResponse.json({
      success: true,
      orderId,
      whatsappUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
