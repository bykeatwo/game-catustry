# 💻 DEVELOPMENT Guide — Coding Rules & Workflow

> **For AI Agents**: Load this document for daily coding tasks, architecture compliance, and best practices.

---

## 🧱 Architecture: Layered Clean/MVVM

### Strict Dependency Rule
```
Presentation  →  Domain  ←  Data
   (UI/VM)     (Pure Logic)   (Repo/Storage)
```
- **Inner layers NEVER import from outer layers**
- Domain has **zero external dependencies** (no React, no Next.js, no APIs)

### Layer Responsibilities

| Layer | Location | What Goes Here | Dependencies |
|---|---|---|---|
| **Presentation** | `features/*/presentation/`, `app/`, `components/` | UI components, pages, ViewModels, state | Domain layer only |
| **Domain** | `domain/`, `features/*/domain/` | Entities, Use Cases, Repository Interfaces, Types | **NONE** — pure TypeScript |
| **Data** | `data/`, `features/*/data/` | Repository implementations, API clients, storage | Domain layer only |

---

## 📁 Folder Structure

### Feature-Based Organization (Recommended)
```
features/todo/
├── domain/
│   ├── entity.ts              # Pure data + validation
│   ├── use-cases.ts           # Single-purpose business logic
│   └── repo-interface.ts      # Abstract contract
├── data/
│   └── repo-impl.ts           # Implements domain interface
└── presentation/
    ├── page.tsx               # Next.js page
    ├── view-model.ts          # State + handlers
    └── components/            # Feature-specific UI
```

### Shared Infrastructure
```
shared/
├── ui/                        # Generic UI primitives
├── utils/                     # Helpers, formatters
├── capacitor-plugins/         # Native API wrappers
└── types/                     # Global TypeScript types
```

---

## 🎯 Coding Best Practices

### TypeScript
- **Strict mode enabled** (`strict: true` in `tsconfig.json`)
- Define interfaces at domain boundaries
- Use DTOs for cross-layer communication — never leak internal models
- Zod for input validation at layer boundaries

### State Management (MVVM)
```typescript
// ViewModel = pure state + handlers, no React hooks
export class TodoViewModel {
  private todos = new Map<string, Todo>();
  private listeners = new Set<() => void>();

  constructor(private getTodosUseCase: GetTodosUseCase) {}

  async loadTodos() {
    const todos = await this.getTodosUseCase.execute();
    todos.forEach(t => this.todos.set(t.id, t));
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() { this.listeners.forEach(l => l()); }
}
```

- **Unidirectional flow**: View → ViewModel → UseCase → Repository
- **Optimistic UI**: Update local first, reconcile after confirmation
- **Single source of truth**: One repository per entity type

### Next.js Specific
- Use `"use client"` for components needing browser APIs
- Server components for static content; client components for interactivity
- Detect platform: `const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor;`
- **Never put secrets in `NEXT_PUBLIC_*`** variables

### P2P / WebRTC
- Signaling = minimal WebSocket (offer/answer/candidates only)
- App data = WebRTC DataChannels (SCTP, binary)
- Mesh topology for ≤ 4 peers; plan SFU for larger groups
- CRDTs for state sync — broadcast operations, not full state
- Pre-gather ICE candidates during lobby/onboarding

### Offline-First
- All writes → local storage first → sync background when online
- Queue pending operations with auto-retry on reconnection
- Conflict resolution: last-write-wins (timestamp) for simple data; CRDTs for collaborative
- Capacitor Network plugin for connectivity awareness

---

## 🔒 Security Rules

| Rule | Enforcement |
|---|---|
| No secrets in client bundle | Code review + never use `NEXT_PUBLIC_` for sensitive data |
| Server-side proxy for API keys | Next.js API routes as secure middleman |
| Secure storage on device | Capacitor Keychain/Keystore plugins for tokens |
| HTTPS + WSS everywhere | No mixed content |
| Input validation | Zod at all boundaries |
| Route protection | Middleware + auth checks on protected routes |

---

## 🧪 Testing Strategy (Test Pyramid)

| Layer | Type | Tools | Coverage Goal |
|---|---|---|---|
| Domain | Unit tests | Vitest / Jest | 80%+ |
| Data | Integration tests | Vitest + mock APIs | 60%+ |
| Presentation | Component tests | React Testing Library | 40% critical paths |
| Full App | E2E smoke tests | Playwright | Happy paths only |

**Run tests**: `npm test`

---

## 🔧 Platform Detection & Capacitor Plugins

### Safe Platform Check
```typescript
// shared/utils/platform.ts
export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).Capacitor !== 'undefined';
};

export const isWeb = (): boolean => !isCapacitor();
```

### Adding Native Plugins
```bash
# Install
npm install @capacitor/camera

# Sync after every plugin add
npx cap sync android
```

**Rule**: Wrap all native plugin calls behind domain interfaces so UI remains platform-agnostic.

---

## 📝 Daily Development Workflow

```
1. git pull origin main           ← Sync latest
2. npm run dev                    ← Start dev server
3. Code → test in browser         ← Iterate
4. npm run build                  ← Verify static export
5. npx cap sync android           ← Verify Capacitor sync
6. git add / commit / push        ← Trigger cloud APK build
7. Download APK from GitHub       ← Install & test on device
```

---

## 📌 Version Control

- **Branch strategy**: `main` = stable, `feature/*` = work in progress
- **Commit messages**: `type(scope): description`
  - `feat(todo): add offline queue`
  - `fix(p2p): handle ICE candidate timeout`
  - `chore(build): bump capacitor to 8.1`
- **PRs required** for main branch protection (enable in GitHub settings)

---

## 📌 Next Steps

- Ready to ship? Load **`docs/DEPLOYMENT.md`**
- Something broken? Load **`docs/TROUBLESHOOTING.md`**
- Need architecture context? Load **`docs/ARCHITECTURE.md`**
