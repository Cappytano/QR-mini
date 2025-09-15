QR-Reader v6.0.2 — PATCH NOTES

What was fixed:
1) CDN script error: “Unexpected token 'export'” from qr-scanner.min.js
   - Root cause: ESM build was loaded with a classic <script> tag.
   - Fix: Switched to the UMD build and set the worker path explicitly:
     <script src="https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.umd.min.js"></script>
     <script>QrScanner.WORKER_PATH = "https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js";</script>

2) Photo snapshot missing in log rows
   - Root cause: the decode handler did not capture the current video frame (or failed before reaching it).
   - Fix: Added robust capturePhoto() that draws the <video> into a hidden <canvas> and stores a JPEG (or PNG fallback) data URL.
   - onDecode() now captures a photo immediately and includes it in the logged row.

How to deploy:
- Drop these files into your v6.0.2 site (back up originals first).
- Ensure you have an icons/icon-192.png (for the favicon link in <head>).
- Open the page over HTTPS (or localhost). Use the Request Permission, choose a camera, and Start.
- Scan a QR code; a new row should appear with a photo thumbnail.
