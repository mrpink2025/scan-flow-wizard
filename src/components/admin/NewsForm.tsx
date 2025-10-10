import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsFormSchema, NewsFormValues } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsFormProps {
  onSubmit: (data: NewsFormValues) => void;
  isLoading?: boolean;
}

export const NewsForm = ({ onSubmit, isLoading }: NewsFormProps) => {
  const [isScraping, setIsScraping] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      active: true,
    },
  });

  const urlValue = watch('url');

  const handleFetchMetadata = async () => {
    if (!urlValue || !urlValue.startsWith('http')) {
      toast({
        title: "URL inválida",
        description: "Informe uma URL válida antes de buscar os dados.",
        variant: "destructive",
      });
      return;
    }

    setIsScraping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news-metadata`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url: urlValue }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Preencher campos automaticamente
      if (result.data.title) setValue('title', result.data.title);
      if (result.data.description) setValue('description', result.data.description);
      if (result.data.image_url) setValue('image_url', result.data.image_url);
      if (result.data.source) setValue('source', result.data.source);
      if (result.data.author) setValue('author', result.data.author);
      if (result.data.published_date) {
        // Converter para datetime-local format
        const date = new Date(result.data.published_date);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setValue('published_date', localDate.toISOString().slice(0, 16));
      }

      toast({
        title: "✅ Dados extraídos com sucesso!",
        description: "Revise os campos e ajuste se necessário.",
      });

    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast({
        title: "❌ Erro ao extrair dados",
        description: "Não foi possível buscar os dados. Preencha manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

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
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://exemplo.com/noticia"
                  {...register('url')}
                  disabled={isLoading || isScraping}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleFetchMetadata}
                  disabled={!urlValue || !urlValue.startsWith('http') || isLoading || isScraping}
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Buscar Dados
                    </>
                  )}
                </Button>
              </div>
              {errors.url && (
                <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Cole a URL e clique em "Buscar Dados" para preencher automaticamente
              </p>
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
              <Label htmlFor="description">Descrição / Subtítulo</Label>
              <Textarea
                id="description"
                placeholder="Lead ou subtítulo da notícia (texto em destaque)"
                rows={2}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="content">Conteúdo Completo (HTML)</Label>
              <Textarea
                id="content"
                placeholder="<p>Primeiro parágrafo da notícia...</p><p>Segundo parágrafo...</p>"
                rows={12}
                {...register('content')}
                disabled={isLoading}
                className="font-mono text-sm"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Cole aqui o corpo completo da notícia em HTML. Use tags como &lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, &lt;ul&gt;, etc.
              </p>
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
              <Label htmlFor="image_caption">Legenda da Imagem</Label>
              <Input
                id="image_caption"
                placeholder="Foto: João Silva / Agência Brasil"
                {...register('image_caption')}
                disabled={isLoading}
              />
              {errors.image_caption && (
                <p className="text-sm text-destructive mt-1">{errors.image_caption.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reading_time">Tempo de Leitura (minutos)</Label>
              <Input
                id="reading_time"
                type="number"
                placeholder="5"
                {...register('reading_time')}
                disabled={isLoading}
                min="1"
                max="60"
              />
              {errors.reading_time && (
                <p className="text-sm text-destructive mt-1">{errors.reading_time.message}</p>
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
