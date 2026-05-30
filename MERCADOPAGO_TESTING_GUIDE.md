# Mercado Pago Checkout Integration - Testing & Setup Guide

This guide explains how to install dependencies, run migrations, configure environment credentials, and test the newly implemented **Mercado Pago Payment Brick** checkout flow.

---

## 1. Setup & Dependencies

Because the model runner cannot execute shell commands directly on your system, you need to trigger the following installations and syncs manually:

### Frontend (Root Directory)
Install the React SDK for Mercado Pago:
```bash
npm install
```

### Backend (`/backend` Directory)
Install the Mercado Pago Node.js SDK and sync the Prisma schema:
```bash
cd backend
npm install
npm run prisma:push
```

---

## 2. Environment Variables Configuration

Make sure your environment variables are configured with your Mercado Pago Credentials:

### Backend Configuration (`/backend/.env`)
Add your Access Token:
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxx
```

### Frontend Configuration (`/.env` or `/.env.local`)
Add your Public Key and local Backend API URL:
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## 3. How to Run the Stack Locally

1. **Start the Database container:**
   ```bash
   docker compose up -d postgres
   ```
2. **Start the Frontend (from Root):**
   ```bash
   npm run dev
   ```
   *(Running at http://localhost:3000)*
3. **Start the Backend (from `/backend`):**
   ```bash
   npm run dev
   ```
   *(Running at http://localhost:4000/api)*

---

## 4. End-to-End Testing

### Step A: Render the Payment Brick
1. Visit the Shop and add items to your cart.
2. Navigate to the Checkout page.
3. Fill out the shipping form fields (**Full Identity**, **Email Address**, and **The Destination**).
4. Once all identity fields are filled, selecting **Mercado Pago** will render the Payment Brick.

### Step B: Using Test Cards
To test the card forms without charging a real card, use Mercado Pago's official test credentials:

- **Country**: Mexico (MXN)
- **Payer Email**: You can use any testing email or your own.
- **Test Cards**:
  | Card Issuer | Card Number | Expiration Date | Security Code (CVV) | Cardholder Name |
  | :--- | :--- | :--- | :--- | :--- |
  | **Visa (MX)** | `4075 5957 1648 3764` | Any future date (e.g., `12/28`) | `123` | `APRO` (for Approved) or `CONT` (for Pending) or `OTHE` (for Rejected) |
  | **Mastercard (MX)** | `5474 9254 3267 0366` | Any future date | `123` | `APRO` |

*Refer to the official [Mercado Pago Test Cards List](https://www.mercadopago.com.mx/developers/es/docs/checkout-bricks/payment-brick/integration-test/test-cards) for more mock cards.*

---

## 5. Webhook Testing

The webhook endpoint is exposed at:
`POST /api/webhooks/mercadopago`

### Local testing via Ngrok
Since Mercado Pago sends webhooks from their servers to yours, you need a public tunnel (like `ngrok`) to test the webhook locally:

1. Expose your NestJS backend (port 4000) using ngrok:
   ```bash
   ngrok http 4000
   ```
2. Copy the forwarding URL (e.g., `https://your-tunnel.ngrok-free.app`).
3. Set your Mercado Pago application webhook URL in your Mercado Pago Developer Dashboard under **Webhooks** to:
   `https://your-tunnel.ngrok-free.app/api/webhooks/mercadopago`
4. Register the webhook event for **Payments** (`payment`).
