# Agent Scratchpad

This file tracks the progress of AI agent work on this project.

---

## Session: 2026-08-25

### Objective
Fix `pnpm audit` issues in the TypeScript frontend.

### Tasks
- [x] Run `pnpm audit` and identify findings
- [x] Update `typescript/package.json` dependency floors and pnpm overrides
- [x] Re-run `pnpm audit` (zero findings)
- [x] Production `pnpm build` and route smoke checks
- [x] Commit, push, and open PR (#60)

### Notes
- `pnpm audit` reported one moderate finding: `uuid@9.0.1` via `@aptos-labs/wallet-adapter-react` → `@identity-connect/dapp-sdk` (GHSA-w5hq-g745-h8pq / CVE-2026-41907). Patched in `>=11.1.1`.
- Declared ranges also allowed older Next.js 16.x (`^16.0.7`) and react-router-dom (`^7.10.1`) that scanners treat as vulnerable even though a fresh install already resolved newer versions.
- Existing pnpm overrides for `axios` (`>=1.12.0`) and `form-data` (`>=4.0.4`) were below later patched floors (`axios >=1.18.0`, `form-data >=4.0.6`).
- `uuid` override is `^11.1.1` (not `>=11.1.1`) so the tree stays on the last dual CJS/ESM 11.x release instead of ESM-only uuid 14.
- `pnpm-lock.yaml` remains gitignored; only `package.json` is committed, matching prior remediations.

### Progress Log
1. Installed TypeScript deps and ran `pnpm audit` (1 moderate: uuid@9.0.1)
2. Updated Next.js / react-router-dom floors and pnpm overrides
3. Reinstall resolved `uuid@11.1.1`; `pnpm audit` reports no known vulnerabilities
4. `pnpm build` succeeded on Next.js 16.3.3; home `/`, `/greg`, and `/manifest.json` returned 200
5. Opened PR https://github.com/aptos-labs/apt-id/pull/60
