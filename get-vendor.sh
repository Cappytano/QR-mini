#!/usr/bin/env bash
set -e
mkdir -p vendor
get(){ local u="$1"; local o="$2"; [ -f "$o" ] && return; curl -L "$u" -o "$o"; }
get https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js vendor/zxing.min.js
get https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.4/umd/index.min.js vendor/zxing-browser.min.js
get https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js vendor/jsQR.js
