# CLAUDE.md - AI Agent Instructions

This file provides guidance for AI agents working with this codebase.

## Project Overview

**Apt ID** is a profile system for Aptos accounts, providing a linktree-like experience attached to Aptos names. The project uses both **Aptos Move** (smart contracts) and **TypeScript** (Next.js frontend).

Repository: https://github.com/aptos-labs/apt-id
Live site: https://aptid.xyz

## Project Structure

```
/workspace/
├── move/                    # Aptos Move smart contracts
│   ├── Move.toml           # Move package configuration
│   └── sources/
│       └── profile.move    # Profile smart contract
├── rust/                   # Rust indexer processor
│   └── profile-processor/  # Processes on-chain profile events
├── typescript/             # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── hooks/         # Custom React hooks
│   └── package.json
├── CHANGELOG.md            # Project changelog
└── SCRATCHPAD.md          # Agent process tracking
```

## Development Setup

### Prerequisites
- [asdf](https://asdf-vm.com/) or pnpm installed separately
- Node.js (see `typescript/.node-version`)
- Aptos CLI for Move development
- Rust toolchain for indexer processor

### TypeScript Frontend

```bash
cd typescript/
pnpm install
pnpm dev
```

### Move Smart Contracts

```bash
cd typescript/
pnpm move:compile  # Compile Move modules
pnpm move:test     # Run Move tests
pnpm move:publish  # Deploy to network
```

### Rust Indexer

```bash
cd rust/profile-processor/
cargo build
cargo run
```

## Code Quality Commands

### TypeScript

```bash
cd typescript/

# Linting
pnpm lint              # Run ESLint (zero warnings allowed)

# Formatting
pnpm fmt               # Format code with Prettier
pnpm _fmt -- --check   # Check formatting without writing
```

### Rust

```bash
cd rust/profile-processor/

# Linting
cargo clippy --all-targets --all-features -- -D warnings

# Formatting
cargo fmt              # Format code
cargo fmt -- --check   # Check formatting without writing
```

### Move

```bash
# Using Aptos CLI
cd move/
aptos move compile
aptos move test
aptos move fmt        # Format Move code (if aptos CLI supports it)
```

## Pre-commit Hooks

This project uses git pre-commit hooks to ensure code quality. All lints and formatting checks run automatically before each commit.

### Setup

Run the setup script to install git hooks:
```bash
./scripts/setup-hooks.sh
```

### What Gets Checked

The hooks check:
- TypeScript: ESLint + Prettier
- Rust: cargo clippy + cargo fmt
- Move: aptos move compile (syntax validation)

To skip hooks in emergencies (not recommended):
```bash
git commit --no-verify
```

## Key Files

### Move
- `move/sources/profile.move` - Main profile smart contract

### TypeScript
- `typescript/src/app/page.tsx` - Home page
- `typescript/src/app/[name]/page.tsx` - Profile page
- `typescript/src/components/ProfileEditor.tsx` - Profile editing UI
- `typescript/src/components/PublicProfile.tsx` - Public profile display
- `typescript/src/constants.ts` - App constants and configuration

### Rust Indexer
- `rust/profile-processor/src/main.rs` - Indexer entry point
- `rust/profile-processor/src/processors/profile/` - Profile event processing

## Architecture Notes

1. **Smart Contract**: The Move module stores profile data on-chain (bio, links, etc.)
2. **Frontend**: Next.js app allows users to view and edit profiles via wallet connection
3. **Indexer**: Rust processor indexes on-chain profile events for efficient querying

## Testing

```bash
# TypeScript
cd typescript/
pnpm lint  # No test suite currently

# Move
cd typescript/
pnpm move:test

# Rust
cd rust/profile-processor/
cargo test
```

## Commit Guidelines

- Run all lints and formatting before committing
- Use clear, descriptive commit messages
- Update CHANGELOG.md for user-facing changes
- Update SCRATCHPAD.md to track agent progress
