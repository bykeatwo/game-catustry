# 🧠 ARCHITECTURE Guide — Design Decisions

> **For AI Agents**: Load this document to understand WHY the stack is structured this way. Reference when making architectural decisions or refactoring.

---

## 🎯 Core Design Principles

### 1. **Single Codebase Priority**
> One Next.js repo → web + Android. Minimize learning, maximize reuse.

**Rationale**: Solo developer efficiency. Your React/Next.js skills produce both web and mobile outputs.

### 2. **Cloud Build, Local Code**
> Code anywhere (Termux/phone/laptop). Build in the cloud.

**Rationale**: Android SDK/Gradle toolchain is x86_64-native and memory-heavy. ARM Termux builds are unreliable and slow. GitHub Actions provides consistent, fast, free builds.

### 3. **Clean Architecture — Inward Dependencies Only**
> Domain logic is pure and framework-agnostic.

**Rationale**: 
- Test business logic without browser/emulator
- Swap UI frameworks without touching business rules
- Swap data sources (local/remote/P2P) independently
- Future-proof against framework churn

### 4. **Offline-First, P2P-Capable**
> Local writes first. Sync background. Direct peer connections when possible.

**Rationale**: Mobile networks are unreliable. P2P eliminates server costs and single points of failure.

### 5. **Minimize Native Code**
> Use Capacitor plugins; write native only when necessary.

**Rationale**: Native code (Kotlin/Swift) doubles maintenance burden. Capacitor's WebView + plugin system covers 95% of use cases.

---

## 🏗️ Stack Selection Rationale

### Why **Next.js** (not plain React / Vue / Svelte)?
- ✅ App Router = modern, file-based routing
- ✅ Static export (`output: 'export'`) = perfect for WebView packaging
- ✅ Rich ecosystem, TypeScript-first, great DX
- ✅ Server components + client components = optimal performance
- ✅ Industry standard → hireable skills, abundant tutorials

### Why **Capacitor** (not Flutter / React Native / Cordova / MIT App Inventor)?
| Factor | Capacitor Wins Because |
|---|---|
| **Code reuse** | 95–100% of Next.js code = mobile app |
| **Learning** | Zero new language (no Dart, no Swift) |
| **Community** | 16.4K stars, Ionic company-backed, capacitor-community plugins |
| **P2P/WebRTC** | Full browser API access — works natively |
| **Maintenance** | `npx cap migrate` automated, ~1 major/year |
| **Future-proof** | Follows Google's target SDK requirements |

### Why **GitHub Actions** (not local Termux build)?
- ✅ **x86_64 environment** = Android SDK/Gradle work perfectly
- ✅ **Consistent builds** — no "works on my machine"
- ✅ **Free tier** — 2,000 minutes/month = plenty for solo dev
- ✅ **Phone battery/RAM preserved** — heavy lifting offloaded
- ✅ **Automated** — `git push` = APK built

### Why NOT the alternatives?
- **Flutter**: Requires Dart + full rewrite. 2x maintenance. P2P needs plugins.
- **MIT App Inventor**: No widgets, limited WebView, visual blocks not version-controlled.
- **WebAPK Forge**: Single dev, bus factor = 1, no community safety net.
- **Bubblewrap/TWA**: x86 SDK incompatible with Termux ARM, more restrictive than WebView.
- **BuildAPKs**: Declining community, not web-to-APK focused.

---

## 📐 Layer Architecture Deep Dive

### Presentation Layer
**Responsibility**: Render UI, handle user input, manage view state

**Rules**:
- Depends ONLY on Domain layer (use cases, entities)
- NEVER depends on Data layer directly
- ViewModels = pure TypeScript classes (no React hooks inside)
- React components = thin wrappers that subscribe to ViewModels

**Benefits**:
- UI can be completely redesigned without touching business logic
- ViewModels testable without DOM/browser

### Domain Layer
**Responsibility**: Pure business logic, enterprise rules, data contracts

**Rules**:
- **ZERO external dependencies** — no React, no Next.js, no fetch, no storage
- Defines repository interfaces (contracts), not implementations
- Entities = plain data + validation methods
- Use cases = single-purpose functions/classes

