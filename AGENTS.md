<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Testing Conventions

1. **Colocated Unit Tests:**
   - All unit tests MUST be colocated directly next to their source files.
   - Example: `src/lib/auth.ts` -> `src/lib/auth.test.ts`, `src/components/Button.tsx` -> `src/components/Button.test.tsx`.
   - Do NOT place unit tests in a centralized root `__tests__/` folder.

2. **Smoke, Integration & E2E Tests:**
   - System-wide tests live in organized subdirectories under the root `tests/` directory:
     - `tests/smoke/` (e.g. `tests/smoke/smoke.test.ts`)
     - `tests/integration/`
     - `tests/e2e/`

3. **Package Manager:**
   - Always use `pnpm`. Do NOT use `npm` or `yarn`.

## Git Commit Conventions

All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

Format: `<type>(<optional-scope>): <description>` (use lowercase, imperative mood)

Common types:

- `feat`: A new user-facing feature or API endpoint
- `fix`: A bug fix
- `docs`: Documentation updates only (e.g. README.md, AGENTS.md)
- `chore`: Tooling, dependency management, or build configs without altering app logic
- `test`: Adding or updating tests (unit, smoke, integration)
- `refactor`: Code refactoring that neither fixes a bug nor adds a feature
- `style`: Formatting, missing semi-colons, lint fixes (no code logic change)

## UI Design & Skill-First Protocol

1. **Always Read Skills Before Building UI:**
   - Before designing, restructuring, or refining any UI (`src/app/`, `src/components/`), the agent MUST read and apply the principles from `.agents/skills/design-taste-frontend/SKILL.md` and `references/app-screens.md`.
2. **Anti-Slop House Standards:**
   - No generic centered 3-card templates with icons in colored circles.
   - No gratuitous shadows (`shadow-2xl`), floating blurry cards, or redundant hairline dividers.
   - Enforce brand colors (Dark Monochrome & Graphite: Solid White primary `#FFFFFF`, matte charcoal `#09090B` background, `#18181C` cards, `#2E2E36` borders; Dark theme is the exclusive sole theme).
   - Use authentic product language and real preview fragments instead of lorem/generic placeholders.

