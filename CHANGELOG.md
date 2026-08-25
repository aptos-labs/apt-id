# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Primary social accounts on Apt ID profiles (X, Telegram, GitHub)
  - Stored in the existing LinkTree using `__primary:` keys, with a `get_primary_socials` view and optional `set_primary_social` / `remove_primary_social` entry functions
  - Profile editor fields and a public-profile icon row, parsed from existing links so it works before a contract upgrade
- Editable display name on profiles (capitalization and custom titles), stored in the existing on-chain `Bio.name` field
- `CLAUDE.md` - AI agent instructions and project documentation
- `AGENTS.md` - Symlink to CLAUDE.md for alternative agent systems
- `SCRATCHPAD.md` - Agent process tracking file
- `CHANGELOG.md` - This changelog file
- Pre-commit hooks for automated linting and formatting
  - TypeScript: ESLint + Prettier checks
  - Rust: cargo clippy + cargo fmt checks
  - Move: compilation validation

### Changed
- Raised TypeScript dependency floors for patched Next.js 16.3.x and react-router-dom 7.18.x
- Added `typescript-eslint` so `pnpm lint` can load `eslint.config.mjs`

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- Remediated `pnpm audit` findings in the TypeScript app:
  - Forced transitive `uuid` to `^11.1.1` (GHSA-w5hq-g745-h8pq / CVE-2026-41907)
  - Raised `axios` override to `>=1.18.0` and `form-data` to `>=4.0.6`
  - Raised `next` / `eslint-config-next` to `^16.3.3` so installs cannot resolve Next.js versions affected by the July 2026 advisories
