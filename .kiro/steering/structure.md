# Project Structure

> The project is in early setup. Update this file as the codebase grows.

## Current Layout

```
bank-safety-tool/
├── .gitignore
├── README.md
└── .kiro/
    └── steering/       # AI assistant guidance files
```

## Expected Structure (update when scaffolded)

```
bank-safety-tool/
├── src/                # Application source code
│   ├── components/     # UI components (if frontend)
│   ├── pages/          # Route-level pages (if Next.js)
│   ├── lib/            # Shared utilities and helpers
│   ├── services/       # External API or data access logic
│   └── types/          # TypeScript type definitions
├── public/             # Static assets (if frontend)
├── tests/              # Test files
├── .kiro/
│   └── steering/       # AI assistant guidance files
├── .gitignore
├── package.json
└── README.md
```

## Conventions
- Keep data-fetching logic in `services/`, separate from UI components
- Shared types go in `types/` — avoid inline type definitions in component files
- Utility functions go in `lib/` — keep them pure and well-tested
- Co-locate tests with source files or mirror the `src/` structure under `tests/`
