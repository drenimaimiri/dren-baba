import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const number = process.argv[2];
if (!number) {
  console.error('Gabim: Ju lutemi shkruani numrin e telefonit.');
  console.error('Përdorimi: node scripts/create-qr.mjs +355XXXXXXXXX');
  process.exit(1);
}

const waUrl = `https://wa.me/${number}`;
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(waUrl)}`;

const qrDir = join(__dirname, '..', 'public', 'qr');
if (!existsSync(qrDir)) {
  mkdirSync(qrDir, { recursive: true });
}

const filename = `whatsapp-${number}.png`;
const filepath = join(qrDir, filename);

try {
  const response = await axios({
    method: 'GET',
    url: qrUrl,
    responseType: 'stream',
  });

  const writer = createWriteStream(filepath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.log(`QR Code u gjenerua me sukses!`);
  console.log(`Path: public/qr/${filename}`);
  console.log(`WhatsApp URL: ${waUrl}`);
} catch (error) {
  console.error('Gabim gjatë shkarkimit të QR Code:', error.message);
  process.exit(1);
}
