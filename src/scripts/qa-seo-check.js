/**
 * Automated Technical SEO QA Validation Script for Bombo Twerk
 * Run this script to verify:
 * - robots.txt format and blocklist
 * - sitemap.xml dynamic paths, uniqueness, and active products/collections filtering
 * - HTML title, description, og:* meta tags, heading hierarchies (single H1), and canonical tags
 * - JSON-LD Schema.org configurations (Organization, Product, ProductGroup)
 *
 * Usage: node src/scripts/qa-seo-check.js
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';

// Colors for terminal formatting
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[22m`;

async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, {
      headers: {
        'User-Agent': 'SEO-QA-Bot/1.0',
        'ngrok-skip-browser-warning': 'true',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Simple XML tag extractor
function extractTags(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

// Simple HTML regex parser
function extractMeta(html, propertyOrName) {
  // Matches <meta name="..." content="..." /> or <meta property="..." content="..." />
  const regex = new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${propertyOrName}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = regex.exec(html);
  return match ? match[1] : null;
}

function extractCanonical(html) {
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i;
  const match = regex.exec(html);
  return match ? match[1] : null;
}

function extractTitle(html) {
  const regex = /<title>([^<]*)<\/title>/i;
  const match = regex.exec(html);
  return match ? match[1] : null;
}

function countH1(html) {
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const matches = html.match(h1Regex) || [];
  return {
    count: matches.length,
    contents: matches.map(m => m.replace(/<\/?[^>]+(>|$)/g, "").trim())
  };
}

function extractJsonLd(html) {
  const regex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      scripts.push(JSON.parse(match[1].trim()));
    } catch (e) {
      console.warn(yellow(`[Advertencia] Error al parsear JSON-LD: ${e.message}`));
    }
  }
  return scripts;
}

async function run() {
  console.log(bold(cyan('\n======================================================')));
  console.log(bold(cyan('      INICIANDO AUDITORÍA DE SEO TÉCNICO LOCAL       ')));
  console.log(bold(cyan('======================================================\n')));

  let failedTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`${green('✓ [PASS]')} ${message}`);
      passedTests++;
    } else {
      console.log(`${red('✗ [FAIL]')} ${message}`);
      failedTests++;
    }
  }

  // 1. Robots.txt Audit
  console.log(bold('\n--- 1. AUDITORÍA DE ROBOTS.TXT ---'));
  try {
    const robots = await get(`${FRONTEND_URL}/robots.txt`);
    assert(robots.statusCode === 200, `robots.txt responde 200 OK (Status: ${robots.statusCode})`);
    
    const body = robots.body;
    assert(body.toLowerCase().includes('user-agent: *'), 'Define directivas para todos los motores de búsqueda (User-agent: *)');
    assert(body.includes('Allow: /'), 'Permite indexar páginas públicas (Allow: /)');
    assert(body.includes('Disallow: /admin/'), 'Bloquea /admin/ de la indexación');
    assert(body.includes('Disallow: /checkout/'), 'Bloquea /checkout/ de la indexación');
    assert(body.includes('Disallow: /cart/'), 'Bloquea /cart/ de la indexación');
    assert(body.includes('Sitemap: https://bombotwerk.com/sitemap.xml'), 'Incluye la URL absoluta del sitemap de producción');
  } catch (e) {
    assert(false, `Error cargando robots.txt: ${e.message}`);
  }

  // 2. Sitemap.xml Audit
  console.log(bold('\n--- 2. AUDITORÍA DE SITEMAP.XML ---'));
  let sitemapUrls = [];
  try {
    const sitemap = await get(`${FRONTEND_URL}/sitemap.xml`);
    assert(sitemap.statusCode === 200, `sitemap.xml responde 200 OK (Status: ${sitemap.statusCode})`);
    
    sitemapUrls = extractTags(sitemap.body, 'loc');
    assert(sitemapUrls.length > 0, `Sitemap contiene enlaces de navegación (${sitemapUrls.length} enlaces detectados)`);
    
    // Check for localhost URLs
    const localhostUrls = sitemapUrls.filter(u => u.includes('localhost') || u.includes('127.0.0.1'));
    assert(localhostUrls.length === 0, 'No contiene enlaces apuntando a localhost/127.0.0.1');
    
    // Check for correct absolute domain
    const badDomainUrls = sitemapUrls.filter(u => !u.startsWith('https://bombotwerk.com'));
    assert(badDomainUrls.length === 0, 'Todos los enlaces usan el dominio absoluto https://bombotwerk.com');

    // Check for duplicates
    const uniqueUrls = new Set(sitemapUrls);
    assert(uniqueUrls.size === sitemapUrls.length, `No existen URLs duplicadas en el sitemap (Encontradas: ${sitemapUrls.length}, Únicas: ${uniqueUrls.size})`);

    // Verify key pages are present
    assert(sitemapUrls.includes('https://bombotwerk.com'), 'Contiene la URL Home (/)');
    assert(sitemapUrls.includes('https://bombotwerk.com/tienda'), 'Contiene la tienda (/tienda)');
    assert(sitemapUrls.includes('https://bombotwerk.com/colecciones'), 'Contiene índice de colecciones (/colecciones)');
    assert(sitemapUrls.includes('https://bombotwerk.com/privacy'), 'Contiene aviso de privacidad (/privacy)');
    assert(sitemapUrls.includes('https://bombotwerk.com/data-deletion'), 'Contiene página legal (/data-deletion)');

  } catch (e) {
    assert(false, `Error cargando sitemap.xml: ${e.message}`);
  }

  // Fetch products and collections from backend to match sitemap filtering
  console.log(bold('\n--- 3. COMPARACIÓN CON BASE DE DATOS (NestJS API) ---'));
  let dbProducts = [];
  let dbCollections = [];
  try {
    const rawProds = await get(`${BACKEND_URL}/api/products`);
    dbProducts = JSON.parse(rawProds.body);
    const rawCols = await get(`${BACKEND_URL}/api/collections`);
    dbCollections = JSON.parse(rawCols.body);

    console.log(`Productos en DB: ${dbProducts.length} | Colecciones en DB: ${dbCollections.length}`);

    // Sitemap check for inactive/discontinued
    let activeAvailableCount = 0;
    let draftOrDiscontinuedCount = 0;

    for (const p of dbProducts) {
      // Derive product availability same as frontend normalize
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      const hasMTO = p.variants?.some(v => v.availabilityMode === 'stock_and_made_to_order' || v.availabilityMode === 'made_to_order_only');
      const isAvailable = hasStock || hasMTO;

      const canonicalSlug = p.canonicalSlug || p.slug;
      const productSitemapUrl = `https://bombotwerk.com/product/${canonicalSlug}`;
      const inSitemap = sitemapUrls.includes(productSitemapUrl);

      if (p.isActive && isAvailable) {
        activeAvailableCount++;
        assert(inSitemap, `Producto ACTIVO/DISPONIBLE en sitemap: /product/${canonicalSlug}`);
      } else {
        draftOrDiscontinuedCount++;
        assert(!inSitemap, `Producto INACTIVO/DISCONTINUO EXCLUIDO del sitemap: /product/${canonicalSlug}`);
      }
    }
  } catch (e) {
    assert(false, `Error conectando con la API para comparar datos: ${e.message}`);
  }

  // 4. HTML Metadata & H1 Audit on store pages
  console.log(bold('\n--- 4. AUDITORÍA DE METADATOS Y ELEMENTOS H1 ---'));
  const pagesToTest = [
    { name: 'Home', path: '/' },
    { name: 'Tienda', path: '/tienda' },
    { name: 'Colecciones', path: '/colecciones' }
  ];

  for (const page of pagesToTest) {
    console.log(yellow(`\nVerificando página: ${page.name} (${page.path})`));
    try {
      const res = await get(`${FRONTEND_URL}${page.path}`);
      assert(res.statusCode === 200, `Responde 200 OK`);
      
      const title = extractTitle(res.body);
      assert(!!title, `Contiene etiqueta <title>: "${title}"`);
      
      const desc = extractMeta(res.body, 'description');
      assert(!!desc, `Contiene meta description: "${desc}"`);

      const canonical = extractCanonical(res.body);
      assert(canonical === `https://bombotwerk.com${page.path === '/' ? '' : page.path}`, `Canonical URL correcta: "${canonical}" (sin localhost)`);

      const h1Info = countH1(res.body);
      assert(h1Info.count === 1, `Tiene exactamente un H1 (Detectados: ${h1Info.count}). Valor: "${h1Info.contents[0]}"`);

      // OG verification
      const ogTitle = extractMeta(res.body, 'og:title');
      const ogDesc = extractMeta(res.body, 'og:description');
      const ogUrl = extractMeta(res.body, 'og:url');
      const twitterCard = extractMeta(res.body, 'twitter:card');

      assert(!!ogTitle, `Open Graph og:title: "${ogTitle}"`);
      assert(!!ogDesc, `Open Graph og:description: "${ogDesc}"`);
      assert(ogUrl === `https://bombotwerk.com${page.path === '/' ? '' : page.path}`, `Open Graph og:url correcto: "${ogUrl}"`);
      assert(twitterCard === 'summary_large_image', `Twitter Card es "summary_large_image"`);

    } catch (e) {
      assert(false, `Error auditando ${page.name}: ${e.message}`);
    }
  }

  // 5. Dynamic Collection Detail Page Audit
  console.log(bold('\n--- 5. AUDITORÍA DE DETALLE DE COLECCIÓN ---'));
  if (dbCollections.length > 0) {
    const testCol = dbCollections[0];
    console.log(yellow(`Verificando colección: ${testCol.name} (/colecciones/${testCol.slug})`));
    try {
      const res = await get(`${FRONTEND_URL}/colecciones/${testCol.slug}`);
      assert(res.statusCode === 200, `Responde 200 OK`);

      const title = extractTitle(res.body);
      assert(title.includes(testCol.seoTitle || testCol.name), `Título SEO dinámico correcto: "${title}"`);

      const desc = extractMeta(res.body, 'description');
      assert(!!desc, `Meta description dinámica: "${desc}"`);

      const canonical = extractCanonical(res.body);
      assert(canonical === `https://bombotwerk.com/colecciones/${testCol.slug}`, `Canonical URL correcta: "${canonical}"`);

      const h1Info = countH1(res.body);
      assert(h1Info.count === 1, `Tiene un solo H1. Valor: "${h1Info.contents[0]}"`);
    } catch (e) {
      assert(false, `Error en página de colección: ${e.message}`);
    }
  } else {
    console.log(yellow('No hay colecciones en base de datos para probar.'));
  }

  // 6. Dynamic Product Detail Page Audit + JSON-LD Schemas
  console.log(bold('\n--- 6. AUDITORÍA DE DETALLE DE PRODUCTO Y JSON-LD ---'));
  
  // We need at least one product to test
  if (dbProducts.length > 0) {
    // Select products of different availability categories
    // 1. Let's find one InStock, one MadeToOrder, one Discontinued/Out of stock if they exist.
    const inStockProd = dbProducts.find(p => {
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      const isMTO = p.variants?.some(v => v.availabilityMode === 'made_to_order_only' || v.availabilityMode === 'stock_and_made_to_order');
      return p.isActive && hasStock;
    });

    const mtoProd = dbProducts.find(p => {
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      const isMTO = p.variants?.some(v => v.availabilityMode === 'made_to_order_only' || v.availabilityMode === 'stock_and_made_to_order');
      return p.isActive && !hasStock && isMTO;
    });

    const unavailableProd = dbProducts.find(p => {
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      const isMTO = p.variants?.some(v => v.availabilityMode === 'made_to_order_only' || v.availabilityMode === 'stock_and_made_to_order');
      return p.isActive && !hasStock && !isMTO;
    });

    const productsToAudit = [
      { type: 'Disponible (Stock)', prod: inStockProd, expectedAvailability: 'https://schema.org/InStock' },
      { type: 'Bajo pedido (MTO)', prod: mtoProd, expectedAvailability: 'https://schema.org/PreOrder' },
      { type: 'Agotado/Descontinuado', prod: unavailableProd, expectedAvailability: 'https://schema.org/OutOfStock' }
    ].filter(x => !!x.prod);

    for (const item of productsToAudit) {
      const { type, prod, expectedAvailability } = item;
      console.log(yellow(`\nVerificando producto ${type}: ${prod.name} (/product/${prod.slug})`));
      
      try {
        const res = await get(`${FRONTEND_URL}/product/${prod.slug}`);
        assert(res.statusCode === 200, `Responde 200 OK`);

        // Metadata checks
        const title = extractTitle(res.body);
        assert(title.includes(prod.seoTitle || prod.name), `Título SEO dinámico correcto: "${title}"`);

        const desc = extractMeta(res.body, 'description');
        assert(!!desc, `Meta description dinámica: "${desc}"`);

        const canonical = extractCanonical(res.body);
        const expectedSlug = prod.canonicalSlug || prod.slug;
        assert(canonical === `https://bombotwerk.com/product/${expectedSlug}`, `Canonical URL usa canonicalSlug si existe: "${canonical}"`);

        const h1Info = countH1(res.body);
        assert(h1Info.count === 1, `Tiene exactamente un H1. Valor: "${h1Info.contents[0]}"`);

        // JSON-LD audit
        const schemas = extractJsonLd(res.body);
        assert(schemas.length >= 2, `Se inyectan múltiples esquemas JSON-LD (Encontrados: ${schemas.length})`);

        const orgSchema = schemas.find(s => s['@type'] === 'Organization');
        assert(!!orgSchema, `Contiene esquema Organization`);
        if (orgSchema) {
          assert(orgSchema.name === 'Bombo Twerk', `Organization name es "Bombo Twerk"`);
          assert(orgSchema.url === 'https://bombotwerk.com', `Organization url es "https://bombotwerk.com"`);
        }

        const prodSchema = schemas.find(s => s['@type'] === 'Product');
        assert(!!prodSchema, `Contiene esquema Product`);
        if (prodSchema) {
          assert(prodSchema.name === prod.name, `Product name coincide: "${prodSchema.name}"`);
          assert(prodSchema.brand?.name === 'Bombo Twerk', `Product brand name es "Bombo Twerk"`);
          assert(prodSchema.offers?.price === prod.price, `Offers price coincide: ${prodSchema.offers?.price} MXN`);
          assert(prodSchema.offers?.priceCurrency === 'MXN', `Offers priceCurrency es "MXN"`);
          assert(prodSchema.offers?.availability === expectedAvailability, `Offers availability es correcto para ${type}: "${prodSchema.offers?.availability}" (Esperado: "${expectedAvailability}")`);
          
          // Shipping Details Check
          const shipping = prodSchema.offers?.shippingDetails;
          assert(!!shipping, `Contiene shippingDetails en la oferta`);
          if (shipping) {
            const expectedRate = prod.price >= 1000 ? 0 : 150;
            assert(shipping.shippingRate?.value === expectedRate, `shippingRate correcto para el precio de ${prod.price} MXN: ${shipping.shippingRate?.value} (Esperado: ${expectedRate})`);
            assert(shipping.shippingRate?.currency === 'MXN', `shippingRate currency es "MXN"`);
            assert(shipping.shippingDestination?.addressCountry === 'MX', `shippingDestination addressCountry es "MX"`);
            
            // Handing/Transit times
            const deliveryTime = shipping.deliveryTime;
            assert(!!deliveryTime, `Contiene deliveryTime en shippingDetails`);
            if (deliveryTime) {
              const expectedMinHandling = type.includes('MTO') ? 7 : 1;
              const expectedMaxHandling = type.includes('MTO') ? 9 : 2;
              assert(deliveryTime.handlingTime?.minValue === expectedMinHandling, `handlingTime minValue es correcto: ${deliveryTime.handlingTime?.minValue} días`);
              assert(deliveryTime.handlingTime?.maxValue === expectedMaxHandling, `handlingTime maxValue es correcto: ${deliveryTime.handlingTime?.maxValue} días`);
              assert(deliveryTime.transitTime?.minValue === 2, `transitTime minValue es correcto: 2 días`);
              assert(deliveryTime.transitTime?.maxValue === 5, `transitTime maxValue es correcto: 5 días`);
            }
          }
        }

        const groupSchema = schemas.find(s => s['@type'] === 'ProductGroup');
        const hasVariantsInDb = prod.variants && prod.variants.length > 0;
        if (hasVariantsInDb) {
          assert(!!groupSchema, `Contiene esquema ProductGroup para el producto con variantes`);
          if (groupSchema) {
            assert(groupSchema.name === prod.name, `ProductGroup name es "${groupSchema.name}"`);
            assert(Array.isArray(groupSchema.hasVariant) && groupSchema.hasVariant.length > 0, `ProductGroup hasVariant contiene listado de variantes (${groupSchema.hasVariant?.length} variantes)`);
            
            // Verify unique SKUs in variants
            const variantSkus = groupSchema.hasVariant.map(v => v.sku);
            const uniqueSkus = new Set(variantSkus);
            assert(uniqueSkus.size === variantSkus.length, `Cada variante en ProductGroup tiene un SKU único (Total: ${variantSkus.length}, Únicas: ${uniqueSkus.size})`);
          }
        } else {
          assert(!groupSchema, `No contiene esquema ProductGroup ya que el producto no tiene variantes`);
        }

      } catch (e) {
        assert(false, `Error auditando producto: ${e.message}`);
      }
    }
  } else {
    console.log(yellow('No hay productos en base de datos para probar.'));
  }

  // Final scoring
  console.log(bold(cyan('\n======================================================')));
  console.log(bold(cyan('               RESULTADOS DE LA AUDITORÍA             ')));
  console.log(bold(cyan('======================================================')));
  console.log(`Pruebas Exitosas: ${green(passedTests)}`);
  console.log(`Pruebas Fallidas: ${failedTests > 0 ? red(failedTests) : green(failedTests)}`);
  console.log(bold(cyan('======================================================\n')));

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
