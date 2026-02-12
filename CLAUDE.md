# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Impact Framework (IF)** is a TypeScript framework by the Green Software Foundation for modelling, measuring, and monitoring the environmental impacts of software. It uses a plugin-based pipeline architecture that processes YAML manifest files describing component trees and computation pipelines.

## Common Commands

```bash
# Build
npm run build          # TypeScript compilation to /build

# Test
npm test                                          # Run all tests (Jest, verbose)
npm test -- src/__tests__/if-run/lib/compute.test.ts  # Run a single test file
npm run coverage                                  # Generate coverage report

# Lint
npm run lint           # GTS (Google TypeScript Style) linting
npm run fix            # Auto-fix lint issues

# CLI tools (after build)
npx if-run -m <manifest.yaml>           # Run a manifest
npx if-run -m <manifest.yaml> --debug   # Run with debug logging
npx if-check -m <manifest.yaml>         # Validate a manifest
npx if-diff -s <source.yaml> -t <target.yaml>  # Compare outputs
npx if-csv -m <manifest.yaml>           # Export to CSV
npx if-api                              # Start REST API server (port 3000)
```

## Architecture

### Execution Flow (if-run)

1. Parse CLI args → load manifest YAML → inject environment variables → validate with Zod
2. **Initialize**: Load plugins from manifest's `initialize.plugins` and register in plugin storage
3. **Compute**: Depth-first traversal of the component tree — for each leaf node: merge defaults → observe → regroup → compute
4. **Aggregate**: Apply horizontal (time) and/or vertical (component) aggregation
5. **Exhaust**: Write results to YAML/console

Pipeline phases (observe, regroup, compute) can be run in isolation via `--observe`, `--regroup`, `--compute` flags.

### Source Layout

- `src/if-run/` — Main execution engine: pipeline orchestration, plugin loading, aggregation, output
- `src/if-run/builtins/` — ~19 built-in plugins (multiply, sum, divide, sci, csv-lookup, time-sync, etc.)
- `src/if-api/` — Express v5 REST API server with the same core execution as if-run
- `src/if-check/`, `src/if-csv/`, `src/if-diff/`, `src/if-env/`, `src/if-merge/`, `src/if-metadata-check/` — Auxiliary CLI tools
- `src/common/` — Shared utilities (logger, Zod validation, YAML I/O, filesystem helpers)
- `src/__tests__/` — Test suites mirroring source structure
- `src/__mocks__/` — Jest mocks

### Plugin System

Plugins implement the `PluginInterface` from `@grnsft/if-core/types` and are created via `PluginFactory` from `@grnsft/if-core/interfaces`:

```typescript
export const MyPlugin = PluginFactory({
  configValidation: (config: ConfigParams) => { /* Zod validation */ },
  inputValidation: (input: PluginParams, config: ConfigParams) => { /* Zod validation */ },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => { /* return transformed inputs */ },
  allowArithmeticExpressions: [],
});
```

Built-in plugins use `path: 'builtin'` in the manifest. External plugins use npm module paths or GitHub URLs. The plugin storage (`src/if-run/util/plugin-storage.ts`) is a simple name→instance registry.

### Manifest Structure

Manifests are YAML files with: `name`, `initialize.plugins` (plugin definitions with path, method, config, mapping), `tree` (component hierarchy with pipeline, defaults, inputs), and optional `aggregation` settings. Validated at runtime using Zod schemas in `src/common/util/validations.ts`.

### Key Dependencies

- `@grnsft/if-core` — Core types, interfaces (`PluginFactory`), error classes, aggregation constants
- `zod` — Schema validation throughout
- `js-yaml` — YAML parsing/generation
- `luxon` — Date/time handling (used in time-sync, time-converter plugins)

## Commit Conventions

Conventional commits enforced via commitlint. Scope is **required**.

- **Types**: feat, fix, docs, chore, style, refactor, ci, test, revert
- **Scopes**: util, lib, types, src, package, config, mocks, .github, .husky, scripts, builtins, plugins, integration, doc, manifests, release, .commitlint

Example: `feat(builtins): add new interpolation method`

## Testing

Tests are in `src/__tests__/` mirroring the source tree. Jest with ts-jest. Mocks live in `src/__mocks__/`. Coverage excludes config and types directories.

## API Server Notes

The API server (`if-api`) disables Shell, CSVImport, and CSVLookup plugins by default for security. Uses request-scoped context storage to prevent cross-request contamination.
