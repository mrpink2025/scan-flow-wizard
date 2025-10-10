import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      throw new Error('Missing text or targetLang');
    }

    // Usar endpoint não oficial do Google Tradutor (100% gratuito)
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + 
                targetLang + '&dt=t&q=' + encodeURIComponent(text);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Formato da resposta: [[[tradução, original, null, null]], [idioma_detectado]]
    const translatedText = data[0].map((item: any) => item[0]).join('');

    console.log('Translated:', text.substring(0, 50), '->', translatedText.substring(0, 50));

    return new Response(
      JSON.stringify({ 
        success: true,
        translatedText,
        originalText: text,
        detectedLanguage: data[2] || 'unknown',
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
