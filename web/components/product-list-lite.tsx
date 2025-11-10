import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { CONFIG, getProductUrl } from '../config';

// OpenAI SDK types and hooks
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

function useOpenAiGlobal<K extends keyof any>(key: K): any {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: any) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }
        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => (window as any).openai?.[key]
  );
}

function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

interface Product {
  id: number;
  name: string;
  price: string;
  slug: string;
  permalink: string;
  images: Array<{ src: string; alt: string }>;
  short_description: string;
  stock_status: string;
  type?: string;
  categories?: Array<{
    id: number;
    name: string;
  }>;
  average_rating?: string;
  rating_count?: number;
}

const ProductListLite: React.FC = () => {
  const toolOutput = useToolOutput();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load products from tool output
    if (toolOutput?.products) {
      setProducts(toolOutput.products);
      setIsLoading(false);
    }
  }, [toolOutput]);

  const handleViewProduct = (product: Product) => {
    // Open product page in new tab
    window.open(product.permalink || getProductUrl(product.slug), '_blank');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Products</h1>
            <p style={styles.subtitle}>
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader}></div>
          <p style={styles.loaderText}>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={styles.emptyProducts}>
          <h3 style={styles.emptyTitle}>No products found</h3>
          <p style={styles.emptyText}>Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map((product) => {
            const isInStock = product.stock_status === 'instock';
            const hasImage = product.images && product.images[0] && product.images[0].src;
            const hasPrice = product.price && parseFloat(product.price) > 0;
            const rating = parseFloat(product.average_rating || '0');
            
            return (
              <div key={product.id} style={styles.productCard}>
                {hasImage ? (
                  <img
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.name}
                    style={styles.productImage}
                    onClick={() => handleViewProduct(product)}
                  />
                ) : (
                  <div 
                    style={styles.placeholderImage}
                    onClick={() => handleViewProduct(product)}
                  >
                    <span style={styles.placeholderText}>📦</span>
                    <span style={styles.placeholderSubtext}>No Image</span>
                  </div>
                )}
                <div style={styles.productInfo}>
                  <h3 
                    style={styles.productName}
                    onClick={() => handleViewProduct(product)}
                  >
                    {product.name}
                  </h3>
                  
                  {/* Categories */}
                  {product.categories && product.categories.length > 0 && (
                    <div style={styles.categoriesContainer}>
                      {product.categories.slice(0, 2).map((cat) => (
                        <span key={cat.id} style={styles.categoryBadge}>
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Rating */}
                  {rating > 0 && (
                    <div style={styles.ratingContainer}>
                      <span style={styles.ratingStars}>
                        {'★'.repeat(Math.round(rating))}
                        {'☆'.repeat(5 - Math.round(rating))}
                      </span>
                      <span style={styles.ratingText}>
                        {rating.toFixed(1)} ({product.rating_count || 0})
                      </span>
                    </div>
                  )}
                  
                  <div style={styles.stockBadge}>
                    <span style={isInStock ? styles.stockInStock : styles.stockOutOfStock}>
                      {isInStock ? '● In Stock' : '● Out of Stock'}
                    </span>
                  </div>
                  
                  {product.short_description && (
                    <div
                      style={styles.productDescription}
                      dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                  )}
                  
                  <div style={styles.productFooter}>
                    <span style={styles.productPrice}>
                      {hasPrice ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A'}
                      {product.type === 'variable' && <span style={styles.priceNote}> +</span>}
                    </span>
                    <button
                      onClick={() => handleViewProduct(product)}
                      style={styles.viewProductBtn}
                      title="View Product on Store"
                    >
                      View Product →
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
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '24px',
  },
  productCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  placeholderImage: {
    width: '100%',
    height: '200px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  placeholderText: {
    fontSize: '48px',
  },
  placeholderSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  productInfo: {
    padding: '16px',
  },
  productName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    padding: '4px 8px',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  ratingStars: {
    fontSize: '14px',
    color: '#fbbf24',
  },
  ratingText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  stockBadge: {
    marginBottom: '8px',
  },
  stockInStock: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#10b981',
    display: 'inline-block',
  },
  stockOutOfStock: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ef4444',
    display: 'inline-block',
  },
  productDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  productFooter: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  priceNote: {
    fontSize: '16px',
    color: '#6b7280',
  },
  viewProductBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    minHeight: '400px',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loaderText: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyProducts: {
    textAlign: 'center',
    padding: '80px 20px',
    minHeight: '400px',
  },
  emptyTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
  },
};

// Add CSS animation for loader
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

// Render the component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ProductListLite />);
}
