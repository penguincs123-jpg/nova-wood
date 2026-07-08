# Nova Wood — Premium Furniture E-commerce Platform

Nova Wood is a complete, production-ready, high-performance furniture e-commerce platform designed to match the quality and premium design standards of industry leaders like IKEA and Home Centre. Built inside a monorepo workspace architecture with TypeScript.

---

## 🏗️ Architecture & Stack

### Packages & Applications
*   `packages/types`: Shared TypeScript interfaces, types and schemas.
*   `packages/config`: Common ESLint, Prettier, and compiler options.
*   `apps/backend`: Express.js REST API using Prisma ORM (MySQL), Redis (caching), helmet/rateLimit (security), and swagger-ui (API docs).
*   `apps/frontend`: Storefront web application built with Next.js 14 App Router, Outfit & Cairo fonts, Vanilla CSS, and dynamic settings color theme injections.
*   `apps/admin`: Administrative Control Panel built with Next.js 14 App Router featuring a premium dark glassmorphism dashboard, orders tracker, products CRUD catalog, settings modifier, reviews moderator, and media assets manager.

---

## 🛠️ Getting Started & Installation

### Prerequisites
1.  **Node.js** (v18 or higher recommended)
2.  **pnpm** (workspaces manager)
3.  **MySQL Database** (configured on port 3306)
4.  **Redis** (optional, fallback caching is disabled gracefully if offline)

### Setup & Migrations
1.  Clone the repository and install workspace dependencies:
    ```bash
    pnpm install
    ```
2.  Configure your environment parameters. Create `.env` files matching `.env.example` configurations.
3.  Push the relational database schema to your local MySQL instance:
    ```bash
    pnpm prisma db push
    ```
4.  Seed the database with root categories, 25 dynamic website settings, default Egyptian zones, and admin credentials:
    ```bash
    pnpm prisma:seed
    ```

---

## 🚀 Running the Development Servers

Use the following commands inside the workspace root:

*   **Start Backend REST API** (Port 4000):
    ```bash
    pnpm dev:backend
    ```
*   **Start Storefront Frontend** (Port 3000):
    ```bash
    pnpm dev:frontend
    ```
*   **Start Admin Control Panel** (Port 3001):
    ```bash
    pnpm dev:admin
    ```

---

## 🌍 URL Routing Directory

### Storefront Webpages (Port 3000)
*   `/` — Landing page (dynamic hero sliders, root category grids, features)
*   `/products` — Catalog directories with category filtering and sorting links
*   `/products/[slug]` — Product detail page (image gallery, features list, reviews)
*   `/cart` — Cart drawer (quantity selectors, coupon inputs, price subtotaling)
*   `/checkout` — Shipping forms checkout and payment gateway methods
*   `/account` — Customer profile, address book, and order logs history
*   `/pages/[slug]` — Dynamic informational CMS articles (About Us, FAQ, Privacy, Terms)

### Administrative Panel (Port 3001)
*   `/` — Analytical metrics grid, recent order logs, low-stock warnings
*   `/products` — Products directories CRUD lists
*   `/categories` — Categories nested hierarchies manager
*   `/orders` — System transactions shipments coordinator
*   `/users` — Accounts directory roles manager (Customer, Admin, Superadmin)
*   `/reviews` — Reviews verification moderation queue
*   `/cms` — Dynamic information pages draft manager
*   `/settings` — Real-time primary color customizers, WhatsApp configurations, and shipping charges modifier
*   `/media` — WebP/AVIF media library managers

### Backend API Resources (Port 4000)
*   `/health` — Health check statuses
*   `/docs` — Interactive Swagger API documentation
