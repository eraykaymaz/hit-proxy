export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const target = url.searchParams.get("url");

      if (!target) {
        return new Response("URL parametresi gerekli ?url=", { status: 400 });
      }

      const response = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      const html = await response.text();

      // ---------- JSON CHECK ----------
      const jsonMatch = html.match(/var productDetailJson\s*=\s*(\{[\s\S]*?\});/);

      let jsonData = null;
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[1]);
        } catch {}
      }

      // ---------- TITLE ----------
      let title = "";
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
      if (titleMatch) title = titleMatch[1].trim();

      // ---------- PRICE ----------
      let price = "";
      const priceMatch = html.match(/class="price[^"]*">([^<]+)</);
      if (priceMatch) price = priceMatch[1].trim();

      // ---------- IMAGE ----------
      let image = "";
      const imageMatch = html.match(/class="swiper-lazy"[^>]*data-src="([^"]+)"/);
      if (imageMatch) image = imageMatch[1];

      // ---------- CATEGORY ----------
      let category = "";
      const catMatch = html.match(/class="breadcrumb"([\s\S]*?)<\/ol>/);
      if (catMatch) {
        category = catMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      // ---------- STOCK ----------
      let stock = "YOK";

      if (html.includes("Tükendi")) {
        stock = "YOK";
      } else if (html.includes("addToCartBtn") || html.includes("Sepete Ekle")) {
        stock = "VAR";
      } else {
        stock = "YOK";
      }

      // ---------- OUTPUT ----------
      return new Response(
        JSON.stringify(
          {
            title,
            price,
            image,
            category,
            stock,
            jsonFound: jsonData ? true : false,
          },
          null,
          2
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: String(err) }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
