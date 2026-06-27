# TaskBoard - Next.js Kanban Task Management Application

A premium, responsive Kanban Board application built with **Next.js**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **shadcn/ui**. It supports JWT-based user authentication, database-backed CRUD task actions, custom confirmation safety checks, modular input validation, centralized configuration control, and HTML5 drag-and-drop status columns.

---

## 🚀 Key Features

* **JWT Authentication**: Secure user session hydration using `HttpOnly` cookie-stored Access and Refresh tokens.
* **Kanban Board Layout**: Drag-and-drop tasks between **To Do**, **In Progress**, and **Completed** columns.
* **Refined Input Forms**: Real-time validation and character limits (`0/80` characters for titles, `0/500` characters for descriptions) inside professional shadcn-based selects and textareas.
* **Custom Confirmations**: Replaced native browser confirmation alerts with a clean, theme-compliant `DeleteConfirmDialog` modal.
* **Modern Design Aesthetics**: Seamless dark and light modes styled entirely with Tailwind CSS and semantic CSS theme variables.
* **Independent Scroll Areas**: Bounded viewport layout where columns scroll independently using custom scrollbar tracks.
* **Centralized Configuration**: All variables, token settings, and route rate limits are consolidated inside `lib/config.ts` for predictability and maintenance.
* **Modular Zod Validation**: Type-safe validation schemas separated by context (`lib/user/validation.ts` and `lib/tasks/validation.ts`) parsed before hitting service handlers.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 15+ (App Router) & React 19
* **Styling & UI**: Tailwind CSS, Radix UI Primitives, shadcn/ui components, Lucide Icons
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Authentication**: bcryptjs, jsonwebtoken (JWT)
* **Validation**: Zod
* **Development Environment**: Docker Compose

---

## 📦 Getting Started & Setup

Follow these steps to run the backend database first, configure environment variables, and start the Next.js development server.

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL database)

---

### Step 1: Run the Backend Database (Docker)

The project includes a `docker-compose.yml` file configuring a PostgreSQL database container and a pgAdmin administration console.

1. Open your terminal in the project root directory.
2. Spin up the database container in detached mode:
   ```bash
   docker compose up -d
   ```
3. This command will launch:
   * **PostgreSQL** database on port `5432`
   * **pgAdmin** management console on port `5050` (Login: `admin@admin.com` / Password: `admin`)

---

### Step 2: Configure Environment Variables

Create or update the `.env` file in the root of the project to match your PostgreSQL instance and token expirations (e.g. 15-minute access, 20-minute refresh):

```env
# Database Connection String (Docker Postgres Container)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_db?schema=public"

# JWT Token Secrets
JWT_ACCESS_SECRET="dev_access_secret_key_12345"
JWT_REFRESH_SECRET="dev_refresh_secret_key_67890"

# JWT Expirations (jsonwebtoken options)
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="20m"

# Cookie Max Age (in seconds)
JWT_ACCESS_MAX_AGE=900
JWT_REFRESH_MAX_AGE=1200
```

---

### Step 3: Install Dependencies

Install all the frontend and server dependencies specified in `package.json`:

```bash
npm install
```

---

### Step 4: Run Database Migrations

Use Prisma to push the database schema and synchronize your PostgreSQL database tables:

```bash
npx prisma db push
```

*(Optional: To run Prisma's visual studio client to view database records, run `npx prisma studio`)*

---

### Step 5: Start the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

---

## 🔄 Application User Flow & Walkthrough

Here is a step-by-step walkthrough of the expected user experience flow:

### 1. Account Signup (`/signup`)
* Users who don't have an account click **Sign up**.
* They input their email and password (minimum 6 characters, validated via `signupSchema`).
* Upon validation success, a positive indicator is shown and they are redirected to the Login page.

### 2. User Login (`/login`)
* Users enter their registered email and password credentials (validated via `loginSchema`).
* The backend generates secure Access (15m) and Refresh (20m) token tokens, setting them as secure `HttpOnly` session cookies.
* The client is authenticated and redirected to the `/dashboard`.

### 3. Task Management (CRUD)
* **Create Task**:
  * Click the **Create Task** button in the dashboard controls.
  * A dialog form opens, validating input limits (`0/80` for Title and `0/500` for Description).
  * On submit, requests are parsed via `createTaskSchema` at the server level.
* **Edit Task**:
  * Hover over any task card and click the action menu (`...` button).
  * Click **Edit Task** to load the task details into the dialog modal.
  * Modify title, description, or status, parsed via `updateTaskSchema` on submit.
* **Delete Task**:
  * Click **Delete Task** from the card action menu.
  * A professional confirmation dialog renders: *"Are you sure you want to delete this ticket or todo?"*.
  * Confirming deletes the task from the database.

### 4. Drag and Drop Status Update
* Grab any task card container.
* Drag it over to the desired status column (**To Do**, **In Progress**, or **Completed**).
* The target column animates with a dashed border overlay.
* Releasing the card triggers a PATCH request updates the task's status in the PostgreSQL database.
