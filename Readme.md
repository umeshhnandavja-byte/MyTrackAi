```markdown
# MyTrack 🚀

A modern, high-performance productivity and habit-tracking dashboard built to help developers, creators, and high-achievers take absolute control of their routines, streaks, and long-term goals. Built for the modern web with Next.js, Tailwind CSS, and Framer Motion.

---

## ✨ Features

- **Performance Radar Map:** Visualize category balance and progress dynamically driven by completed tasks and XP.
- **Streak Tracking:** Visual streak indicators and completion feedback to maintain daily momentum.
- **Adaptive Task Management:** Organize routines by cadence (Daily, Weekly, Monthly, Yearly) and categories.
- **Planning Board & Detective View:** Dedicated milestone planning and strategy space.
- **To-Do System & CodeSync:** Fast task capture and DSA problem journey management.
- **Integrated Focus Timer:** Built-in timer with header status badge for deep work sessions.
- **AI Command Center:** Natural language input modal for quick task creation (`⌘ K`).
- **In-App About & Terms:** Native informational and compliance views embedded right inside the dashboard navigation.
- **Responsive & Dynamic Theme Support:** Adaptive light/dark palette with custom SVG favicon and component branding.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14/15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **UI Components & Icons:** Radix UI primitives, Lucide React
- **Animations:** Framer Motion
- **State Management:** Custom reactive stores (Zustand / local stores)
- **Package Manager:** pnpm

---

## 📁 Project Structure

```text
├── app/
│   ├── favicon.ico
│   ├── icon.svg               # Adaptive browser favicon
│   ├── layout.tsx             # Root app layout
│   ├── page.tsx               # Main Dashboard page
│   ├── about/                 # Standalone About route
│   │   └── page.tsx
│   └── terms/                 # Standalone Terms & Conditions route
│       └── page.tsx
├── components/
│   ├── logo.tsx               # Reusable branded SVG icon
│   ├── add-task-dialog.tsx
│   ├── analytics-view.tsx
│   ├── command-center.tsx
│   ├── custom-timer.tsx
│   ├── detective-board.tsx
│   ├── functional-calendar.tsx
│   ├── productivity-views.tsx
│   ├── settings-panels.tsx
│   ├── sign-in-dialog.tsx
│   ├── sign-up-dialog.tsx
│   ├── tasks-view.tsx
│   ├── timer-badge.tsx
│   └── upcoming-contests.tsx
├── lib/
│   ├── board-store.ts
│   ├── category-store.ts
│   ├── map-settings-store.ts
│   ├── profile-store.ts
│   ├── task-store.ts
│   ├── timer-store.ts
│   ├── todo-store.ts
│   └── utils.ts
├── public/
├── tailwind.config.js
├── tsconfig.json
└── package.json

```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18.17+ or v20+) and `pnpm` installed:

```bash
node -v
pnpm -v

```

If you do not have `pnpm` installed:

```bash
npm install -g pnpm

```

### Installation

1. **Clone the repository:**
```bash
git clone [https://github.com/your-username/mytrack.git](https://github.com/your-username/mytrack.git)
cd mytrack

```


2. **Install dependencies:**
```bash
pnpm install

```


3. **Set up Environment Variables (if using auth/backend):**
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local

```


4. **Start the local development server:**
```bash
pnpm dev

```


5. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the local development server on port 3000 |
| `pnpm build` | Builds the optimized production build |
| `pnpm start` | Runs the compiled production server |
| `pnpm lint` | Runs ESLint to check for code issues |

---

## 🚢 Deployment (Vercel)

1. Push your code to your GitHub repository:
```bash
git add .
git commit -m "feat: complete MyTrack dashboard"
git push origin main

```


2. Import the project into [Vercel](https://vercel.com).
3. If you run into strict dependency checks during Vercel builds, add this custom Install Command in your Vercel Project Settings (`Settings > General > Build & Development Settings`):
```bash
pnpm install --no-frozen-lockfile

```


4. Click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

```

```