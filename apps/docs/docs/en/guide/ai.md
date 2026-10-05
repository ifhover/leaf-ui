# AI & Skills

Install the Leaf UI skill so your AI assistant can retrieve the APIs, types and examples for the version installed in your project.

## Installation

Run this in the project that uses Leaf UI:

```bash
npx skills add ifhover/leaf-ui --skill leaf-ui
```

Choose your coding agent when prompted. Codex, Claude Code, Cursor and other Agent Skills compatible tools are supported. Skills are installed in the current project by default and can be shared with your team.

You can also select an agent directly:

```bash
# Codex
npx skills add ifhover/leaf-ui --skill leaf-ui --agent codex

# Claude Code
npx skills add ifhover/leaf-ui --skill leaf-ui --agent claude-code

# Cursor
npx skills add ifhover/leaf-ui --skill leaf-ui --agent cursor
```

Add `--global` to share the skill across projects. It becomes available in a new session or your next turn.

## Usage

Install `@sudden3/leaf-ui` in your application, then describe the interface you need. For example:

> Use the leaf-ui skill to build a login form with a password field, validation feedback and a submitting state.

The skill resolves the package installed from the target application directory. A project using `0.2.0` receives `0.2.0` documentation rather than newer APIs. In a monorepo, specify the application directory you are editing.

Only the required component or guide is retrieved. If an API is missing from that version, the package is not installed, or documentation is unavailable, the assistant reports it and can check the installed TypeScript declarations.

## Updating and removing

```bash
npx skills update leaf-ui
npx skills remove leaf-ui
```

Updating the skill does not upgrade Leaf UI. Your application's dependency still determines its component version.

## Documentation versions

Use the version menu in the navigation bar to browse published versions. Each version retains its component demos, APIs and Markdown pages.

AI entry points are `llm.txt`, `llms.txt` and `api/index.json` at each version's root. Component pages also offer Markdown links. The skill and its query helper are maintained on [GitHub](https://github.com/ifhover/leaf-ui/tree/main/skills/leaf-ui).
