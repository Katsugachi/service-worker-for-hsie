export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const url = new URL(request.url).searchParams.get("url");
    if (!url) return new Response("URL missing", { status: 400, headers: corsHeaders });

    try {
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await response.text();

      // Advanced Regex to find the EXACT authors and dates in the PDF examples
      const meta = {
        author: html.match(/<meta[^>]+(?:name|property)=["'](?:author|article:author|twitter:creator)["'][^>]+content=["']([^"']+)["']/i)?.[1] || 
                html.match(/<span[^>]+class=["'](?:author|byline)["'][^>]*>([^<]+)<\/span>/i)?.[1],
        date: html.match(/<meta[^>]+(?:name|property)=["'](?:article:published_time|date|published_date)["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1],
        title: html.match(/<title>([^<]+)<\/title>/i)?.[1] || 
               html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1],
        site: html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1]
      };

      return new Response(JSON.stringify(meta), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};
