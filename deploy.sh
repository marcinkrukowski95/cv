#!/bin/bash
# Deploy script: pull latest code, install deps, build, restart
set -e

cd ~/domains/cv.ergotree.pl/public_nodejs

echo ">> Pulling latest code..."
git pull origin main

echo ">> Installing dependencies..."
npm install --production=false

echo ">> Building..."
npm run build

echo ">> Restarting app..."
devil www restart cv.ergotree.pl

echo ">> Done! App is live at https://cv.ergotree.pl"
