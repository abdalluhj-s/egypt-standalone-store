import ProductPageClient from './ProductPageClient';

export function generateStaticParams() {
  return [
    { slug: 'heavyweight-oversized-tee' },
    { slug: 'cairo-fleece-hoodie' },
    { slug: 'urban-cargo-pants' },
    { slug: 'basic-cotton-crewneck' },
  ];
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductPageClient slug={params.slug} />;
}
