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

Install `@ifhover/leaf-ui` in your application, then describe the interface you need. For example:

> Use the leaf-ui skill to build a login form with a password field, validation feedback and a submitting state.

The skill resolves the installed package name and exact version from the target application directory, including legacy Leaf UI packages. Documentation always matches your dependency rather than newer APIs. In a monorepo, specify the application directory you are editing.

For new pages or substantial layout work, the skill first queries the same version's [Interface design and composition](/en/guide/design-standards), using the library's type, weight, spacing, density and color roles before retrieving components as needed. Default numbers are references, not replacements for user theme settings. Small API or behavior fixes do not require loading the whole guide.

For versions with structured data, component details return the original introduction, complete basic usage, API and example names. Additional examples are retrieved by index, ID or title, with multiple selections supported in one query. The helper runs on Node.js; it does not require Python or compile documentation on your computer.

If the installed version has no structured data, the result is explicitly labeled as its complete original Markdown page and does not support example selection. Guides and non-component references also retain their full original text. Queries do not add the whole site to the context or switch to a newer version. If an API is missing from that version, the package is not installed, or documentation is unavailable, the assistant reports it and can check the installed TypeScript declarations.

## Updating and removing

```bash
npx skills update leaf-ui
npx skills remove leaf-ui
```

Updating the skill does not upgrade Leaf UI. Your application's dependency still determines its component version.

## Documentation versions

The default URL shows the latest published version. Use the version menu in the navigation bar to browse older releases. Each version retains its component demos, APIs and Markdown pages.

AI entry points are `llm.txt`, `llms.txt` and `api/index.json` at each version's root. Component pages also offer Markdown links. The skill and its query helper are maintained on [GitHub](https://github.com/ifhover/leaf-ui/tree/main/skills/leaf-ui).
