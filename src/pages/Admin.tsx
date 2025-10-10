import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminStats } from '@/components/admin/AdminStats';
import { NewsForm } from '@/components/admin/NewsForm';
import { NewsCard } from '@/components/admin/NewsCard';
import { useBlockedNews } from '@/hooks/useBlockedNews';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search } from 'lucide-react';
import { NewsFormValues } from '@/lib/validations';

const Admin = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { news, isLoading, createNews, toggleStatus, deleteNews, isCreating } = useBlockedNews();

  const handleCreateNews = (data: NewsFormValues) => {
    createNews(data);
    setShowForm(false);
  };

  const handleView = (id: string) => {
    window.open(`/noticia/${id}`, '_blank');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteNews(deleteId);
      setDeleteId(null);
    }
  };

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Gestão de Notícias</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Notícia'}
          </Button>
        </div>

        <AdminStats news={news} />

        {showForm && <NewsForm onSubmit={handleCreateNews} isLoading={isCreating} />}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou fonte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando notícias...
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia cadastrada'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                onView={handleView}
                onToggleStatus={toggleStatus}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A notícia será permanentemente excluída do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Admin;
