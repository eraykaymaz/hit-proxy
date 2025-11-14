// Basit HTML scraper + Stok kontrol API
export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const target = url.searchParams.get("url");

      if (!target) {
        return new Response(JSON.stringify({ error: "no_url" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Render proxy üzerinden çek (CORS bypass)
      const proxy = "https://hit-proxy.onrender.com/?url=" + encodeURIComponent(target);

      let htmlReq = await fetch(proxy, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36",
        },
      });

      let html = await htmlReq.text();

      // -----------------------------
      // ⭐ STOK TESPİTİ
      // -----------------------------

      let stok = "YOK";

      // ÜRÜN TÜKENDİ yazısı
      if (html.includes(">Tükendi<")) stok = "YOK";

      // Sepete ekle butonu varsa = stok var
      if (html.includes("id=\"addToCartBtn\"")) stok = "VAR";

      // Yedek kontrol (bazı ürünlerde farklı yazıyor)
      if (html.includes("Sepete Ekle")) stok = "VAR";

      // -----------------------------
      // ⭐ ÜRÜN ADI
      // -----------------------------

      let titleMatch = html.match(/<h1[^>]*id="product-title"[^>]*>(.*?)<\/h1>/);
      let title = titleMatch ? titleMatch[1].trim() : null;

      // -----------------------------
      // ⭐ FİYAT
      // -----------------------------
      let priceMatch = html.match(/class="product-price">([\s\S]*?)</);
      let price = priceMatch ? priceMatch[1].trim() : null;

      // -----------------------------
      // ⭐ RESİM
      // -----------------------------
      let imgMatch = html.match(/<img[^>]+class="img-fluid"[^>]+src="([^"]+)"/);
      let image = imgMatch ? imgMatch[1] : null;

      // JSON output
      return new Response(
        JSON.stringify({
          durum: stok,
          baslik: title,
          fiyat: price,
          resim: image,
        }, null, 2),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
