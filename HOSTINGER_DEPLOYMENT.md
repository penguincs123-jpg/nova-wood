# 🚀 Production Deployment Guide for Hostinger Node.js

This guide explains the step-by-step production deployment process for the **Nova Wood** monorepo on **Hostinger Business Web Hosting** with Node.js features.

---

## 🌐 1. Subdomain Topology

Hostinger runs single Node.js processes per virtual host root. To deploy the storefront, admin, and backend API concurrently, configure three routing targets:

| Application | URL | Hostinger Domain Type |
| :--- | :--- | :--- |
| **Storefront App (Next.js)** | `https://novawoodeg.com` | Main Domain |
| **Admin Panel (Next.js)** | `https://admin.novawoodeg.com` | Addon Domain / Subdomain |
| **REST API Server (Express)** | `https://api.novawoodeg.com` | Addon Domain / Subdomain |

---

## 🔧 2. Hostinger hPanel Node.js Setup

For **each** of the three domains/subdomains above:
1. Log in to your Hostinger hPanel dashboard.
2. Go to **Advanced** ➜ **Node.js**.
3. Select the target domain (e.g. `api.novawoodeg.com`).
4. Click **Enable Node.js** if not already enabled.
5. Set the Node.js version to **20.x** or higher.
6. Set the application entry point path:
   * **REST API**: `apps/backend/dist/server.js`
   * **Storefront**: `apps/frontend/server.js` (produced by Next.js standalone build)
   * **Admin Panel**: `apps/admin/server.js` (produced by Next.js standalone build)

---

## 📁 3. Directory Layout & Uploading Files

Compress the project folder into a `.zip` archive, excluding `node_modules` and files matched by `.gitignore` (such as local `.env` configs):

```bash
# Create deployment package
zip -r nova-wood-deploy.zip . -x "**/node_modules/*" "**/.next/*" "**/dist/*" "prisma/dev.db*"
```

Upload this `.zip` to Hostinger using the hPanel **File Manager** or secure FTP (SFTP), and extract it directly into the public directory of your hosting root (e.g. `public_html/`).

---

## 🔐 4. Environment Variables Configuration

In each directory:
1. Copy `.env.production.example` to `.env`.
2. Update the environment credentials:
   * Set `NODE_ENV=production`.
   * Set the database URL `DATABASE_URL` pointing to your Hostinger MySQL database instance.
   * Generate safe JWT cryptographic keys using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
   * Set proper CORS origins matching the URLs layout.

---

## 🗄️ 5. Database Schema & Seeding

Since MySQL runs on your Hostinger database server:
1. From the hPanel File Manager, open a terminal or run a cron/SSH command to execute Prisma migrations:
   ```bash
   pnpm prisma db push
   ```
2. Populate the database configurations and admin user:
   ```bash
   pnpm prisma:seed
   ```

---

## 🏗️ 6. Build Commands (Standalone Next.js)

To run Next.js on Hostinger, use the **Next.js Standalone Build** feature to optimize RAM usage:
1. Ensure `next.config.mjs` has `output: 'standalone'` enabled.
2. Run the production build command inside the terminal or during deployment:
   ```bash
   pnpm build:all
   ```
3. Copy static asset files to their correct public directories so Hostinger's Nginx/Apache serves them fast:
   * **Storefront**: Copy `apps/frontend/.next/static` to `apps/frontend/.next/standalone/apps/frontend/.next/static` and `apps/frontend/public` to `apps/frontend/.next/standalone/apps/frontend/public`.
   * **Admin**: Repeat the same copy steps inside `apps/admin/`.

---

## 🔏 7. Folder & Upload Permissions

Upload folders require read-write permission settings:
1. Navigate to hPanel **File Manager**.
2. Locate the uploads directory inside the REST API package: `apps/backend/uploads`.
3. Right-click, select **Permissions**, and set it to **755** (Owner: Read/Write/Execute, Group: Read/Execute, Others: Read/Execute).

---

## 🔄 8. Database Backups

Use the database backup and restore script on your server inside the root folder:
* **Perform Backup**:
  ```bash
  bash scripts/db-backup.sh backup
  ```
* **Restore Backup**:
  ```bash
  bash scripts/db-backup.sh restore backups/backup_filename.sql.gz
  ```
