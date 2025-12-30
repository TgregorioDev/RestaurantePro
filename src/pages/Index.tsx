import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TableCard } from '@/components/TableCard';
import { CreateTableDialog } from '@/components/CreateTableDialog';
import { TableServiceModal } from '@/components/TableServiceModal';
import { useTables } from '@/hooks/useTables';
import { Table } from '@/types/database';
import { Loader2, LayoutGrid } from 'lucide-react';

export default function Index() {
  const { tables, isLoading, createTable, deleteTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const availableTables = tables.filter((t) => t.status === 'available');
  const inServiceTables = tables.filter((t) => t.status === 'in_service');

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Mesas
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie as mesas do restaurante
            </p>
          </div>
          <CreateTableDialog
            onSubmit={(identifier) => createTable.mutate(identifier)}
            isLoading={createTable.isPending}
          />
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Nenhuma mesa cadastrada
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie sua primeira mesa para começar
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {inServiceTables.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-table-inService/20 text-xs font-bold text-table-inService">
                    {inServiceTables.length}
                  </span>
                  Em Atendimento
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {inServiceTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onClick={() => setSelectedTable(table)}
                      onDelete={() => deleteTable.mutate(table.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {availableTables.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-table-available/20 text-xs font-bold text-table-available">
                    {availableTables.length}
                  </span>
                  Disponíveis
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {availableTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onClick={() => setSelectedTable(table)}
                      onDelete={() => deleteTable.mutate(table.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <TableServiceModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </Layout>
  );
}
