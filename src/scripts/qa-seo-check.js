/**
 * Automated Technical SEO QA Validation Script for Bombo Twerk
 * Run this script to verify:
 * - robots.txt format and blocklist
 * - sitemap.xml dynamic paths, uniqueness, and active products/collections filtering
 * - HTML title, description, og:* meta tags, heading hierarchies (single H1), and canonical tags
 * - JSON-LD Schema.org configurations (Organization, Product, ProductGroup, WebPage, CollectionPage, BreadcrumbList, ItemList)
 * - Complete localization and footer links verification
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
    assert(body.includes('Disallow: /profile/'), 'Bloquea /profile/ de la indexación');
    assert(body.includes('Disallow: /api/'), 'Bloquea /api/ de la indexación');
    assert(body.includes('Disallow: /auth/'), 'Bloquea /auth/ de la indexación');
    assert(body.includes('Sitemap: https://bombotwerk.com/sitemap.xml'), 'Sitemap apunta a la URL absoluta de producción');
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
    assert(sitemapUrls.includes('https://bombotwerk.com/guia-de-tallas'), 'Contiene guía de tallas (/guia-de-tallas)');
    assert(sitemapUrls.includes('https://bombotwerk.com/envios-y-tiempos'), 'Contiene envíos y tiempos (/envios-y-tiempos)');
    assert(sitemapUrls.includes('https://bombotwerk.com/contacto'), 'Contiene página de contacto (/contacto)');
    assert(sitemapUrls.includes('https://bombotwerk.com/privacy'), 'Contiene aviso de privacidad (/privacy)');
    assert(sitemapUrls.includes('https://bombotwerk.com/data-deletion'), 'Contiene página legal (/data-deletion)');

    // Verify no disallowed URLs are in sitemap
    const privateInSitemap = sitemapUrls.filter(u => 
      u.includes('/admin') || u.includes('/checkout') || u.includes('/cart') || u.includes('/profile') || u.includes('/api') || u.includes('/auth')
    );
    assert(privateInSitemap.length === 0, 'Sitemap no contiene URLs de páginas privadas o restringidas');

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
    for (const p of dbProducts) {
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      const hasMTO = p.variants?.some(v => v.availabilityMode === 'stock_and_made_to_order' || v.availabilityMode === 'made_to_order_only');
      const isAvailable = hasStock || hasMTO;

      const canonicalSlug = p.canonicalSlug || p.slug;
      const productSitemapUrl = `https://bombotwerk.com/product/${canonicalSlug}`;
      const inSitemap = sitemapUrls.includes(productSitemapUrl);

      if (p.isActive && isAvailable) {
        assert(inSitemap, `Producto ACTIVO/DISPONIBLE en sitemap: /product/${canonicalSlug}`);
      } else {
        assert(!inSitemap, `Producto INACTIVO/DISCONTINUO EXCLUIDO del sitemap: /product/${canonicalSlug}`);
      }
    }
  } catch (e) {
    assert(false, `Error conectando con la API para comparar datos: ${e.message}`);
  }

  // 4. HTML Metadata, H1 & Social Tags on core pages
  console.log(bold('\n--- 4. AUDITORÍA DE METADATOS Y ELEMENTOS H1 ---'));
  const pagesToTest = [
    { 
      name: 'Home', 
      path: '/', 
      expectedTitle: 'Bombo Twerk | Ropa para twerk, pole dance y performance en México',
      expectedDesc: 'Ropa para twerk, pole dance y performancewear diseñada en México. Encuentra cacheteros, bodys, conjuntos, arneses y piezas de temporada para entrenar, bailar y destacar.',
      expectedH1: 'BAILA CON TU ALMA',
      expectedOgImage: 'https://bombotwerk.com/images/og/home-bombo-twerk.png',
      expectedOgType: 'website'
    },
    { 
      name: 'Tienda', 
      path: '/tienda', 
      expectedTitle: 'Ropa para twerk, pole dance y performance | BOMBO TWERK',
      expectedDesc: 'Ropa para twerk, pole dance y performancewear de alta calidad, diseñada y fabricada en la Ciudad de México. Compresión estructural de alta resistencia.',
      expectedH1: 'Ropa para twerk, pole dance y performance',
      expectedOgImage: 'https://bombotwerk.com/images/og/tienda-bombo-twerk.png',
      expectedOgType: 'website'
    },
    { 
      name: 'Colecciones', 
      path: '/colecciones', 
      expectedTitle: 'Drops y colecciones para twerk y pole dance | Bombo Twerk',
      expectedDesc: 'Explora drops y colecciones de ropa para twerk, pole dance y performancewear en México: cacheteros, bodys, conjuntos y piezas de temporada con actitud Bombo.',
      expectedH1: 'Colecciones de Ropa para Twerk y Pole Dance | BOMBO TWERK',
      expectedOgImage: 'https://bombotwerk.com/images/og/colecciones-bombo-twerk.png',
      expectedOgType: 'website'
    }
  ];

  for (const page of pagesToTest) {
    console.log(yellow(`\nVerificando página: ${page.name} (${page.path})`));
    try {
      const res = await get(`${FRONTEND_URL}${page.path}`);
      assert(res.statusCode === 200, `Responde 200 OK`);
      
      const title = extractTitle(res.body);
      assert(title === page.expectedTitle, `Contiene etiqueta <title> correcta: "${title}"`);
      
      const desc = extractMeta(res.body, 'description');
      assert(desc === page.expectedDesc, `Contiene meta description correcta: "${desc}"`);

      const canonical = extractCanonical(res.body);
      assert(canonical === `https://bombotwerk.com${page.path === '/' ? '' : page.path}`, `Canonical URL correcta: "${canonical}"`);

      const h1Info = countH1(res.body);
      assert(h1Info.count === 1, `Tiene exactamente un H1 (Detectados: ${h1Info.count}). Valor: "${h1Info.contents[0]}"`);

      // OG verification
      const ogTitle = extractMeta(res.body, 'og:title');
      const ogDesc = extractMeta(res.body, 'og:description');
      const ogUrl = extractMeta(res.body, 'og:url');
      const ogType = extractMeta(res.body, 'og:type');
      const ogImg = extractMeta(res.body, 'og:image');
      const twitterCard = extractMeta(res.body, 'twitter:card');
      const twitterImg = extractMeta(res.body, 'twitter:image');

      assert(!!ogTitle, `Open Graph og:title: "${ogTitle}"`);
      assert(!!ogDesc, `Open Graph og:description: "${ogDesc}"`);
      assert(ogUrl === `https://bombotwerk.com${page.path === '/' ? '' : page.path}`, `Open Graph og:url correcto: "${ogUrl}"`);
      assert(ogType === page.expectedOgType, `Open Graph og:type correcto: "${ogType}"`);
      assert(ogImg === page.expectedOgImage, `Open Graph og:image correcto: "${ogImg}"`);
      assert(twitterCard === 'summary_large_image', `Twitter Card es "summary_large_image"`);
      assert(twitterImg === page.expectedOgImage, `Twitter twitter:image correcto: "${twitterImg}"`);

      // Check no old WhatsApp link is present
      assert(!res.body.includes('5215580327915'), 'No contiene el número de WhatsApp viejo en el HTML');

      // Helper specific checks
      if (page.name === 'Home') {
        const schemas = extractJsonLd(res.body);
        const orgSchema = schemas.find(s => s['@type'] === 'Organization');
        const siteSchema = schemas.find(s => s['@type'] === 'WebSite');
        assert(!!orgSchema, 'Inyecta esquema Organization en Home');
        assert(!!siteSchema, 'Inyecta esquema WebSite en Home');
      }

      if (page.name === 'Tienda') {
        // Assert SSR works and doesn't bailout
        assert(!res.body.includes('CARGANDO TIENDA...'), 'No contiene el fallback de carga "CARGANDO TIENDA..."');
        assert(!res.body.includes('BAILOUT_TO_CLIENT_SIDE_RENDERING'), 'No contiene bailout de CSR');
        assert(res.body.includes('/product/'), 'Contiene enlaces HTML reales a los productos');
        
        const schemas = extractJsonLd(res.body);
        const colPageSchema = schemas.find(s => s['@type'] === 'CollectionPage');
        const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
        const itemListSchema = schemas.find(s => s['@type'] === 'ItemList');
        
        assert(!!colPageSchema, 'Inyecta esquema CollectionPage en Tienda');
        assert(!!breadcrumbSchema, 'Inyecta esquema BreadcrumbList en Tienda');
        assert(!!itemListSchema, 'Inyecta esquema ItemList en Tienda');
      }

      if (page.name === 'Colecciones') {
        assert(!res.body.includes('SHOP COLLECTION'), 'No contiene la etiqueta en inglés "SHOP COLLECTION"');
        assert(!res.body.includes('NEW DROP AVAILABLE'), 'No contiene la etiqueta en inglés "NEW DROP AVAILABLE"');
        assert(!res.body.includes('background-image:url()'), 'No contiene estilos inline background-image vacíos');

        const schemas = extractJsonLd(res.body);
        const colPageSchema = schemas.find(s => s['@type'] === 'CollectionPage');
        const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
        const itemListSchema = schemas.find(s => s['@type'] === 'ItemList');

        assert(!!colPageSchema, 'Inyecta esquema CollectionPage en Colecciones');
        assert(!!breadcrumbSchema, 'Inyecta esquema BreadcrumbList en Colecciones');
        assert(!!itemListSchema, 'Inyecta esquema ItemList en Colecciones');
      }

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
      const expectedTitle = testCol.seoTitle || `${testCol.name}: ropa para twerk y pole dance | Bombo Twerk`;
      assert(title === expectedTitle, `Título SEO dinámico correcto: "${title}"`);

      const desc = extractMeta(res.body, 'description');
      const expectedDesc = testCol.seoDescription || testCol.description || `Explora el lanzamiento ${testCol.name} en Bombo Twerk.`;
      assert(desc === expectedDesc, `Meta description dinámica correcta: "${desc}"`);

      const canonical = extractCanonical(res.body);
      assert(canonical === `https://bombotwerk.com/colecciones/${testCol.slug}`, `Canonical URL correcta: "${canonical}"`);

      const ogType = extractMeta(res.body, 'og:type');
      assert(ogType === 'website', `Open Graph og:type es "website" (Encontrado: "${ogType}")`);

      const h1Info = countH1(res.body);
      assert(h1Info.count === 1, `Tiene un solo H1. Valor: "${h1Info.contents[0]}"`);

      const schemas = extractJsonLd(res.body);
      const colPageSchema = schemas.find(s => s['@type'] === 'CollectionPage');
      const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
      const itemListSchema = schemas.find(s => s['@type'] === 'ItemList');

      assert(!!colPageSchema, 'Inyecta esquema CollectionPage');
      assert(!!breadcrumbSchema, 'Inyecta esquema BreadcrumbList');
      assert(!!itemListSchema, 'Inyecta esquema ItemList');

    } catch (e) {
      assert(false, `Error en página de colección: ${e.message}`);
    }
  } else {
    console.log(yellow('No hay colecciones en base de datos para probar.'));
  }

  // 6. Dynamic Product Detail Page Audit + JSON-LD Schemas
  console.log(bold('\n--- 6. AUDITORÍA DE DETALLE DE PRODUCTO Y JSON-LD ---'));
  
  if (dbProducts.length > 0) {
    const inStockProd = dbProducts.find(p => {
      const allStocks = p.variants?.flatMap(v => v.stocks) ?? [];
      const hasStock = allStocks.some(s => s.quantity > 0);
      return p.isActive && hasStock;
    });

    const productsToAudit = [
      { type: 'Disponible (Stock)', prod: inStockProd, expectedAvailability: 'https://schema.org/InStock' }
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

        const ogType = extractMeta(res.body, 'og:type');
        assert(ogType === 'product', `Open Graph og:type es "product" (Encontrado: "${ogType}")`);

        const canonical = extractCanonical(res.body);
        const expectedSlug = prod.canonicalSlug || prod.slug;
        assert(canonical === `https://bombotwerk.com/product/${expectedSlug}`, `Canonical URL correcta: "${canonical}"`);

        // JSON-LD audit
        const schemas = extractJsonLd(res.body);
        assert(schemas.length >= 2, `Se inyectan múltiples esquemas JSON-LD (Encontrados: ${schemas.length})`);

        const orgSchema = schemas.find(s => s['@type'] === 'Organization');
        assert(!!orgSchema, `Contiene esquema Organization`);
        if (orgSchema) {
          assert(orgSchema.name === 'Bombo Twerk', `Organization name es "Bombo Twerk"`);
          assert(orgSchema.url === 'https://bombotwerk.com', `Organization url es "https://bombotwerk.com"`);
          const hasCorrectWhatsApp = Array.isArray(orgSchema.sameAs) && orgSchema.sameAs.includes('https://wa.me/5215582470356');
          assert(hasCorrectWhatsApp, `Organization sameAs contiene el WhatsApp correcto: "https://wa.me/5215582470356"`);
        }

        const prodSchema = schemas.find(s => s['@type'] === 'Product');
        assert(!!prodSchema, `Contiene esquema Product`);
        if (prodSchema) {
          assert(prodSchema.name === prod.name, `Product name coincide: "${prodSchema.name}"`);
          assert(prodSchema.offers?.availability === expectedAvailability, `Offers availability es correcto: "${prodSchema.offers?.availability}"`);
        }

      } catch (e) {
        assert(false, `Error auditando producto: ${e.message}`);
      }
    }
  } else {
    console.log(yellow('No hay productos en base de datos para probar.'));
  }

  // 7. Informative & Legal Pages Audit
  console.log(bold('\n--- 7. AUDITORÍA DE PÁGINAS INFORMATIVAS Y LEGALES ---'));
  const otherPages = [
    { name: 'Guía de Tallas', path: '/guia-de-tallas', h1: 'Guía de Tallas' },
    { name: 'Envíos y Tiempos', path: '/envios-y-tiempos', h1: 'Envíos y Tiempos' },
    { name: 'Contacto', path: '/contacto', h1: 'Contacto Atelier' },
    { name: 'Aviso de Privacidad', path: '/privacy', h1: 'Aviso de Privacidad', ogType: 'article' },
    { name: 'Eliminación de Datos', path: '/data-deletion', h1: 'Eliminación de Datos', ogType: 'article' }
  ];

  for (const page of otherPages) {
    console.log(yellow(`\nVerificando página: ${page.name} (${page.path})`));
    try {
      const res = await get(`${FRONTEND_URL}${page.path}`);
      assert(res.statusCode === 200, `Responde 200 OK`);

      const title = extractTitle(res.body);
      assert(!!title, `Contiene etiqueta <title>: "${title}"`);

      const desc = extractMeta(res.body, 'description');
      assert(!!desc, `Contiene meta description: "${desc}"`);

      const canonical = extractCanonical(res.body);
      assert(canonical === `https://bombotwerk.com${page.path}`, `Canonical URL correcta: "${canonical}"`);

      const h1Info = countH1(res.body);
      assert(h1Info.count === 1, `Tiene exactamente un H1. Valor: "${h1Info.contents[0]}"`);

      const schemas = extractJsonLd(res.body);
      const webPageSchema = schemas.find(s => s['@type'] === 'WebPage');
      const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
      assert(!!webPageSchema, 'Inyecta esquema WebPage');
      assert(!!breadcrumbSchema, 'Inyecta esquema BreadcrumbList');

      if (page.ogType === 'article') {
        const ogType = extractMeta(res.body, 'og:type');
        assert(ogType === 'article', `Open Graph og:type es "article"`);
      }

    } catch (e) {
      assert(false, `Error en página ${page.name}: ${e.message}`);
    }
  }

  // 8. General Globals Audit
  console.log(bold('\n--- 8. AUDITORÍA DE GLOBALES Y REGRESIONES ---'));
  try {
    const homeRes = await get(`${FRONTEND_URL}/`);
    assert(!homeRes.body.includes('href="#"'), 'No contiene ningún link vacío (href="#") en la página');
    assert(!homeRes.body.includes('localhost'), 'No contiene referencias hardcoded a localhost');
    assert(!homeRes.body.includes('127.0.0.1'), 'No contiene referencias hardcoded a 127.0.0.1');
    assert(!homeRes.body.includes('api.bombotwerk.com/product/'), 'No contiene URLs erróneas de la API en el HTML');
  } catch (e) {
    assert(false, `Error en auditoría general: ${e.message}`);
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
