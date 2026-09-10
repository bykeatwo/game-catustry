# 📘 SETUP Guide — Environment Configuration

> **For AI Agents**: Load this document for initial environment setup and agentic workflow configuration.

---

## 🛠️ Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20.x | Runtime & package manager |
| npm | ≥ 10.x | Dependency management |
| Git | Any | Version control |

---

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Verify setup
node --version   # Should be ≥ 20.x
npm --version    # Should be ≥ 10.x

# 3. Start development server
npm run dev
```

---

## 🤖 Agentic Workflow

### For Development Agents
- Main source of truth for game logic: `IDEA.md`
- Architecture decisions: `docs/ARCHITECTURE.md`
- Implementation patterns: `docs/DEVELOPMENT.md`

### Starting Point
1. Read `IDEA.md` to understand game systems
2. Read `docs/ARCHITECTURE.md` for data models
3. Implement features following the patterns in `docs/DEVELOPMENT.md`

---

## 🔧 Troubleshooting Setup

If you encounter issues:
- See `docs/TROUBLESHOOTING.md` for debugging patterns
- Check Node.js version compatibility
- Clear cache: `npm cache clean --force` then reinstall