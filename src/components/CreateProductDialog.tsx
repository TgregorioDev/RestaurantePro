import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreateProductDialogProps {
  onSubmit: (product: { name: string; price: number; extras: string[] }) => void;
  isLoading?: boolean;
}

export function CreateProductDialog({ onSubmit, isLoading }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [extraInput, setExtraInput] = useState('');
  const [extras, setExtras] = useState<string[]>([]);

  const handleAddExtra = () => {
    if (extraInput.trim() && !extras.includes(extraInput.trim())) {
      setExtras([...extras, extraInput.trim()]);
      setExtraInput('');
    }
  };

  const handleRemoveExtra = (extra: string) => {
    setExtras(extras.filter((e) => e !== extra));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && price) {
      onSubmit({
        name: name.trim(),
        price: parseFloat(price),
        extras,
      });
      setName('');
      setPrice('');
      setExtras([]);
      setOpen(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setExtras([]);
    setExtraInput('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
            <DialogDescription>
              Adicione um novo item ao cardápio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: X-Burger, Coca-Cola..."
                className="mt-2"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
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
              <Label htmlFor="extra">Adicionais (opcional)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="extra"
                  value={extraInput}
                  onChange={(e) => setExtraInput(e.target.value)}
                  placeholder="Ex: Bacon, Queijo extra..."
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
                    <Badge key={extra} variant="secondary" className="gap-1">
                      {extra}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || !price || isLoading}>
              Criar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
