# RIPAC - Medical Resume & Patient Management System

RIPAC is a comprehensive web application for managing patient records and generating medical resumes (Patient Discharge Summaries). It automates the process of tracking patient history, vital signs, examinations, and doctor recommendations.

## 🚀 Key Features

*   **Patient Management**: Create, search, and manage detailed patient profiles.
*   **Medical Resumes (Registrations)**:
    *   Track patient admissions and discharges.
    *   Record comprehensive Medical History, Vital Signs, and Physical Examinations.
    *   Manage Treating Doctors and Recommendations (Fit to Fly, Repatriation, etc.).
    *   **Auto-generated PDFs**: Instantly generate and print official Medical Resume PDFs.
*   **Organization Support**: Multi-tenant architecture for managing different organizations/clinics.
*   **Doctor Management**: Manage list of doctors and assign them to patient cases.
*   **Interactive Dashboard**: Quick overview of patients, doctors, and recent registrations.

## 🛠 Tech Stack

*   **Framework**: [Nuxt 3](https://nuxt.com) (Vue 3)
*   **Styling**: [TailwindCSS](https://tailwindcss.com) & [DaisyUI](https://daisyui.com)
*   **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
*   **Authentication**: `nuxt-auth-utils`
*   **PDF Generation**: `jspdf` & `jspdf-autotable`
*   **Validation**: `zod`
*   **Icons**: `lucide-vue-next`

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ripac
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    # Database
    DATABASE_URL="postgres://user:password@localhost:5432/ripac_db"

    # Auth
    NUXT_SESSION_PASSWORD="complex-password-at-least-32-characters-long"
    ```

4.  **Database Migration**
    Apply the database schema:
    ```bash
    npm run db:push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 📦 Scripts

*   `npm run dev`: Start development server
*   `npm run build`: Build for production
*   `npm run db:push`: Push schema changes to database
*   `npm run db:studio`: Open Drizzle Studio to view data
