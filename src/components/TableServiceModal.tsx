import { useState, useEffect } from 'react';
import { Table, Product, ProductExtra, SelectedExtra } from '@/types/database';
import { useOrders, useOrderItems } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Receipt,
  ChevronLeft,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

interface TableServiceModalProps {
  table: Table | null;
  onClose: () => void;
}

interface AddProductModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (quantity: number, selectedExtras: SelectedExtra[], notes?: string) => void;
}

function AddProductModal({ product, onClose, onAdd }: AddProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [notes, setNotes] = useState('');

  const handleToggleExtra = (extra: ProductExtra, checked: boolean) => {
    if (checked) {
      setSelectedExtras([...selectedExtras, { name: extra.name, price: extra.price }]);
    } else {
      setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name));
    }
  };

  const handleAdd = () => {
    onAdd(quantity, selectedExtras, notes || undefined);
    onClose();
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {extrasTotal > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  + {formatCurrency(extrasTotal)} adicionais
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-xl font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {product.extras && product.extras.length > 0 && (
            <div className="space-y-2">
              <Label>Adicionais</Label>
              <div className="space-y-2">
                {product.extras.map((extra: ProductExtra) => (
                  <label
                    key={extra.name}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedExtras.some((e) => e.name === extra.name)}
                        onCheckedChange={(checked) => handleToggleExtra(extra, !!checked)}
                      />
                      <span>{extra.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      +{formatCurrency(extra.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sem cebola, bem passado..."
              className="mt-2"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1 gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TableServiceModal({ table, onClose }: TableServiceModalProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  const { products } = useProducts();
  const { updateTableStatus } = useTables();
  const { activeOrder, createOrder, updateOrderStatus, updateOrderTotal } = useOrders(table?.id);
  const { items, addItem, updateItem, removeItem } = useOrderItems(activeOrder?.id);

  // Calculate total from items
  const calculatedTotal = items.reduce((sum, item) => sum + item.total_price, 0);

  // Update order total when items change
  useEffect(() => {
    if (activeOrder && activeOrder.total !== calculatedTotal) {
      updateOrderTotal.mutate({ id: activeOrder.id, total: calculatedTotal });
    }
  }, [calculatedTotal, activeOrder]);

  // Create order when opening a table
  useEffect(() => {
    if (table && table.status === 'available' && !activeOrder) {
      // Mark table as in service
      updateTableStatus.mutate({ id: table.id, status: 'in_service' });
      // Create new order
      createOrder.mutate(table.id);
    }
  }, [table?.id]);

  if (!table) return null;

  const handleAddProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirmAddProduct = (quantity: number, selectedExtras: SelectedExtra[], notes?: string) => {
    if (!activeOrder || !selectedProduct) return;

    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = selectedProduct.price + extrasTotal;
    const totalPrice = unitPrice * quantity;

    addItem.mutate({
      order_id: activeOrder.id,
      product_id: selectedProduct.id,
      quantity,
      selected_extras: selectedExtras,
      base_price_at_order: selectedProduct.price,
      unit_price: unitPrice,
      total_price: totalPrice,
      notes,
    });
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem.mutate(itemId);
    } else {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        updateItem.mutate({
          id: itemId,
          quantity: newQty,
          total_price: item.unit_price * newQty,
        });
      }
    }
  };

  const handleMarkAsPaid = () => {
    if (!activeOrder) return;
    updateOrderStatus.mutate({ id: activeOrder.id, status: 'paid' });
    setShowPaymentConfirm(false);
    toast.success('Conta marcada como paga!');
  };

  const handleFinalize = () => {
    if (!activeOrder || !table) return;
    
    updateOrderStatus.mutate({ id: activeOrder.id, status: 'closed' });
    updateTableStatus.mutate({ id: table.id, status: 'available' });
    setShowFinalizeConfirm(false);
    toast.success('Atendimento finalizado!');
    onClose();
  };

  const isPaid = activeOrder?.status === 'paid';

  return (
    <>
      <Dialog open={!!table} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl">
                    {table.identifier}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {isPaid ? 'Conta paga' : 'Em atendimento'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedTotal)}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {showMenu ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <Button variant="ghost" className="gap-2" onClick={() => setShowMenu(false)}>
                    <ChevronLeft className="h-4 w-4" />
                    Voltar para Conta
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 grid gap-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div>
                          <h4 className="font-medium text-foreground">{product.name}</h4>
                          {product.extras && product.extras.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Adicionais: {product.extras.map((e: ProductExtra) => e.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-primary">
                            {formatCurrency(product.price)}
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Plus className="h-4 w-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <Button className="w-full gap-2" onClick={() => setShowMenu(true)}>
                    <UtensilsCrossed className="h-4 w-4" />
                    Abrir Cardápio
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                          Nenhum item adicionado ainda
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Clique em "Abrir Cardápio" para adicionar produtos
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground truncate">
                                  {item.product?.name}
                                </span>
                              </div>
                              {item.selected_extras && item.selected_extras.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  +{item.selected_extras.map((e: SelectedExtra) => `${e.name} (${formatCurrency(e.price)})`).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                >
                                  {item.quantity === 1 ? (
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  ) : (
                                    <Minus className="h-3 w-3" />
                                  )}
                                </Button>
                                <span className="w-6 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="w-20 text-right font-semibold text-primary">
                                {formatCurrency(item.total_price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/30 flex gap-2">
            {!isPaid ? (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowPaymentConfirm(true)}
                disabled={items.length === 0}
              >
                <CreditCard className="h-4 w-4" />
                Marcar como Pago
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 text-success font-medium">
                <Check className="h-5 w-5" />
                Conta Paga
              </div>
            )}
            <Button
              className="flex-1 gap-2"
              onClick={() => setShowFinalizeConfirm(true)}
              disabled={!isPaid}
            >
              <Check className="h-4 w-4" />
              Finalizar Atendimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <AddProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleConfirmAddProduct}
        />
      )}

      <AlertDialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar a conta de {formatCurrency(calculatedTotal)} como paga?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid}>
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              A mesa "{table.identifier}" será liberada e ficará disponível para novos atendimentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize}>
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
