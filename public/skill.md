# Engram Agent Skill

Engram is your persistent memory for this project. Use it to store preferences, architectural facts, and relationships so you don't forget them across sessions.

## Core Commands

- **Store a memory**: `npx engram memory add "Never use implicit any in TypeScript" --scope project --importance 8`
- **Store a relationship**: `npx engram graph add "AuthService" "depends on" "JWTLibrary"`
- **Fetch context**: `npx engram bundle "authentication"` (Run this at the start of a task to retrieve relevant context)
- **Search memories**: `npx engram memory search "typescript"`

## Rules for Agents

1. **Always fetch a bundle** at the start of a new task if you are unsure about project conventions.
2. **Store new preferences** when the user corrects you or establishes a new rule.
3. **Keep memories concise**.
4. **Use graph edges** to map out dependencies and architecture.
