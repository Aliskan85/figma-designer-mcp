# Figma Designer MCP (Talk to Figma MCP + Designer Toolkit)

**Let an AI agent (Claude Code, Cursor, OpenClaw and any MCP client) design in Figma: wireframes, UI screens, design systems and clickable prototypes with animations.** Works with a **free Figma account** and the desktop app.

This is a fork of [grab/cursor-talk-to-figma-mcp](https://github.com/grab/cursor-talk-to-figma-mcp) (MIT). The original project reads designs and creates basic frames, rectangles and text. This fork adds a **Designer Toolkit**: typed commands for everything a web designer does, without ever executing arbitrary code.

Keywords: MCP, Model Context Protocol, Figma plugin, AI agent, Claude Code, Cursor, design automation, wireframe, prototype, auto layout, design tokens, Figma variables, Smart Animate, web design.

## Designer Toolkit (added in this fork)

| Area | Tools |
|---|---|
| Shapes and graphics | `create_shape` (rectangle, ellipse, line, polygon, star, with rotation), `create_placeholder` (wireframe image box with crossed diagonals, caption and pixel size), `create_from_svg` (icons, logos, custom vectors) |
| Appearance | `set_appearance` (fills, strokes, solid and linear/radial/angular/diamond gradients, corner radius, opacity, blend modes, masks, scroll overflow, rotation, size), `set_effects` (drop and inner shadows, layer blur, background blur for glassmorphism), `set_layout_grids` |
| Text | `set_text_style` (font family and weight, size, line height, letter spacing, alignment, case, decoration, color, fixed-width wrapping) |
| Layout | `set_auto_layout` (direction, wrap, spacing, padding, alignment, sizing, absolute positioning, min/max), `set_constraints` |
| Structure | `arrange_nodes` (group, ungroup, boolean union/subtract/intersect/exclude, flatten, mask, z-order, reparent) |
| Components | `create_component`, `create_variants` |
| Design system | `create_style` (paint, text, effect, grid), `apply_style`, `create_variables` (color/number/string/boolean tokens with modes such as Light and Dark), `bind_variable` |
| Prototyping and animation | `set_reactions` (click, hover, press, timeout triggers; navigate, overlay, swap, change-to; Smart Animate, dissolve, push, move, slide; durations and easing), `set_flow_start` |
| Utilities | `manage_pages`, `list_fonts`, `find_nodes` |

Colors accept `"#rrggbb"`, `"#rrggbbaa"` or `{r,g,b,a}` (0-1). Every command is typed and only applies documented Figma Plugin API properties.

### Security

The WebSocket relay listens on `localhost:3055` **without authentication**: any local program can send commands to the open Figma file. Do not expose the port. By design this fork has **no** "evaluate JavaScript" command, because that would turn the unauthenticated local port into a code-execution channel. If something is missing, add a typed command instead.

### Status

Verified on a live Figma file (free plan, desktop app): shapes, rotated lines, gradients with shadows, SVG import, wrapped text styling, auto layout, placeholders, font listing, node search, pages, and a Smart Animate prototype reaction. Written but not yet exercised in real use: variables and styles, component variants, boolean operations, masks, layout grids. Issues and pull requests are welcome.

### Tested with agents

Agents running in **AutoClaw** have successfully tested this plugin and can work with it (reported by the maintainer). The confirmed setup: Figma desktop app on Windows, free Figma plan, local plugin from this repository, relay (`bun run src/socket.ts`) and the local MCP server. The same build should work for you and your agents. The toolkit was also exercised directly by Claude Code (see Status above). If you confirm it with another agent, please open an issue or pull request to extend this list.

### Use it with AI agents

See [AGENT_PASSPORT.md](AGENT_PASSPORT.md): setup, working order, tips, error table, and an unattended-launch procedure for agents that can control the desktop. A smoke test that exercises the toolkit lives in [scripts/smoke-test.js](scripts/smoke-test.js).

**Important: run the right plugin.** Figma may show two similar plugins:

| | Right one (this repository) | Wrong one (Community build) |
|---|---|---|
| Where | **Plugins > Development > Cursor MCP Plugin** | main Plugins list, Saved plugins or Community: "Talk To Figma MCP Plugin" |
| Window title | **Cursor MCP Plugin** | Talk To Figma MCP Plugin (with a TTF icon) |
| Heading inside the window | Cursor MCP Plugin, "Designer Toolkit build" | Talk To Figma MCP Plugin |
| Designer Toolkit commands | work | answer `Unknown command` |

Import it once: Plugins > Development > Import plugin from manifest > `src/cursor_mcp_plugin/manifest.json`. Do not use "Run last plugin" unless the last one was this plugin. Do not rely on the name alone: confirm with the window title and with a successful `create_shape` (or `manage_pages` with `LIST`). Then point your MCP client at the local `src/talk_to_figma_mcp/server.ts`:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/figma-designer-mcp/src/talk_to_figma_mcp/server.ts"]
    }
  }
}
```

## Credits and legal

- **Original project:** [grab/cursor-talk-to-figma-mcp](https://github.com/grab/cursor-talk-to-figma-mcp), MIT License, Copyright (c) 2025 [sonnylazuardi](https://github.com/sonnylazuardi). The relay, the plugin shell, the original MCP server and the base tools are their work, together with the contributors listed on the [upstream contributors page](https://github.com/grab/cursor-talk-to-figma-mcp/graphs/contributors) (for example [@dusskapark](https://github.com/dusskapark) for bulk text replacement and instance override propagation). Please star and support the original project.
- **This fork:** the Designer Toolkit additions (see above), Copyright (c) 2026 [Aliskan85](https://github.com/Aliskan85), released under the same MIT License. The original copyright notice and license text are kept unchanged in [LICENSE](LICENSE).
- **Dependencies:** [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk), [ws](https://github.com/websockets/ws), [zod](https://github.com/colinhacks/zod), [uuid](https://github.com/uuidjs/uuid), all MIT licensed.
- **Trademarks:** Figma is a trademark of Figma, Inc. Claude is a trademark of Anthropic. Cursor is a trademark of Anysphere. This project is independent, is not affiliated with, endorsed by or sponsored by any of them, and uses their names only to describe compatibility.
- **Plugin analytics:** the upstream plugin sends anonymous usage events (plugin opens, command names, success or error) to Google Analytics, as stated in `src/cursor_mcp_plugin/manifest.json` and the plugin's About tab. No file content or personal data is collected. Remove the Google Analytics domain from the manifest and the sending code if you do not want this.
- **No warranty:** provided "as is" under the MIT License. Review the code before connecting it to important Figma files.

---

## Original project description

This project implements a Model Context Protocol (MCP) integration between AI agent (Cursor, Claude Code) and Figma, allowing AI agent to communicate with Figma for reading designs and modifying them programmatically.

https://github.com/user-attachments/assets/129a14d2-ed73-470f-9a4c-2240b2a4885c

## Project Structure

- `src/talk_to_figma_mcp/` - TypeScript MCP server for Figma integration
- `src/cursor_mcp_plugin/` - Figma plugin for communicating with Cursor
- `src/socket.ts` - WebSocket server that facilitates communication between the MCP server and Figma plugin

## How to use

1. Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

2. Run setup, this will also install MCP in your Cursor's active project

```bash
bun setup
```

3. Start the Websocket server

```bash
bun socket
```

4. Install the Figma plugin **locally** from this repository ([instructions](#figma-plugin)). For this fork do **not** use the Community version ("Talk To Figma MCP Plugin"): it does not contain the Designer Toolkit commands.

## Quick Video Tutorial

[Video Link](https://www.linkedin.com/posts/sonnylazuardi_just-wanted-to-share-my-latest-experiment-activity-7307821553654657024-yrh8)

## Design Automation Example

**Bulk text content replacement**

Thanks to [@dusskapark](https://github.com/dusskapark) for contributing the bulk text replacement feature. Here is the [demo video](https://www.youtube.com/watch?v=j05gGT3xfCs).

**Instance Override Propagation**
Another contribution from [@dusskapark](https://github.com/dusskapark)
Propagate component instance overrides from a source instance to multiple target instances with a single command. This feature dramatically reduces repetitive design work when working with component instances that need similar customizations. Check out our [demo video](https://youtu.be/uvuT8LByroI).

## Manual Setup and Installation

### MCP Server: Integration with Cursor

Add the server to your Cursor MCP configuration in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"]
    }
  }
}
```