**Benefits**:
- This code lives forever — survives framework changes
- Blazing fast unit tests (no mocks needed for pure logic)
- Business rules centralized and unambiguous

### Data Layer
**Responsibility**: Implement repository interfaces, handle I/O, caching, sync

**Rules**:
- Depends ONLY on Domain layer (implements its interfaces)
- NEVER depends on Presentation layer
- One repository implementation per data source (local/remote/P2P)
- DTOs translate between external formats and domain entities

**Benefits**:
- Swap REST → GraphQL → P2P without touching UI or domain
- Caching strategy isolated and changeable
- Easy to add offline queueing

---

## 🔄 Data Flow Patterns

### Unidirectional State Flow
```
User Action → ViewModel → UseCase → Repository → Storage/API
     ↑                                                        ↓
     └────────── View Update ← State Change ← Result ─────────┘
```

### Offline-First Write Flow
```
1. User action → Write to local storage (IMMEDIATE)
2. Update UI optimistically
3. Queue operation for sync
4. Background: Attempt network/P2P sync
5. Success: Remove from queue
6. Failure: Exponential backoff retry
```

### P2P Sync Pattern
```
Peer A Change → Local CRDT op → Broadcast via DataChannel
Peer B Receive → Apply CRDT op → Local state merges → UI updates
→ No conflicts, eventual consistency, no central authority
```

---

## 🛡️ Security Architecture

| Layer | Security Measure |
|---|---|
| **Client bundle** | No secrets ever. `NEXT_PUBLIC_` = public data only. |
| **API calls** | Next.js API routes proxy authenticated requests. Keys stay server-side. |
| **Device storage** | Capacitor Keychain/Keystore for sensitive tokens. Never localStorage. |
| **Transport** | HTTPS + WSS mandatory. WebRTC data channels encrypted by default. |
| **Input** | Zod validation at all boundaries. Domain assumes valid data. |
| **APK signing** | Release builds signed with personal keystore. GitHub Secrets secure it. |

---

## 📈 Scaling Path

### Current (Solo Dev / Prototype)
- ✅ Next.js + Capacitor + GitHub Actions
- ✅ Feature-based folders
- ✅ Clean layers

### Growth Path 1: More Developers
- Add ESLint rules enforcing layer boundaries
- Add PR requirements, code owners
- Expand test coverage

### Growth Path 2: Need iOS
- `npx cap add ios` → same codebase → Xcode build
- Minimal additional work

### Growth Path 3: Heavy Native Needs
- Write custom Capacitor plugins in Kotlin/Swift
- UI remains 100% Next.js/React
- Native code isolated to plugins only

### Growth Path 4: P2P Scale Beyond 4 Peers
- Introduce SFU server (e.g., LiveKit, mediasoup)
- Domain signaling interface unchanged
- Data layer swaps mesh → SFU implementation

---

## ⚖️ Known Tradeoffs

| Tradeoff | Accepted Because |
|---|---|
| **Slightly slower cold start** than Flutter | Dev efficiency 10x more valuable for solo dev |
| **Higher RAM usage** than native | Not noticeable for non-game apps |
| **Cloud build dependency** | Consistency & Termux compatibility worth it |
| **Home screen widgets need native code** | OS-level limitation for ALL frameworks; defer to v2 |
| **Annual Capacitor update** | ~1 hour/year is negligible vs Flutter's 2x/year + code changes |

---

## 📌 When To Deviate From This Architecture

**ONLY consider alternatives if:**
1. You need **60fps complex animations / GPU-heavy games** → Flutter or Unity
2. You need **deep system integration** beyond what Capacitor plugins provide → native Kotlin
3. Your team already knows **Dart exclusively** → Flutter

**Otherwise, stick with this architecture.** It has been validated by thousands of production apps and is the optimal balance of speed, maintainability, and future-proofing for your use case.

---

## 📚 Reference Documents

- Coding rules: **`docs/DEVELOPMENT.md`**
- Setup steps: **`docs/SETUP.md`**
- Release process: **`docs/DEPLOYMENT.md`**
- Problem solving: **`docs/TROUBLESHOOTING.md`**
