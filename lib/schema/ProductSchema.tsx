import { Product } from '../../types/product';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Product as SchemaProduct,
  WithContext,
  Offer,
  AggregateRating,
  Brand,
  BreadcrumbList,
  ListItem
} from 'schema-dts';

interface ProductSchemaProps {
  product: Product;
  reviews?: {
    averageRating: number;
    reviewCount: number;
  } | null;
}

/**
 * Component that generates JSON-LD structured data for product pages
 */
export const ProductSchema = ({ product, reviews }: ProductSchemaProps) => {
  const router = useRouter();
  const { locale = 'en' } = router;
  
  // Base URL for the site
  const siteUrl = 'https://sensebycbd.com';
  
  // Create the full product URL
  const productUrl = `${siteUrl}/${locale}/products/${product.categories?.slug || 'all'}/${product.slug}`;
  
  // Create the brand object
  const brand: Brand = {
    '@type': 'Brand',
    'name': 'SenseBy CBD',
    'logo': `${siteUrl}/images/logo.png`
  };
  
  // Create the offer object
  const offer: Offer = {
    '@type': 'Offer',
    'price': product.sale_price || product.price,
    'priceCurrency': 'EUR',
    'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    'url': productUrl,
    'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  };
  
  // Add special price data if the product is on sale
  if (product.sale_price && product.price) {
    offer.priceSpecification = {
      '@type': 'PriceSpecification',
      'price': product.sale_price,
      'priceCurrency': 'EUR'
    };
  }
  
  // Create the aggregate rating if reviews are available
  let aggregateRating: AggregateRating | undefined;
  if (reviews && reviews.reviewCount > 0) {
    aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': reviews.averageRating,
      'reviewCount': reviews.reviewCount
    };
  }
  
  // Create breadcrumb list
  const breadcrumbList: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${siteUrl}/${locale}`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Products',
        'item': `${siteUrl}/${locale}/products`
      }
    ]
  };
  
  // Add category to breadcrumb if available
  if (product.categories) {
    (breadcrumbList.itemListElement as ListItem[]).push({
      '@type': 'ListItem',
      'position': 3,
      'name': product.categories.name,
      'item': `${siteUrl}/${locale}/products/${product.categories.slug}`
    });
    
    // Add product as final item
    (breadcrumbList.itemListElement as ListItem[]).push({
      '@type': 'ListItem',
      'position': 4,
      'name': product.name,
      'item': productUrl
    });
  } else {
    // Add product as final item if no category
    (breadcrumbList.itemListElement as ListItem[]).push({
      '@type': 'ListItem',
      'position': 3,
      'name': product.name,
      'item': productUrl
    });
  }
  
  // Create the main product schema
  const productSchema: WithContext<SchemaProduct> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': [product.image_url, ...(product.additional_images || [])],
    'sku': product.id,
    'mpn': product.id,
    'brand': brand,
    'offers': offer,
    'url': productUrl
  };
  
  // Add aggregate rating if available
  if (aggregateRating) {
    productSchema.aggregateRating = aggregateRating;
  }
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbList)
        }}
      />
    </Head>
  );
};
