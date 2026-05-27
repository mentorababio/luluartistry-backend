// ============================================================
// seed-products.js
// Run this ONCE from your backend folder:
//   node seed-products.js
// ============================================================

const https = require('https');

const BASE_URL = 'https://luluartistry-backend.onrender.com/api';
const ADMIN_EMAIL = 'blessinglucy321@gmail.com';
const ADMIN_PASSWORD = 'Blessinglulu@321';

// ── Hardcoded category IDs from your live database ────────────────────────────
const CAT = {
  lashes:  '694c7bd20d9b673c2478a38f',
  tattoos: '694c7bd20d9b673c2478a390',
  brows:   '694c7bd20d9b673c2478a391',
  spa:     '694c7bd20d9b673c2478a392',
  // Tools don't have their own category — mapped to lashes (equipment used in lash services)
  tools:   '694c7bd20d9b673c2478a38f',
};

// ── Helper: HTTP request ──────────────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
    };

    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Login ─────────────────────────────────────────────────────────────────────
async function login() {
  console.log('🔐 Logging in...');
  const res = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  if (res.status !== 200 || !res.body?.token) {
    throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  }
  console.log('✅ Login successful\n');
  return res.body.token;
}

// ── All 66 products ───────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── TOOLS (mapped to Lashes category) ──────────────────────────────────────
  { name: 'Moon Light Tray',                  category: CAT.tools,   price: 20000,  stock: 20,  isFeatured: true,  description: 'Professional moon light tray for lash services.' },
  { name: 'Stool',                            category: CAT.tools,   price: 40000,  stock: 15,  isFeatured: true,  description: 'Professional salon stool.' },
  { name: 'Lash Bed',                         category: CAT.tools,   price: 230000, stock: 10,  isFeatured: true,  description: 'Professional lash bed for comfortable client positioning during lash extension services.' },
  { name: 'Disposable Bed Cover',             category: CAT.tools,   price: 24000,  stock: 50,  isFeatured: false, description: 'Hygienic disposable bed cover for maintaining cleanliness during beauty services.' },
  { name: 'Glove',                            category: CAT.tools,   price: 13000,  stock: 30,  isFeatured: false, description: 'Professional disposable gloves for beauty services.' },
  { name: 'One Battery Tattoo Machine',       category: CAT.tools,   price: 55000,  stock: 15,  isFeatured: false, description: 'Professional single battery tattoo machine for precise and consistent work.' },
  { name: 'Two Battery Tattoo Machine',       category: CAT.tools,   price: 45000,  stock: 15,  isFeatured: false, description: 'Dual battery tattoo machine for extended operation and consistent performance.' },
  { name: 'Moon Light 26 Inches',             category: CAT.tools,   price: 130000, stock: 10,  isFeatured: true,  description: 'Professional 26-inch moon light tray for lash services.' },
  { name: 'Eye Patch',                        category: CAT.tools,   price: 5000,   stock: 100, isFeatured: false, description: 'Protective eye patches for safe beauty treatments and procedures.' },
  { name: 'Lash Bed Blanket',                 category: CAT.tools,   price: 25000,  stock: 30,  isFeatured: false, description: 'Comfortable blanket for lash bed to enhance client comfort during treatments.' },
  { name: 'Brow Mapping Pen',                 category: CAT.tools,   price: 4500,   stock: 50,  isFeatured: true,  description: 'Professional brow mapping pen for precise brow design and symmetry.' },
  { name: 'Lash Wash Brush',                  category: CAT.tools,   price: 2000,   stock: 50,  isFeatured: false, description: 'Gentle brush for cleaning and maintaining lash extensions.' },
  { name: 'IB Primer',                        category: CAT.tools,   price: 10000,  stock: 30,  isFeatured: true,  description: 'Professional primer for improved product adherence and long-lasting results.' },
  { name: 'Brow Sealant',                     category: CAT.tools,   price: 10000,  stock: 30,  isFeatured: false, description: 'Long-lasting brow sealant to keep brows in place all day.' },
  { name: 'Dummy Head',                       category: CAT.tools,   price: 6500,   stock: 20,  isFeatured: false, description: 'Professional training dummy head for practicing lash and brow techniques.' },
  { name: 'Double Arm Light',                 category: CAT.tools,   price: 65000,  stock: 10,  isFeatured: true,  description: 'Professional double arm adjustable lighting for optimal visibility during treatments.' },

  // ── LASHES ──────────────────────────────────────────────────────────────────
  { name: 'Easy Lash Fan Tray',               category: CAT.lashes,  price: 9000,   stock: 30,  isFeatured: false, description: 'Easy lash fan tray for professional lash application.' },
  { name: 'Classic Lash Fan',                 category: CAT.lashes,  price: 9000,   stock: 30,  isFeatured: false, description: 'Classic lash fan for professional lash application.' },
  { name: 'Lash Glue 10ml',                   category: CAT.lashes,  price: 20000,  stock: 30,  isFeatured: false, description: 'Professional lash glue 10ml for long-lasting lash extensions.' },
  { name: 'Lash Glue 5ml',                    category: CAT.lashes,  price: 16000,  stock: 30,  isFeatured: false, description: 'Professional lash glue 5ml for lash extensions.' },
  { name: 'Lash Breathable Tape',             category: CAT.lashes,  price: 1200,   stock: 50,  isFeatured: false, description: 'Breathable tape for lash extension application.' },
  { name: 'Lash Transparent Tape',            category: CAT.lashes,  price: 1000,   stock: 50,  isFeatured: false, description: 'Transparent tape for lash extension application.' },
  { name: 'Volume Tweezer',                   category: CAT.lashes,  price: 7500,   stock: 20,  isFeatured: false, description: 'Professional volume tweezer for lash extensions.' },
  { name: 'Fiber Tip Tweezer',                category: CAT.lashes,  price: 8000,   stock: 20,  isFeatured: false, description: 'Professional fiber tip tweezer for lash extensions.' },
  { name: 'Lash Fan',                         category: CAT.lashes,  price: 6500,   stock: 20,  isFeatured: false, description: 'Professional lash fan for lash extension application.' },
  { name: 'Glue Ring',                        category: CAT.lashes,  price: 5000,   stock: 30,  isFeatured: false, description: 'Glue ring for lash extension application.' },
  { name: 'Curved Isolation Tweezer',         category: CAT.lashes,  price: 7000,   stock: 20,  isFeatured: false, description: 'Curved isolation tweezer for precise lash extension application.' },
  { name: 'Lash Sealant',                     category: CAT.lashes,  price: 8000,   stock: 30,  isFeatured: false, description: 'Professional lash sealant for long-lasting lash extensions.' },
  { name: 'Glue Storage',                     category: CAT.lashes,  price: 5000,   stock: 30,  isFeatured: false, description: 'Professional glue storage for lash extension adhesives.' },

  // ── TATTOOS ─────────────────────────────────────────────────────────────────
  { name: 'Mast P60 Machine',                 category: CAT.tattoos, price: 450000, stock: 5,   isFeatured: false, description: 'Professional Mast P60 tattoo machine.' },
  { name: 'One Battery Tattoo Machine',       category: CAT.tattoos, price: 55000,  stock: 15,  isFeatured: true,  description: 'Professional single battery tattoo machine for precise and consistent work.' },
  { name: 'Two Battery Tattoo Machine',       category: CAT.tattoos, price: 45000,  stock: 15,  isFeatured: false, description: 'Dual battery tattoo machine for extended operation.' },
  { name: 'One Battery Tattoo Machine Cover', category: CAT.tattoos, price: 500,    stock: 50,  isFeatured: false, description: 'Protective cover for one battery tattoo machine.' },
  { name: 'F&E Primary Cream',                category: CAT.tattoos, price: 18000,  stock: 30,  isFeatured: false, description: 'F&E primary cream for tattoo procedures.' },
  { name: 'Golden Rose Anesthe',              category: CAT.tattoos, price: 10000,  stock: 30,  isFeatured: false, description: 'Golden Rose anaesthetic cream for tattoo procedures.' },
  { name: 'Tag 45 Secondary Numb',            category: CAT.tattoos, price: 15000,  stock: 30,  isFeatured: false, description: 'Tag 45 secondary numbing cream for tattoo procedures.' },
  { name: 'Primary Numb Cream',               category: CAT.tattoos, price: 15000,  stock: 30,  isFeatured: false, description: 'Primary numbing cream for tattoo procedures.' },
  { name: 'Mast Pro Cartridge 20pcs',         category: CAT.tattoos, price: 28000,  stock: 20,  isFeatured: false, description: 'Mast Pro tattoo cartridges, pack of 20.' },
  { name: 'Mapping Strings',                  category: CAT.tattoos, price: 15000,  stock: 30,  isFeatured: false, description: 'Professional mapping strings for tattoo and brow procedures.' },

  // ── BROWS ────────────────────────────────────────────────────────────────────
  { name: 'Brow Mapping Pen',                 category: CAT.brows,   price: 4500,   stock: 50,  isFeatured: true,  description: 'Professional brow mapping pen for precise brow design and symmetry.' },
  { name: 'Brow Sealant',                     category: CAT.brows,   price: 10000,  stock: 30,  isFeatured: false, description: 'Long-lasting brow sealant to keep brows in place all day.' },

  // ── SPA ──────────────────────────────────────────────────────────────────────
  { name: 'Luxury Spa Body Oil',              category: CAT.spa,     price: 18000,  stock: 30,  isFeatured: true,  description: 'Luxury spa body oil for smooth, radiant skin.' },
  { name: 'Herbal Bath Salt',                 category: CAT.spa,     price: 12500,  stock: 30,  isFeatured: true,  description: 'Herbal bath salts for a relaxing spa experience.' },
  { name: 'Aromatherapy Candle',              category: CAT.spa,     price: 10000,  stock: 30,  isFeatured: true,  description: 'Aromatherapy candle for a relaxing spa atmosphere.' },
  { name: 'Green Tea Facial Mask',            category: CAT.spa,     price: 14000,  stock: 30,  isFeatured: true,  description: 'Green tea facial mask for glowing skin.' },
  { name: 'Exfoliating Body Scrub',           category: CAT.spa,     price: 14000,  stock: 30,  isFeatured: true,  description: 'Gentle exfoliating body scrub for smooth, radiant skin.' },
  { name: 'Rose Quartz Facial Roll',          category: CAT.spa,     price: 12000,  stock: 30,  isFeatured: false, description: 'Premium rose quartz facial roller for reducing puffiness and promoting circulation.' },
  { name: 'Clay Detox Mask',                  category: CAT.spa,     price: 13000,  stock: 30,  isFeatured: true,  description: 'Clay detox mask for deep cleansing and purifying skin.' },
  { name: 'Cooling Eye Gel Pad',              category: CAT.spa,     price: 11000,  stock: 30,  isFeatured: false, description: 'Cooling eye gel pad for reducing puffiness and dark circles.' },
  { name: 'Eucalyptus Shower Steamer',        category: CAT.spa,     price: 10000,  stock: 30,  isFeatured: false, description: 'Eucalyptus shower steamer for a refreshing spa experience.' },
  { name: 'Coconut Milk Bath Soak',           category: CAT.spa,     price: 16000,  stock: 30,  isFeatured: false, description: 'Coconut milk bath soak for soft, moisturised skin.' },
  { name: 'Luxury Foot Scrub',                category: CAT.spa,     price: 13000,  stock: 30,  isFeatured: false, description: 'Luxury foot scrub for smooth, soft feet.' },
  { name: 'Silk Sleep Mask',                  category: CAT.spa,     price: 10500,  stock: 30,  isFeatured: false, description: 'Silk sleep mask for a restful night\'s sleep.' },
  { name: 'Detox Herbal Tea Blend',           category: CAT.spa,     price: 11000,  stock: 30,  isFeatured: false, description: 'Detox herbal tea blend for a healthy, refreshing drink.' },
  { name: 'Body Massage Balm',                category: CAT.spa,     price: 16000,  stock: 30,  isFeatured: false, description: 'Body massage balm for relaxing and soothing tired muscles.' },
  { name: 'Hydrating Sheet Mask',             category: CAT.spa,     price: 14000,  stock: 30,  isFeatured: false, description: 'Hydrating sheet mask for glowing, moisturised skin.' },
  { name: 'Luxury Spa Towel Set',             category: CAT.spa,     price: 20000,  stock: 20,  isFeatured: false, description: 'Luxury spa towel set for a professional spa experience.' },
  { name: 'Rose Infused Toner Mist',          category: CAT.spa,     price: 14000,  stock: 30,  isFeatured: false, description: 'Rose infused toner mist for hydrated, glowing skin.' },
  { name: 'Spa Incense Sticks',               category: CAT.spa,     price: 10000,  stock: 30,  isFeatured: false, description: 'Spa incense sticks for a relaxing atmosphere.' },
  { name: 'Luxury Spa Gift Set',              category: CAT.spa,     price: 28000,  stock: 15,  isFeatured: false, description: 'Luxury spa gift set — the perfect treat.' },
];

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed(token) {
  console.log(`🌱 Seeding ${PRODUCTS.length} products...\n`);
  let success = 0, failed = 0, failedNames = [];

  for (const product of PRODUCTS) {
    const res = await request('POST', '/products', product, token);
    if (res.status === 201 || res.status === 200) {
      console.log(`✅ ${product.name}`);
      success++;
    } else {
      const err = res.body?.error || res.body?.message || JSON.stringify(res.body);
      console.log(`❌ ${product.name} — ${err}`);
      failed++;
      failedNames.push(product.name);
    }
    await sleep(400);
  }

  console.log('\n══════════════════════════════════════');
  console.log(`✅ Created: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
  if (failedNames.length) console.log(`\nFailed:\n  ${failedNames.join('\n  ')}`);
  console.log('══════════════════════════════════════');
  console.log('\n🎉 Done! Now run fetch-product-ids.js in the browser console to get the real IDs.');
}

async function main() {
  try {
    const token = await login();
    await seed(token);
  } catch (err) {
    console.error('💥 Fatal:', err.message);
    process.exit(1);
  }
}

main();