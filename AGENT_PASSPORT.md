# Agent passport: Figma Designer MCP

For AI agents (Claude Code, Cursor, OpenClaw, ZCode, AutoClaw and any other MCP client) that must design in Figma through this server.

## 1. What this is

An MCP server that lets an agent create and edit objects in an open Figma file.
Chain: **agent -> MCP server (stdio) -> WebSocket relay on localhost:3055 -> Figma plugin in the desktop app**.
A free Figma account is enough.

## 2. What must be running

| Component | How to check | How to start |
|---|---|---|
| Relay | port 3055 is listening | in the repo root: `bun run src/socket.ts` (keep it running) |
| Plugin in Figma | plugin window is open and shows a green bar "Connected to server in channel: XXXXXXXX" | open a file, then **Plugins > Development > Cursor MCP Plugin** (see section 3) |
| MCP server in the client | tools such as `join_channel`, `create_frame`, `create_shape` are listed | see section 4 |

The relay stops when the session that started it ends. Keep the plugin window open for the whole job (you may move it aside, do not close it). After the plugin code changes, close the window and run the plugin again.

## 3. Starting the plugin correctly

The plugin menu only exists **inside an open file**. Use the **local** plugin from this repository:

1. One-time import: **Plugins > Development > Import plugin from manifest...** and choose `src/cursor_mcp_plugin/manifest.json`.
2. Run it: main menu (Figma logo, top-left) > **Plugins > Development > Cursor MCP Plugin**.

**Two similar plugins exist; only one is right.** Do not trust the name alone: a familiar name is the usual trap.

| | RIGHT (this repo) | WRONG (Community build) |
|---|---|---|
| Menu path | **Plugins > Development > Cursor MCP Plugin** | main Plugins list, Saved plugins or Community: **"Talk To Figma MCP Plugin"** |
| Window title | **Cursor MCP Plugin** | Talk To Figma MCP Plugin (TTF icon) |
| Heading inside the window | Cursor MCP Plugin, "Designer Toolkit build" | Talk To Figma MCP Plugin |
| Designer Toolkit commands | work | answer `Unknown command` |

Never pick "Talk To Figma MCP Plugin" from the main list. Do not use "Run last plugin" unless the last one was the local plugin. If you ran the wrong one, close its window and run the right one.

**Proof that it is the right plugin** (do this every time): the window title is "Cursor MCP Plugin" **and** a toolkit call succeeds, for example `manage_pages` with `{"action":"LIST"}` or a test `create_shape`. `Unknown command` means the wrong plugin (or an old copy) is running.

**Tested with agents:** agents running in AutoClaw successfully tested this plugin and can work with it (reported by the maintainer). Confirmed setup: Figma desktop on Windows, free plan, local plugin, relay and local MCP server as described here.

## 4. Connecting the MCP server

Stdio MCP server, local copy of this repository (the published npm package does not contain the Designer Toolkit):

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

Restart the client after editing the config. OpenClaw: add the server under `mcp.servers` or use `openclaw mcp set`, then `openclaw mcp doctor <name> --probe`. For other clients, any stdio MCP configuration with the same command works.

## 5. Working order (mandatory)

1. Get the **channel code** from the green bar of the plugin. It changes every time the plugin connects.
2. Call `join_channel` with the code.
3. Verify with `get_document_info`. `Request to Figma timed out` means the plugin is disconnected or holds a stale connection: Disconnect, Connect, read the new code, join again.
4. Create a root frame (`create_frame`), remember its ID, and create everything else inside it with `parentId`.
5. After big steps, check the result with `export_node_as_image` (scale 0.3 to 0.5).

## 6. Rules and tips

