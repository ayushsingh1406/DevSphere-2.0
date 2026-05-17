# 🌐 DevSphere — Developer Growth Intelligence Platform

DevSphere is a premium, full-stack developer growth analytics platform designed to gamify, track, and optimize the engineering narrative. It combines a highly responsive, earthy glassmorphic user interface with deep backend metrics, tracking practice consistency, engineering depth, repository integrations, and competitive rankings.

---

## ✨ Features & Architecture

### 📊 Developer Growth Dashboard
*   **Engineering Workspace:** Dynamically track skills, categorize them, and record practice hours.
*   **Dynamic Skill Progression:** Auto-calculates your proficiency tier based on logged hours:
    *   **0 – 50 Hours:** Beginner 🟢
    *   **51 – 150 Hours:** Intermediate 🟡
    *   **151+ Hours:** Advanced 🔴
    *   *Features an advanced progress bar targeting 200 hours for total skill mastery.*
*   **Interactive Rapid Adjustment:** Click or long-press (press and hold) the `+` or `-` buttons on skill cards for instant, high-speed time tracking (accelerates dynamically to 80ms updates). Uses smart debouncing to sync to the server after you stop pressing.
*   **Optimistic Project Workspace:** Interactive portfolio management with real-time starred status. Updates instantly in the UI with silent, background synchronization to eliminate skeleton screens or loading flickers.
*   **Duplicate Repo Prevention:** Smart validations on both client and backend levels block importing the same GitHub repository multiple times unless the active project is deleted.

### 🔥 Momentum & Achievements
*   **Strict Daily Streaks:** Features a gapless momentum algorithm. If a day goes silent (no logged activity), your streak dynamically resets to `0` upon your next visit, forcing true consistency. Once you log an activity, a fresh streak of `1` is initiated.
*   **Leaderboard Engine:** Rank against peers in Global, Weekly, and Streak leaderboards using a logarithmic diminishing-return Depth Score algorithm.
*   **Premium Badge Gallery:** Unlock, inspect, and showcase highly stylized badges like *Speed Demon*, *Consistency Master*, and *Trophy Bearer* on your profile.

### 🖼️ Profile & Avatar Personalization
*   **High-Fidelity Crop System:** Integrated with `react-easy-crop` to provide an interactive modal for avatar adjustment. Supports dynamic zooming, smooth rotation, and custom-styled range inputs over a circular crop preview prior to upload.

---

## 🛠️ Technology Stack

### Backend
*   **Framework:** Django & Django REST Framework (DRF)
*   **Database:** PostgreSQL (Production) / SQLite (Local testing)
*   **Telemetry Services:** Logarithmic Depth Score & Strict Streak tracking engines.

### Frontend
*   **Core:** React 19 (Vite)
*   **Styling:** Earthy-toned glassmorphism palette built with custom vanilla CSS and Tailwind CSS.
*   **Libraries:** `react-easy-crop` (Interactive cropping), `lucide-react` (Premium icons), `recharts` (Visual heatmaps and curves).

---

## 📦 Containerization & Orchestration

DevSphere is fully dockerized with production-ready, minimal Alpine builds. The multi-container orchestration is set up via **Docker Compose**:

*   **Backend Container:** Runs the Django REST application exposing port `8000`.
*   **Frontend Container:** Serves the compiled production React assets through a customized **Nginx Alpine server** with SPA routing fallback (`try_files`) on port `3000`.

---

## 🚀 Quick Start & Deployment

### 🐳 Run using Docker Compose (Recommended)
1.  Ensure you have **Docker** and **Docker Compose** installed.
2.  Clone the repository and navigate to the project root.
3.  **Configure Database Host for Docker:**
    Open `/backend/.env` and update the database host so the container can communicate with the PostgreSQL engine running on your host machine:
    ```ini
    DB_HOST=host.docker.internal
    ```
4.  Build and boot up the containers:
    ```bash
    docker-compose up --build
    ```
5.  Open your browser and visit:
    *   **Frontend:** `http://localhost:3000`
    *   **Backend API:** `http://localhost:8000`

> [!NOTE]
> When executing the Django application directly in your host's local command line rather than in Docker, remember to keep `DB_HOST=localhost` in your `.env` file instead.

### 💻 Run Locally (Manual Setup)

#### 1. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run database migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```

#### 2. Frontend Setup
1.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch the Vite development server:
    ```bash
    npm run dev
    ```
4.  Visit `http://localhost:5173` to see your running instance.

---

## 🔒 Security & Safe Pushing to GitHub

We enforce a comprehensive, top-tier [.gitignore](file:///.gitignore) that shields sensitive files and credentials from accidental publication.

### ⚠️ IMPORTANT: Environment Variables
*   **NEVER** commit your `.env` or `db.sqlite3` files.
*   Ensure that any secret key, GitHub Personal Access Token (`GITHUB_TOKEN`), or database credentials exist only inside your local `/backend/.env` file. This file is strictly excluded by git.
*   A template environment file is provided at `/backend/.env.example` to let developers set up their instances easily.

### 📤 Step-by-Step GitHub Publish Instructions
Follow these commands to securely push your project to a clean, empty GitHub repository:

1.  Initialize git (if not already done):
    ```bash
    git init
    ```
2.  Stage all files (VCS will respect the robust [.gitignore](file:///.gitignore)):
    ```bash
    git add .
    ```
3.  Verify that **NO** `.env` or `db.sqlite3` files are staged:
    ```bash
    git status
    ```
4.  Commit the changes:
    ```bash
    git commit -m "feat: complete devsphere workspace, dynamic skills, optimistic ui, interactive cropping, and robust streaks"
    ```
5.  Link your empty GitHub remote:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    ```
6.  Rename your primary branch to main:
    ```bash
    git branch -M main
    ```
7.  Push your code to GitHub:
    ```bash
    git push -u origin main
    ```