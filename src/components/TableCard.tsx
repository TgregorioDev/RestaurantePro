import { Table } from '@/types/database';
import { cn } from '@/lib/utils';
import { Users, Clock, Trash2 } from 'lucide-react';
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

interface TableCardProps {
  table: Table;
  onClick: () => void;
  onDelete: () => void;
}

export function TableCard({ table, onClick, onDelete }: TableCardProps) {
  const isAvailable = table.status === 'available';

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-in',
        isAvailable
          ? 'border-table-available/30 bg-gradient-to-br from-table-available/5 to-table-available/10 hover:border-table-available/50 hover:shadow-lg hover:shadow-table-available/10'
          : 'border-table-inService/30 bg-gradient-to-br from-table-inService/5 to-table-inService/10 hover:border-table-inService/50 hover:shadow-lg hover:shadow-table-inService/10'
      )}
      onClick={onClick}
    >
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Mesa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover a mesa "{table.identifier}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold',
            isAvailable
              ? 'bg-table-available/20 text-table-available'
              : 'bg-table-inService/20 text-table-inService'
          )}
        >
          <Users className="h-6 w-6" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            isAvailable
              ? 'bg-table-available/20 text-table-available'
              : 'bg-table-inService/20 text-table-inService animate-pulse-gentle'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isAvailable ? 'bg-table-available' : 'bg-table-inService'
            )}
          />
          {isAvailable ? 'Disponível' : 'Em atendimento'}
        </div>
      </div>

      <h3 className="font-display text-2xl font-bold text-foreground">
        {table.identifier}
      </h3>
      
      {!isAvailable && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Atendimento em andamento</span>
        </div>
      )}
    </div>
  );
}
