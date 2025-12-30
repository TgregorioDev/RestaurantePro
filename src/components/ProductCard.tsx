import { Product, ProductExtra } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  showActions?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, onAdd, showActions = true }: ProductCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <p className="mt-1 text-xl font-bold text-primary">
            {formatCurrency(product.price)}
          </p>
          {product.extras && product.extras.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.extras.map((extra: ProductExtra, index: number) => (
                <span
                  key={index}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {extra.name} {extra.price > 0 && `(+${formatCurrency(extra.price)})`}
                </span>
              ))}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {onAdd && (
              <Button
                variant="default"
                size="icon"
                className="h-9 w-9"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover Produto</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover "{product.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={onDelete}
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
