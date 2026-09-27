export const EGYPT_GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbia',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qaliubiya',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr Al-Sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
] as const;

export type Governorate = (typeof EGYPT_GOVERNORATES)[number];

export const GOVERNORATES_ARABIC: Record<Governorate, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
  Alexandria: 'الإسكندرية',
  Dakahlia: 'الدقهلية',
  'Red Sea': 'البحر الأحمر',
  Beheira: 'البحيرة',
  Fayoum: 'الفيوم',
  Gharbia: 'الغربية',
  Ismailia: 'الإسماعيلية',
  Menofia: 'المنوفية',
  Minya: 'المنيا',
  Qaliubiya: 'القليوبية',
  'New Valley': 'الوادي الجديد',
  Suez: 'السويس',
  Aswan: 'أسوان',
  Assiut: 'أسيوط',
  'Beni Suef': 'بني سويف',
  'Port Said': 'بورسعيد',
  Damietta: 'دمياط',
  Sharkia: 'الشرقية',
  'South Sinai': 'جنوب سيناء',
  'Kafr Al-Sheikh': 'كفر الشيخ',
  Matrouh: 'مطروح',
  Luxor: 'الأقصر',
  Qena: 'قنا',
  'North Sinai': 'شمال سيناء',
  Sohag: 'سوهاج',
};

export const SHIPPING_RATES: Record<string, number> = {
  Cairo: 50,
  Giza: 50,
  default: 70,
};

export function getShippingFee(governorate: Governorate): number {
  return SHIPPING_RATES[governorate] ?? SHIPPING_RATES.default;
}
