# TaskBoard - Next.js Kanban Task Management Application

A premium, responsive Kanban Board application built with **Next.js**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **shadcn/ui**. It supports JWT-based user authentication, database-backed CRUD task actions, custom confirmation safety checks, and HTML5 drag-and-drop status columns.

---

## 🚀 Key Features

* **JWT Authentication**: Secure user session hydration using `HttpOnly` cookie-stored Access and Refresh tokens.
* **Kanban Board Layout**: Drag-and-drop tasks between **To Do**, **In Progress**, and **Completed** columns.
* **Refined Input Forms**: Real-time validation and character limits (`0/80` characters for titles, `0/500` characters for descriptions) inside professional shadcn-based selects and textareas.
* **Custom Confirmations**: Replaced native browser confirmation alerts with a clean, theme-compliant `DeleteConfirmDialog` modal.
* **Modern Design Aesthetics**: Seamless dark and light modes styled entirely with Tailwind CSS and semantic CSS theme variables.
* **Independent Scroll Areas**: Bounded viewport layout where columns scroll independently using custom scrollbar tracks.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 15+ (App Router) & React 19
* **Styling & UI**: Tailwind CSS, Radix UI Primitives, shadcn/ui components, Lucide Icons
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Authentication**: bcryptjs, jsonwebtoken (JWT)
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

Create or update the `.env` file in the root of the project to match your PostgreSQL instance connection string:

```env
# Database Connection String (Docker Postgres Container)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_db?schema=public"

# Optional JWT Configuration (Defaults are set in the application if omitted)
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
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
* They input their email, password (minimum 6 characters), and confirm their password.
* Upon validation success, a positive indicator is shown and they are redirected to the Login page.

### 2. User Login (`/login`)
* Users enter their registered email and password credentials.
* The backend generates secure Access and Refresh token tokens, setting them as secure `HttpOnly` session cookies.
* The client is authenticated and redirected to the `/dashboard`.

### 3. Task Management (CRUD)
* **Create Task**:
  * Click the **Create Task** button in the dashboard controls.
  * A dialog form opens, validating input limits (`0/80` for Title and `0/500` for Description).
  * Select the starting status column (To Do, In Progress, Done) and click **Create**.
* **Edit Task**:
  * Hover over any task card and click the action menu (`...` button).
  * Click **Edit Task** to load the task details into the dialog modal.
  * Modify title, description, or status, then save changes.
* **Delete Task**:
  * Click **Delete Task** from the card action menu.
  * A professional confirmation dialog renders: *"Are you sure you want to delete this ticket or todo?"*.
  * Confirming deletes the task from the database.

### 4. Drag and Drop Status Update
* Grab any task card container.
* Drag it over to the desired status column (**To Do**, **In Progress**, or **Completed**).
* The target column animates with a dashed border overlay.
* Releasing the card triggers a PATCH request updates the task's status in the PostgreSQL database.
