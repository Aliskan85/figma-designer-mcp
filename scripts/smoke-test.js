// Smoke test for the Designer Toolkit. Usage: bun run scripts/smoke-test.js <channel-code>
// Requires the relay (bun socket) and the local plugin running. Creates "TEST toolkit" and "TEST screen 2" frames; delete them afterwards.
// Test client for the Figma bridge: joins a channel and runs plugin commands in sequence.
const channel = process.argv[2];
const ws = new WebSocket("ws://localhost:3055");
const pending = new Map();
let nextId = 1;

function send(command, params) {
  return new Promise((resolve, reject) => {
    const id = "t" + nextId++;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error("timeout " + command)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, type: "message", channel, message: { id, command, params: Object.assign({}, params, { commandId: id }) } }));
  });
}

ws.onmessage = (ev) => {
  const json = JSON.parse(ev.data);
  const m = json.message;
  if (m && m.id && pending.has(m.id) && (m.result || m.error)) {
    const p = pending.get(m.id);
    clearTimeout(p.timer);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error)); else p.resolve(m.result);
  }
};

async function step(label, command, params) {
  try {
    const r = await send(command, params);
    console.log("OK  ", label, JSON.stringify(r));
    return r;
  } catch (e) {
    console.log("FAIL", label, e.message);
    return null;
  }
}

ws.onopen = async () => {
  ws.send(JSON.stringify({ id: "join", type: "join", channel }));
  await new Promise((r) => setTimeout(r, 500));

  const frame = await step("test frame", "create_frame", {
    x: 1600, y: 0, width: 1000, height: 800, name: "TEST toolkit",
    fillColor: { r: 1, g: 1, b: 1, a: 1 }, strokeColor: { r: 0, g: 0, b: 0, a: 1 }, strokeWeight: 1,
  });
  if (!frame) { process.exit(1); }
  const P = frame.id;

  await step("placeholder", "create_placeholder", { parentId: P, x: 40, y: 40, width: 400, height: 260, label: "Hero photo" });
  await step("line diagonal", "create_shape", { parentId: P, type: "LINE", x: 480, y: 40, width: 200, rotation: -45, strokes: ["#FF0000"], strokeWeight: 4, strokeCap: "ROUND", name: "red diagonal" });
  const rect = await step("gradient rect", "create_shape", {
    parentId: P, type: "RECTANGLE", x: 40, y: 340, width: 400, height: 160, cornerRadius: 24, name: "gradient card",
    fills: [{ type: "GRADIENT_LINEAR", angle: 135, stops: [{ position: 0, color: "#6D28D9" }, { position: 1, color: "#EC4899" }] }],
    effects: [{ type: "DROP_SHADOW", color: "#00000040", offsetX: 0, offsetY: 12, blur: 24, spread: 0 }],
  });
  await step("ellipse", "create_shape", { parentId: P, type: "ELLIPSE", x: 480, y: 340, width: 120, height: 120, fills: ["#111111"], strokes: ["#FFFFFF"], strokeWeight: 3, name: "ellipse" });
  await step("star", "create_shape", { parentId: P, type: "STAR", x: 640, y: 340, width: 120, height: 120, pointCount: 5, innerRadius: 0.5, fills: ["#F59E0B"], name: "star" });
  await step("svg", "create_from_svg", { parentId: P, x: 800, y: 340, width: 120, name: "svg icon", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="#000" stroke-width="3"/><path d="M14 24l7 7 13-14" fill="none" stroke="#000" stroke-width="3"/></svg>' });

  const text = await step("text", "create_text", { parentId: P, x: 40, y: 540, text: "Заголовок страницы для проверки переноса строк по ширине блока", fontSize: 20, fontWeight: 400, fontColor: { r: 0, g: 0, b: 0, a: 1 }, name: "title" });
  if (text) {
    await step("text style", "set_text_style", { nodeId: text.id, fontFamily: "Inter", fontWeight: 700, fontSize: 32, lineHeight: 40, letterSpacing: -0.5, width: 420, fills: ["#111111"] });
  }
  const btn = await step("button frame", "create_frame", { parentId: P, x: 520, y: 560, width: 200, height: 56, name: "button", fillColor: { r: 0, g: 0, b: 0, a: 1 } });
  if (btn) {
    await step("button layout", "set_auto_layout", { nodeId: btn.id, layoutMode: "HORIZONTAL", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" });
    await step("button radius", "set_appearance", { nodeId: btn.id, cornerRadius: 12 });
  }
  await step("fonts", "list_fonts", { query: "Inter", limit: 3 });
  await step("find", "find_nodes", { parentId: P, types: ["LINE", "STAR"] });
  await step("pages", "manage_pages", { action: "LIST" });
  if (rect) {
    const dest = await step("dest frame", "create_frame", { x: 1600, y: 900, width: 400, height: 300, name: "TEST screen 2", fillColor: { r: 0.9, g: 0.95, b: 1, a: 1 } });
    if (dest && btn) {
      await step("reaction", "set_reactions", { nodeId: btn.id, reactions: [{ trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId: dest.id, navigation: "NAVIGATE", transition: { type: "SMART_ANIMATE", duration: 0.4, easing: { type: "EASE_IN_AND_OUT" } }, preserveScrollPosition: false }] }] });
    }
  }
  console.log("TEST_FRAME_ID " + P);
  process.exit(0);
};
