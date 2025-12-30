import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CreateProductDialog } from '@/components/CreateProductDialog';
import { useProducts } from '@/hooks/useProducts';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function Products() {
  const { products, isLoading, createProduct, deleteProduct } = useProducts();

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Cardápio
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie os produtos do cardápio
            </p>
          </div>
          <CreateProductDialog
            onSubmit={(product) => createProduct.mutate(product)}
            isLoading={createProduct.isPending}
          />
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Nenhum produto cadastrado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie seu primeiro produto para começar
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={() => deleteProduct.mutate(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
