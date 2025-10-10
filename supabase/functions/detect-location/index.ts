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
    // Obter IP do usuário
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Detecting location for IP:', clientIP);

    // Usar API gratuita de geolocalização
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();

    // Mapear código de país para idioma
    const countryToLanguage: Record<string, string> = {
      'BR': 'pt',
      'PT': 'pt',
      'US': 'en',
      'GB': 'en',
      'ES': 'es',
      'MX': 'es',
      'FR': 'fr',
      'DE': 'de',
      'IT': 'it',
    };

    const language = countryToLanguage[data.country_code] || 'pt';

    return new Response(
      JSON.stringify({
        country: data.country_name,
        countryCode: data.country_code,
        language,
        city: data.city,
        timezone: data.timezone,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error detecting location:', error);
    return new Response(
      JSON.stringify({
        country: 'Unknown',
        countryCode: 'BR',
        language: 'pt',
        error: 'Failed to detect location',
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Retornar 200 com fallback
      }
    );
  }
});
