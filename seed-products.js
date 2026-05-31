
require('dotenv').config({ path: './.env' }); // Ensure it points to your .env file
// Run from backend folder: node seed-images.js
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'https://luluartistry-backend.onrender.com/api';
const UPLOAD_URL = 'https://luluartistry-backend.onrender.com/uploads/products';
const ADMIN_EMAIL = 'blessinglucy321@gmail.com';
const ADMIN_PASSWORD = 'Blessinglulu@321';

// ... IMAGE_MAP remains the same as in your provided code ...
const IMAGE_MAP = {
  'Moon Light Tray': 'src/assets/images/moon light tray.png',
  'Stool': 'src/assets/images/stool.png',
  'Lash Bed': 'src/assets/images/lash bed.png',
  'Disposable Bed Cover': 'src/assets/images/DBed cover.png',
  'Glove': 'src/assets/images/Glove.png',
  'One Battery Tattoo Machine': 'src/assets/images/One BTM.png',
  'Two Battery Tattoo Machine': 'src/assets/images/two btm.png',
  'Moon Light 26 Inches': 'src/assets/images/moon light inches.png',
  'Eye Patch': 'src/assets/images/eye patch.png',
  'Lash Bed Blanket': 'src/assets/images/lash bed blanket.png',
  'Brow Mapping Pen': 'src/assets/images/brow mapping pen.png',
  'Lash Wash Brush': 'src/assets/images/lash wash brush.png',
  'IB Primer': 'src/assets/images/Ib primer.png',
  'Brow Sealant': 'src/assets/images/brow sealant.png',
  'Dummy Head': 'src/assets/images/Dummy head.png',
  'Double Arm Light': 'src/assets/images/Double ARM LIGHT.png',
  'Easy Lash Fan Tray': 'src/assets/images/Easy lash fan tray.png',
  'Classic Lash Fan': 'src/assets/images/classic lash fan.png',
  'Lash Glue 10ml': 'src/assets/images/lash glue ten.png',
  'Lash Glue 5ml': 'src/assets/images/lash glue five.png',
  'Lash Breathable Tape': 'src/assets/images/lash breathable table.png',
  'Lash Transparent Tape': 'src/assets/images/lash trans tape.png',
  'Volume Tweezer': 'src/assets/images/volume tweezer.png',
  'Fiber Tip Tweezer': 'src/assets/images/fiber tip tweezer.png',
  'Lash Fan': 'src/assets/images/lash fan.png',
  'Glue Ring': 'src/assets/images/glue ring.png',
  'Curved Isolation Tweezer': 'src/assets/images/curvad isolation.png',
  'Lash Sealant': 'src/assets/images/lash sealant.png',
  'Glue Storage': 'src/assets/images/Glue Storage.png',
  'Mast P60 Machine': 'src/assets/images/P60.png',
  'One Battery Tattoo Machine Cover': 'src/assets/images/One BTM cover.png',
  'F&E Primary Cream': 'src/assets/images/FandE (1).png',
  'Golden Rose Anesthe': 'src/assets/images/GoldenRose.png',
  'Tag 45 Secondary Numb': 'src/assets/images/tag45.png',
  'Primary Numb Cream': 'src/assets/images/numb.png',
  'Mast Pro Cartridge 20pcs': 'src/assets/images/mastpro.png',
  'Mapping Strings': 'src/assets/images/mapping string.png',
  'Luxury Spa Body Oil': 'src/assets/images/Luxury spa body oil.png',
  'Herbal Bath Salt': 'src/assets/images/Herbal Bath salts.png',
  'Aromatherapy Candle': 'src/assets/images/Aromatherapy.png',
  'Green Tea Facial Mask': 'src/assets/images/green tea.png',
  'Exfoliating Body Scrub': 'src/assets/images/ExScrup.png',
  'Rose Quartz Facial Roll': 'src/assets/images/Rose QFR.png',
  'Clay Detox Mask': 'src/assets/images/clay detox.png',
  'Cooling Eye Gel Pad': 'src/assets/images/cooling eye.png',
  'Eucalyptus Shower Steamer': 'src/assets/images/Eucalyptus.png',
  'Coconut Milk Bath Soak': 'src/assets/images/coconut milk.png',
  'Luxury Foot Scrub': 'src/assets/images/Foot scrub.png',
  'Silk Sleep Mask': 'src/assets/images/Silk sleep.png',
  'Detox Herbal Tea Blend': 'src/assets/images/Detox.png',
  'Body Massage Balm': 'src/assets/images/message balm.png',
  'Hydrating Sheet Mask': 'src/assets/images/Hydrating sheet.png',
  'Luxury Spa Towel Set': 'src/assets/images/spa towel set.png',
  'Rose Infused Toner Mist': 'src/assets/images/rose.png',
  'Spa Incense Sticks': 'src/assets/images/spa incense.png',
  'Luxury Spa Gift Set': 'src/assets/images/luxury spa gift.png',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function request(method, urlStr, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
    };
    const req = lib.request({
      hostname: url.hostname, port: isHttps ? 443 : 80,
      path: url.pathname + url.search, method, headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
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

async function login() {
  console.log('🔐 Logging in...');
  const res = await request('POST', `${BASE_URL}/auth/login`, {
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD
  });
  if (!res.body?.token) throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  console.log('✅ Logged in\n');
  return res.body.token;
}

async function getProducts(token) {
  const res = await request('GET', `${BASE_URL}/products?limit=200`, null, token);
  return res.body?.data?.products || res.body?.data || [];
}

async function uploadImage(imagePath, token) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(imagePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`   ! File not found: ${fullPath}`);
      return resolve(null);
    }

    const form = new FormData();
    form.append('images', fs.createReadStream(fullPath));

    const url = new URL(UPLOAD_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            const imageUrl = json?.images?.[0]?.url || json?.data?.[0]?.url;
            resolve(imageUrl || null);
          } catch { resolve(null); }
        } else {
          console.error(`   ! Server rejected upload. Status: ${res.statusCode}`);
          console.error(`   ! Server response: ${data}`);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`   ! Request error: ${err.message}`);
      resolve(null);
    });

    form.pipe(req);
  });
}

async function updateProduct(productId, imageUrl, token) {
  return await request('PUT', `${BASE_URL}/products/${productId}`, {
    images: [{ url: imageUrl, alt: 'Product image' }]
  }, token);
}

async function main() {
  try {
    const token = await login();
    const products = await getProducts(token);
    console.log(`📦 Found ${products.length} products\n`);

    let success = 0, skipped = 0, failed = 0;

    for (const product of products) {
      if (product.images && product.images.length > 0 && product.images[0].url) {
        skipped++;
        continue;
      }

      const imagePath = IMAGE_MAP[product.name];
      if (!imagePath) {
        console.log(`❓ No image mapped for: ${product.name}`);
        skipped++;
        continue;
      }

      console.log(`⬆️  Uploading image for: ${product.name}...`);
      const imageUrl = await uploadImage(imagePath, token);

      if (!imageUrl) {
        console.log(`❌ Upload failed for: ${product.name}`);
        failed++;
        continue;
      }

      const updateRes = await updateProduct(product._id || product.id, imageUrl, token);
      if (updateRes.status === 200) {
        console.log(`✅ Updated: ${product.name}`);
        success++;
      } else {
        console.log(`❌ Update failed: ${product.name}`);
        failed++;
      }
      await sleep(500);
    }

    console.log('\n══════════════════════════════════');
    console.log(`✅ Success: ${success}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed:  ${failed}`);
    console.log('══════════════════════════════════');
  } catch (err) {
    console.error('💥 Fatal:', err.message);
  }
}

main();