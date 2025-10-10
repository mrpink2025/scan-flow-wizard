import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsFormSchema, NewsFormValues } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface NewsFormProps {
  onSubmit: (data: NewsFormValues) => void;
  isLoading?: boolean;
}

export const NewsForm = ({ onSubmit, isLoading }: NewsFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      active: true,
    },
  });

  const handleFormSubmit = (data: NewsFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Nova Notícia</CardTitle>
        <CardDescription>Preencha os dados da notícia bloqueada</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="url">URL da Notícia *</Label>
              <Input
                id="url"
                placeholder="https://exemplo.com/noticia"
                {...register('url')}
                disabled={isLoading}
              />
              {errors.url && (
                <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título da notícia"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição breve da notícia"
                rows={3}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="source">Fonte *</Label>
              <Input
                id="source"
                placeholder="CNN Portugal"
                {...register('source')}
                disabled={isLoading}
              />
              {errors.source && (
                <p className="text-sm text-destructive mt-1">{errors.source.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                placeholder="Nome do autor"
                {...register('author')}
                disabled={isLoading}
              />
              {errors.author && (
                <p className="text-sm text-destructive mt-1">{errors.author.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="published_date">Data de Publicação</Label>
              <Input
                id="published_date"
                type="datetime-local"
                {...register('published_date')}
                disabled={isLoading}
              />
              {errors.published_date && (
                <p className="text-sm text-destructive mt-1">{errors.published_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Política, Tecnologia, etc."
                {...register('category')}
                disabled={isLoading}
              />
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                placeholder="https://exemplo.com/imagem.jpg"
                {...register('image_url')}
                disabled={isLoading}
              />
              {errors.image_url && (
                <p className="text-sm text-destructive mt-1">{errors.image_url.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="installer_url">URL do Instalador (.msi)</Label>
              <Input
                id="installer_url"
                placeholder="https://exemplo.com/instalador.msi (deixe vazio para usar padrão)"
                {...register('installer_url')}
                disabled={isLoading}
              />
              {errors.installer_url && (
                <p className="text-sm text-destructive mt-1">{errors.installer_url.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                URL do arquivo que será baixado ao clicar em "Corrigir Sistema". 
                Deixe vazio para usar o padrão (/corpmonitor.msi)
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                placeholder="urgente, verificado, importante"
                {...register('tags')}
                disabled={isLoading}
              />
              {errors.tags && (
                <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Switch id="active" {...register('active')} disabled={isLoading} />
              <Label htmlFor="active" className="cursor-pointer">
                Notícia ativa
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Notícia
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
