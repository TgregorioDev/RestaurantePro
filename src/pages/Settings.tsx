import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, UtensilsCrossed, Info } from 'lucide-react';

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configurações do sistema
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Info className="h-5 w-5 text-primary" />
                Sobre o Sistema
              </CardTitle>
              <CardDescription>
                Informações sobre o RestaurantePro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Versão</h4>
                <p className="text-foreground">1.0.0</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Desenvolvido com</h4>
                <p className="text-foreground">React + TypeScript + Lovable Cloud</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Database className="h-5 w-5 text-primary" />
                Banco de Dados
              </CardTitle>
              <CardDescription>
                Status do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-foreground">Conectado</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Todos os dados são salvos automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Como Usar
              </CardTitle>
              <CardDescription>
                Guia rápido de uso do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Cadastre suas <strong className="text-foreground">mesas</strong> na página principal</li>
                <li>Cadastre os <strong className="text-foreground">produtos</strong> do cardápio</li>
                <li>Clique em uma mesa disponível para iniciar um atendimento</li>
                <li>Adicione produtos à conta usando o cardápio</li>
                <li>Marque como pago quando o cliente efetuar o pagamento</li>
                <li>Finalize o atendimento para liberar a mesa</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
