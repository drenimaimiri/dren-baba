---
description: Krijo një QR kod për WhatsApp me numrin e telefonit të dhënë
---

# Krijo QR Code-in për WhatsApp

Merr numrin e telefonit nga argumenti (pa hapësira, me prefix vendor, p.sh. +355XXXXXXXXX) dhe gjenero një QR kod që çon në `https://wa.me/{numri}`.

1. Përdor `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://wa.me/{numri}` për të gjeneruar QR kodin.
2. Shkarko imazhin dhe ruaje në dosjen `public/qr/` me emrin `whatsapp-{numri}.png`.
3. Shfaq një mesazh konfirmimi me path-in e imazhit.

Shembull:
- Input: `create-qr +355691234567`
- Output: QR kod që çon në `https://wa.me/+355691234567`
