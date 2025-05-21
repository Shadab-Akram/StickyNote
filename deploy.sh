#!/bin/bash

# Clean install dependencies
npm ci

# Run type check
npm run check

# Build the project
npm run build

# Deploy to Vercel (if vercel CLI is installed)
vercel --prod 