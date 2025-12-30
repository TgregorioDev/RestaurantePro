import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product, ProductExtra } from '@/types/database';

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: { id: string; name: string; price: number; extras: ProductExtra[] }) => void;
  isLoading?: boolean;
}

export function EditProductDialog({ product, open, onOpenChange, onSubmit, isLoading }: EditProductDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [extras, setExtras] = useState<ProductExtra[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setExtras(product.extras ?? []);
    }
  }, [product]);

  const handleAddExtra = () => {
    if (extraName.trim()) {
      const newExtra: ProductExtra = {
        name: extraName.trim(),
        price: parseFloat(extraPrice) || 0,
      };
      if (!extras.some(e => e.name === newExtra.name)) {
        setExtras([...extras, newExtra]);
        setExtraName('');
        setExtraPrice('');
      }
    }
  };

  const handleRemoveExtra = (extraToRemove: ProductExtra) => {
    setExtras(extras.filter((e) => e.name !== extraToRemove.name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product && name.trim() && price) {
      onSubmit({
        id: product.id,
        name: name.trim(),
        price: parseFloat(price),
        extras,
      });
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setExtras([]);
    setExtraName('');
    setExtraPrice('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Altere as informações do produto. Pedidos existentes não serão afetados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome do Produto</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: X-Burger, Coca-Cola..."
                className="mt-2"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Preço Base (R$)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Adicionais</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                  placeholder="Nome do adicional"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExtra();
                    }
                  }}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={extraPrice}
                  onChange={(e) => setExtraPrice(e.target.value)}
                  placeholder="R$"
                  className="w-24"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExtra();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddExtra}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {extras.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {extras.map((extra) => (
                    <Badge key={extra.name} variant="secondary" className="gap-1">
                      {extra.name} (+R$ {extra.price.toFixed(2)})
                      <button
                        type="button"
                        onClick={() => handleRemoveExtra(extra)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || !price || isLoading}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