### WebSocket Server

Start the WebSocket server:

```bash
bun socket
```

### Figma Plugin

1. In Figma, go to Plugins > Development > New Plugin
2. Choose "Link existing plugin"
3. Select the `src/cursor_mcp_plugin/manifest.json` file
4. The plugin should now be available in your Figma development plugins

## Windows + WSL Guide

1. Install bun via powershell

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

2. Uncomment the hostname `0.0.0.0` in `src/socket.ts`

```typescript
// uncomment this to allow connections in windows wsl
hostname: "0.0.0.0",
```

3. Start the websocket

```bash
bun socket
```

## Usage

1. Start the WebSocket server
2. Install the MCP server in Cursor
3. Open Figma and run the Cursor MCP Plugin
4. Connect the plugin to the WebSocket server by joining a channel using `join_channel`
5. Use Cursor to communicate with Figma using the MCP tools

## Local Development Setup

To develop, update your mcp config to direct to your local directory.

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bun",
      "args": ["/path-to-repo/src/talk_to_figma_mcp/server.ts"]
    }
  }
}
```

## MCP Tools

The MCP server provides the following tools for interacting with Figma:

### Document & Selection

- `get_document_info` - Get information about the current Figma document
- `get_selection` - Get information about the current selection
- `read_my_design` - Get detailed node information about the current selection without parameters
- `get_node_info` - Get detailed information about a specific node
- `get_nodes_info` - Get detailed information about multiple nodes by providing an array of node IDs
- `set_focus` - Set focus on a specific node by selecting it and scrolling viewport to it
- `set_selections` - Set selection to multiple nodes and scroll viewport to show them

### Annotations

- `get_annotations` - Get all annotations in the current document or specific node
- `set_annotation` - Create or update an annotation with markdown support
- `set_multiple_annotations` - Batch create/update multiple annotations efficiently
- `scan_nodes_by_types` - Scan for nodes with specific types (useful for finding annotation targets)

### Prototyping & Connections

- `get_reactions` - Get all prototype reactions from nodes with visual highlight animation
- `set_default_connector` - Set a copied FigJam connector as the default connector style for creating connections (must be set before creating connections)
- `create_connections` - Create FigJam connector lines between nodes, based on prototype flows or custom mapping

### Creating Elements

- `create_rectangle` - Create a new rectangle with position, size, and optional name
- `create_frame` - Create a new frame with position, size, and optional name
- `create_section` - Create a section to group related content on the canvas
- `create_text` - Create a new text node with customizable font properties

### Modifying text content

- `scan_text_nodes` - Scan text nodes with intelligent chunking for large designs
- `set_text_content` - Set the text content of a single text node
- `set_multiple_text_contents` - Batch update multiple text nodes efficiently

### Auto Layout & Spacing

- `set_layout_mode` - Set the layout mode and wrap behavior of a frame (NONE, HORIZONTAL, VERTICAL)
- `set_padding` - Set padding values for an auto-layout frame (top, right, bottom, left)
- `set_axis_align` - Set primary and counter axis alignment for auto-layout frames
- `set_layout_sizing` - Set horizontal and vertical sizing modes for auto-layout frames (FIXED, HUG, FILL)
- `set_item_spacing` - Set distance between children in an auto-layout frame

### Styling

- `set_fill_color` - Set the fill color of a node (RGBA)
- `set_stroke_color` - Set the stroke color and weight of a node
- `set_corner_radius` - Set the corner radius of a node with optional per-corner control
- `set_image_fill` - Fill a node with an image from a local file path, URL, or base64 data (FILL, FIT, CROP, or TILE)

### Layout & Organization

- `move_node` - Move a node to a new position
- `resize_node` - Resize a node with new dimensions
- `delete_node` - Delete a node
- `delete_multiple_nodes` - Delete multiple nodes at once efficiently
- `clone_node` - Create a copy of an existing node with optional position offset
- `rename_node` - Rename a node
- `set_parent` - Move a node into a new parent (section, frame or group), preserving its absolute position by default

### Components & Styles

- `get_styles` - Get information about local styles
- `get_local_components` - Get information about local components
- `create_component_instance` - Create an instance of a component
- `get_instance_overrides` - Extract override properties from a selected component instance
- `set_instance_overrides` - Apply extracted overrides to target instances

### Export & Advanced

- `export_node_as_image` - Export a node as an image (PNG, JPG, SVG, or PDF) - limited support on image currently returning base64 as text

### Connection Management

- `join_channel` - Join a specific channel to communicate with Figma

### MCP Prompts

The MCP server includes several helper prompts to guide you through complex design tasks:

- `design_strategy` - Best practices for working with Figma designs
- `read_design_strategy` - Best practices for reading Figma designs
- `text_replacement_strategy` - Systematic approach for replacing text in Figma designs
- `annotation_conversion_strategy` - Strategy for converting manual annotations to Figma's native annotations
- `swap_overrides_instances` - Strategy for transferring overrides between component instances in Figma
- `reaction_to_connector_strategy` - Strategy for converting Figma prototype reactions to connector lines using the output of 'get_reactions', and guiding the use 'create_connections' in sequence

## Development

### Building the Figma Plugin

1. Navigate to the Figma plugin directory:

   ```
   cd src/cursor_mcp_plugin
   ```

2. Edit code.js and ui.html

## Best Practices

When working with the Figma MCP:

1. Always join a channel before sending commands
2. Get document overview using `get_document_info` first
3. Check current selection with `get_selection` before modifications
4. Use appropriate creation tools based on needs:
   - `create_frame` for containers
   - `create_rectangle` for basic shapes
   - `create_text` for text elements
5. Verify changes using `get_node_info`
6. Use component instances when possible for consistency
7. Handle errors appropriately as all commands can throw exceptions
8. For large designs:
   - Use chunking parameters in `scan_text_nodes`
   - Monitor progress through WebSocket updates
   - Implement appropriate error handling
9. For text operations:
   - Use batch operations when possible
   - Consider structural relationships
   - Verify changes with targeted exports
10. For converting legacy annotations:
    - Scan text nodes to identify numbered markers and descriptions
    - Use `scan_nodes_by_types` to find UI elements that annotations refer to
    - Match markers with their target elements using path, name, or proximity
    - Categorize annotations appropriately with `get_annotations`
    - Create native annotations with `set_multiple_annotations` in batches
    - Verify all annotations are properly linked to their targets
    - Delete legacy annotation nodes after successful conversion
11. Visualize prototype noodles as FigJam connectors:

- Use `get_reactions` to extract prototype flows,
- set a default connector with `set_default_connector`,
- and generate connector lines with `create_connections` for clear visual flow mapping.

## License

MIT