- `x`, `y` of children are relative to the parent. Later-created layers are on top.
- Colors: `"#rrggbb"`, `"#rrggbbaa"` or `{r,g,b,a}` (0-1). The older tools (`create_frame`, `create_text`, `set_fill_color`) accept only `{r,g,b}` in 0-1.
- Text: `create_text`, then `set_text_style`. Pass `width` to get a fixed-width wrapping block instead of manual line breaks.
- Centered buttons and captions: frame + `set_auto_layout` (`layoutMode`, `primaryAxisAlignItems: CENTER`, `counterAxisAlignItems: CENTER`), text added with the frame as `parentId`.
- Lines: `create_shape` with `type: LINE`. `width` is the length, `rotation` is in degrees, counter-clockwise, around the top-left origin. A line going down-right has a negative angle; a diagonal of a w x h box has length sqrt(w^2+h^2) and angle -atan(h/w).
- Wireframe image boxes: `create_placeholder` (frame, two diagonals, caption and pixel size) in one call.
- Gradients: `fills: [{type:"GRADIENT_LINEAR", angle:180, stops:[{position:0,color:"#fff"},{position:1,color:"#000"}]}]`. `angle` follows CSS (0 up, 90 right, 180 down).
- Glassmorphism: `set_effects` with `BACKGROUND_BLUR` plus a semi-transparent fill.
- Design system: tokens with `create_variables` (modes such as Light/Dark), `bind_variable`, styles with `create_style` and `apply_style`.
- Interaction and animation: `set_reactions` (trigger, transition SMART_ANIMATE/DISSOLVE/MOVE_IN/PUSH..., duration in seconds, easing), `set_flow_start`. Hover states: components and variants (`create_component`, `create_variants`) plus an `ON_HOVER` reaction with `CHANGE_TO`.
- Default font is Inter. Call `list_fonts` before using another family.

## 7. Errors

| Symptom | Cause | Fix |
|---|---|---|
| `Must join a channel before sending commands` | `join_channel` not called | section 5 |
| `Request to Figma timed out` | plugin disconnected or stale | Disconnect, Connect, new channel code |
| `Not connected to Figma` | relay not running | section 2 |
| `Unknown command: ...` | wrong or outdated plugin | run the local plugin again (section 3) |
| `Font not available` | no such family or style | `list_fonts` |
| Tool missing in the list | client not restarted after config change | restart the client |

## 8. Unattended launch (the user is away)

Scenario: the user is traveling and gives the agent client materials to produce a layout. The agent brings the whole chain up and reads the channel code itself; it must not wait for the user to send it.

Requirement: the agent can run shell commands and control the desktop (screenshots, clicks, typing). Without desktop control the plugin cannot be started: stop, describe what was missing, wait for the user. Do not look for workarounds and do not add code execution.

1. **Relay.** Check port 3055; if closed, start `bun run src/socket.ts` in the background and confirm "WebSocket server running on port 3055".
2. **Figma.** If it is not running, start the desktop app and wait for the home screen (screenshot). The user is normally signed in already; if a sign-in is requested, stop and report.
3. **File.** Open the latest file from Recents or create one: **Create > Design file**.
4. **Plugin.** Figma logo (first item of the left menu) > **Plugins > Development > Cursor MCP Plugin**. Never choose "Talk To Figma MCP Plugin" from the main list, Saved plugins or Community (wrong build). If the entry is missing, import `src/cursor_mcp_plugin/manifest.json` first (section 3).
5. **Check.** The window title is "Cursor MCP Plugin" (not "Talk To Figma MCP Plugin") and the green bar is shown. If not connected, press **Connect** (port 3055). Do not close or minimize the window. Prove it later with a successful toolkit call (section 3).
6. **Channel code.** Read the 8-character code from a screenshot and double-check every character (0 vs o, l vs 1). Confirm by `join_channel` + `get_document_info`; on timeout, take a new screenshot and retry.
7. Continue with section 5. Report progress briefly: the user may be reading on a phone. At the end export the key screens and report the file and frame names.

## 9. Security

The relay listens on `localhost:3055` without authentication: any local program can send commands to the open Figma file. Never expose the port and never start the relay with `--server` against a foreign host. One agent per channel: parallel edits of one file conflict.

Executing arbitrary JavaScript inside Figma is deliberately **not** implemented, because it would turn an unauthenticated local port into a code-execution channel. If a design task is not covered, propose a new typed command instead of code.
