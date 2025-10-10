import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('http')) {
      throw new Error('URL inválida');
    }

    console.log('Fetching metadata from:', url);

    // Fetch HTML da notícia
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Falha ao fazer parsing do HTML');
    }

    // Helper para extrair meta tag
    const getMeta = (property: string, attribute: string = 'property') => {
      const meta = doc.querySelector(`meta[${attribute}="${property}"]`);
      return meta?.getAttribute('content') || null;
    };

    // Extrair metadados (prioridade: Open Graph > Twitter Card > HTML padrão)
    const title = 
      getMeta('og:title') || 
      getMeta('twitter:title', 'name') || 
      doc.querySelector('title')?.textContent?.trim() || 
      '';

    const description = 
      getMeta('og:description') || 
      getMeta('twitter:description', 'name') || 
      getMeta('description', 'name') || 
      '';

    const image_url = 
      getMeta('og:image') || 
      getMeta('twitter:image', 'name') || 
      '';

    const site_name = 
      getMeta('og:site_name') || 
      new URL(url).hostname.replace('www.', '') || 
      '';

    const author = 
      getMeta('author', 'name') || 
      getMeta('article:author') || 
      '';

    const published_date = 
      getMeta('article:published_time') || 
      getMeta('og:published_time') || 
      '';

    console.log('Extracted metadata:', { title, description, image_url, site_name });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: title.substring(0, 200), // Limitar tamanho
          description: description.substring(0, 500),
          image_url: image_url || null,
          source: site_name.substring(0, 100),
          author: author.substring(0, 100) || null,
          published_date: published_date || null,
        },
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error scraping metadata:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao extrair metadados',
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
