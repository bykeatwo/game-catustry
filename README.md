# Next.js + Capacitor Android App — Project Guideline

> **For AI Agents**: This is your entry point. Read this file first to understand the project structure, then load ONLY the specific guide document you need for your current task.

---

## 📋 Quick Reference

| Aspect | Details |
|---|---|
| **Architecture** | Next.js (App Router) + Capacitor (Android runtime) + Clean/MVVM layers |
| **Build Strategy** | Code in Termux → push to GitHub → GitHub Actions builds APK in cloud |
| **Target** | Android APK (web + mobile from single codebase) |
| **Key Features** | P2P/WebRTC capable, offline-ready, single codebase |

---

## 📚 Documentation Map

**Load these files based on your current task:**

| Task | Document to Load |
|---|---|
| 🏗️ **New project setup**, installing dependencies, configuring Capacitor | `docs/SETUP.md` |
| 💻 **Coding**, architecture rules, folder structure, state management, best practices | `docs/DEVELOPMENT.md` |
| 🚀 **Building APK**, GitHub Actions, release, Play Store, version updates | `docs/DEPLOYMENT.md` |
| 🔧 **Fixing problems**, build errors, common issues | `docs/TROUBLESHOOTING.md` |
| 🧠 **Architecture decisions**, why this stack, layer boundaries | `docs/ARCHITECTURE.md` |

---

## 🚦 Workflow Overview

```
1. SETUP      → docs/SETUP.md      (run once per machine/project)
2. DEVELOP    → docs/DEVELOPMENT.md (daily coding)
3. DEPLOY     → docs/DEPLOYMENT.md  (when shipping)
4. TROUBLESHOOT → docs/TROUBLESHOOTING.md (when broken)
```

---

## ⚡ Quick Start (5 commands)

```bash
# 1. Install deps
npm install

# 2. Run web dev server
npm run dev

# 3. Build static export
npm run build

# 4. Sync to Capacitor
npx cap sync android

# 5. Push to trigger cloud APK build
git push origin main
```

> **For full details on any step, load the corresponding document from `docs/`.**

---

## 📁 Project Structure

```
your-app/
├── README.md                    ← YOU ARE HERE (entry point)
├── docs/
│   ├── SETUP.md                 ← Full setup guide
│   ├── DEVELOPMENT.md           ← Coding rules & practices
│   ├── DEPLOYMENT.md            ← Build & release process
│   ├── TROUBLESHOOTING.md       ← Problem solving
│   └── ARCHITECTURE.md          ← Architecture decisions
├── app/                         ← Next.js App Router routes
├── components/                  ← Shared UI components
├── features/                    ← Feature modules (domain + data + presentation)
├── domain/                      ← Pure business logic (zero external deps)
├── data/                        ← Repositories, APIs, storage
├── lib/                         ← Shared utilities
├── public/                      ← Static assets
├── android/                     ← Capacitor native project (auto-generated)
├── capacitor.config.ts          ← Capacitor configuration
├── next.config.js               ← Next.js config (static export enabled)
└── .github/workflows/build-apk.yml  ← Cloud APK builder
```
