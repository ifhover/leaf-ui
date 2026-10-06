# Leaf UI design resources

Run `pnpm design:export` from the repository root to regenerate all assets from the same colors, recipes and density sources used at runtime.

- `apps/docs/docs/public/design/leaf.tokens.json`: DTCG color, dimension, number and duration tokens. Select one appearance and one density set.
- `leaf.tokens-studio.json`: the legacy `type`/`value` shape for Tokens Studio. Enable Light or Dark plus Comfortable or Compact, not both appearances simultaneously.
- Four `leaf-*-foundations.svg` / `leaf-*-components.svg` sheets: named groups, editable vector paths and text. Drag these into Figma; install Inter or choose a replacement font.
- This local plugin creates native color variables with Light/Dark modes, dimension variables with Comfortable/Compact modes, and editable Button/Input component sets. Components bind fill colors and heights to variables. Button variants cover solid/soft/outline/ghost and default/hover/pressed/disabled, with both densities.

In Figma desktop: **Plugins → Development → Import plugin from manifest**, select `manifest.json`, then run **Leaf UI Resources**. The downloadable ZIP contains `manifest.json`, `code.js` and this README. Each run creates a page and collections; use Figma Undo if you do not want the imported resources. No network access is requested.

These files are a starting design kit. SVG sheets do not automatically become Figma component variants. The plugin creates native Button/Input variants; other sheets can be converted into components by the designer. Auto-layout structures and variable bindings are included in the plugin source. They are not a published Figma library, and runtime Figma API/visual verification remains a manual acceptance step. Node syntax, JSON and SVG structure are checked locally.

To customize, change runtime theme defaults/recipes or density sources and regenerate. For a separate brand, override semantic colors in application `ConfigProvider` and mirror them in Figma variables. Test foreground/background contrast after changing a palette.
