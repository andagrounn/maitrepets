# ArtifyAI — Pet Portrait Generator

AI-powered SaaS + eCommerce app. Upload your pet's photo, generate stunning artwork, order a canvas print.

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Zustand
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) via Prisma
- **Auth**: JWT (httpOnly cookies)
- **AI**: Replicate (Stable Diffusion img2img)
- **Storage**: AWS S3
- **Payments**: Stripe Checkout
- **Print-on-Demand**: Printful API

## Quick Start

```bash
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

Visit http://localhost:3000

## Demo Account
demo@artifyai.com / password123

## Art Styles
- Oil Painting
- Watercolor
- Cartoon
- Pencil Sketch
- Renaissance

## Products
| Product | Price |
|---------|-------|
| 12x12 Canvas | $59.99 |
| 16x20 Canvas | $79.99 |
| 18x24 Canvas | $99.99 |
| 18x24 Poster | $39.99 |

## Demo Mode
Without real API keys, the app runs in demo mode:
- AI generation returns sample dog photos
- Stripe checkout redirects to success page directly
- S3 upload uses placeholder URLs

## Environment Variables
```
DATABASE_URL=file:./dev.db
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=
REPLICATE_API_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PRINTFUL_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BASE_URL=http://localhost:3000
```

## To Add Real APIs
1. **Replicate**: Get token at replicate.com, update REPLICATE_API_TOKEN
2. **AWS S3**: Create bucket, update AWS_* vars
3. **Stripe**: Get keys at stripe.com, update STRIPE_* vars
4. **Printful**: Get API key at printful.com, update PRINTFUL_API_KEY
