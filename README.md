# Ticket Management System

A support-ticket management app built with **Laravel**, **Vue 3**, and **Inertia.js**. Customers can submit a support ticket — with screenshots and an optional order amount — without creating an account, track its status, and chat live with the support team. Admins get a full ticket dashboard with filtering, status workflow, and per-admin team management.

## 🎥 Demo Video

[Watch the demo on YouTube](YOUR_YOUTUBE_LINK_HERE)

## ✨ Features

**Public / customer side**
- Submit a support ticket — name, email, phone, optional order amount, problem description, and up to 5 screenshots
- Get a unique, shareable ticket ID (e.g. `TKT-20260925-4F9A2`) with no login required
- Track ticket status anytime from the confirmation page
- Live chat with the support team on the ticket (polling-based, updates every few seconds)
- Logged-in users also get a personal dashboard listing all their submitted tickets

**Admin side**
- Ticket dashboard with live counts (Total, Pending, Reserve, Successful, Taken)
- Search and filter by keyword, status, and date range; sort newest/oldest
- Slide-over ticket detail panel: view screenshots (with lightbox), full ticket info, one-click copy of ticket details
- Status workflow — Pending → Reserve → Successful, or Take the ticket to claim and self-assign it
- Live chat with the customer, right from the same panel
- Admin management page — add new admins, remove existing ones (with safeguards: an admin can't remove themself or the last remaining admin)

**Auth & security**
- Registration, login, and email verification via Laravel Fortify
- Profile and password management under Settings
- Admin-only routes protected by a dedicated `admin` middleware
- Public ticket-submission and chat endpoints are rate-limited against abuse

## 🛠 Tech Stack

- **Backend:** Laravel 13, Laravel Fortify (auth), Laravel Wayfinder (typed routes for the frontend)
- **Frontend:** Vue 3, Inertia.js, TypeScript
- **Styling / UI:** Tailwind CSS 4, shadcn-vue (reka-ui) components, Lucide icons
- **Database:** MySQL (SQLite for automated tests)

## 🚀 Getting Started

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+ and npm
- MySQL (or edit `.env` for another driver)

### Installation

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd ticket-management

# 2. Install PHP dependencies
composer install

# 3. Set up your environment
cp .env.example .env
php artisan key:generate

# 4. Configure your database in .env, then run migrations
php artisan migrate

# 5. Link storage (so uploaded screenshots resolve to public URLs)
php artisan storage:link

# 6. (Optional) Seed demo accounts and sample tickets
php artisan db:seed

# 7. Install JS dependencies
npm install

# 8. Start the dev servers (backend + queue + Vite)
composer run dev
```

The app will be available at the URL set in `APP_URL` (defaults to `http://localhost`).

### Demo accounts

If you run the seeders, these accounts are created for trying the app out:

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin1@example.com | admin123  |
| Admin | admin2@example.com | admin123  |
| Admin | admin3@example.com | admin123  |
| User  | user1@example.com  | user123   |
| User  | user2@example.com  | user123   |

> ⚠️ These are for local/demo use only — change or remove them before deploying anywhere public.

## 📁 Project Structure Highlights

```
app/Http/Controllers/Admin/     → Admin ticket & admin-management controllers
app/Http/Controllers/           → Public ticket controller
app/Models/                     → Ticket, TicketMessage, TicketScreenshot, User
app/Enums/TicketStatus.php      → Ticket status enum (pending/reserve/successful/taken)
routes/tickets.php              → Public ticket routes (submit, confirmation, chat)
routes/admin-tickets.php        → Admin ticket routes
routes/admin-users.php          → Admin management routes
resources/js/pages/tickets/     → Public ticket submission & confirmation pages
resources/js/pages/admin/       → Admin ticket dashboard & admin management pages
resources/js/components/tickets/→ Ticket UI: filters, detail sheet, chat thread, status badge
```

## 📄 License

Open-sourced under the [MIT license](LICENSE).

## 👤 Author

**Suborno Kundu (Sukh)**
- GitHub: [@SubornoKundu](https://github.com/SubornoKundu)
- LinkedIn: [linkedin.com/in/subornokundu](https://linkedin.com/in/subornokundu)
- Portfolio: [engr-suborno-kundu.netlify.app](https://engr-suborno-kundu.netlify.app)
