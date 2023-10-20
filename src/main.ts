import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

// global variables
const gameName = "Autumn's Sketch Pad";

const firstIndex = 0;
const canvasCorner = 0;
const thinMarker = 1;
const thickMarker = 4;

let markerThickness = thinMarker;
let currentStickerText = "⚬";
let usingSticker = false;

document.title = gameName;

function createSeparator() {
  const div = document.createElement("div");
  div.innerHTML = `<br>`;
  app.append(div);
}

// create header
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.height = 256;
canvas.width = 256;
app.append(canvas);

// ---- DRAWING STUFF ----//
const ctx = canvas.getContext("2d");

// calculates correct mouse X position on canvas
function getMouseX(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  return ((e.clientX - rect.left) / rect.width) * canvas.width;
}

// calculates correct mouse y position on canvas
function getMouseY(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  return ((e.clientY - rect.top) / rect.height) * canvas.height;
}

// cursor object
let cursor: Cursor | null = null;

class Cursor {
  x: number;
  y: number;
  size: number;
  text: string;

  constructor(x: number, y: number, text: string) {
    this.x = x;
    this.y = y;
    this.size = markerThickness * 3 + 10;
    this.text = text;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.size = markerThickness * 3 + 10;
    ctx.font = this.size + "px monospace";
    ctx.fillText(this.text, this.x - this.size / 4, this.y + this.size / 4);
  }
}

// list of lines to be drawn each "drawing-changed" event
const commands: (Line | Sticker)[] = [];
let currCommand: Line | null = null;
const redoCommands: (Line | Sticker)[] = [];

// line class (holds array of points with a display and drag method)
class Line {
  points: { x: number; y: number }[];
  size: number;

  constructor(x: number, y: number, size: number) {
    this.points = [{ x, y }];
    this.size = size;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.size;
    if (this.points.length) {
      ctx.beginPath();
      const [firstPoint, ...remainingPoints] = this.points;
      const { x, y } = firstPoint;
      ctx.moveTo(x, y);
      for (const { x, y } of remainingPoints) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

class Sticker {
  points: { x: number; y: number }[];
  size: number;
  text: string;

  constructor(x: number, y: number, text: string) {
    this.points = [{ x, y }];
    this.text = text;
    this.size = 24;
  }

  drag(x: number, y: number) {
    this.points[firstIndex].x = x;
    this.points[firstIndex].y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = this.size + "px monospace";
    ctx.fillText(
      this.text,
      this.points[firstIndex].x,
      this.points[firstIndex].y
    );
  }
}

// redraws canvas on drawing changed event
const drawingChangedEvent = new Event("drawing-changed");
const toolMovedEvent = new Event("tool-moved");

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

canvas.addEventListener("tool-moved", () => {
  redraw();
});

function redraw() {
  ctx!.clearRect(canvasCorner, canvasCorner, canvas.width, canvas.height);
  cursor?.draw(ctx!);
  for (const command of commands) {
    command.display(ctx!);
  }
}

canvas.addEventListener("mouseout", () => {
  cursor = null;
  canvas.dispatchEvent(toolMovedEvent);
});

canvas.addEventListener("mouseenter", (e) => {
  cursor = new Cursor(
    getMouseX(canvas, e),
    getMouseY(canvas, e),
    currentStickerText
  );
  canvas.dispatchEvent(toolMovedEvent);
});

// mouse event to start drawing
canvas.addEventListener("mousedown", (e) => {
  cursor!.x = getMouseX(canvas, e);
  cursor!.y = getMouseY(canvas, e);
  if (usingSticker) {
    currCommand = new Sticker(cursor!.x, cursor!.y, currentStickerText);
  } else {
    currCommand = new Line(cursor!.x, cursor!.y, markerThickness);
  }
  commands.push(currCommand);
  redoCommands.splice(firstIndex, redoCommands.length);

  canvas.dispatchEvent(drawingChangedEvent);
});

// mouse event to track mouse path and draw on canvas
canvas.addEventListener("mousemove", (e) => {
  if (cursor) {
    cursor.x = getMouseX(canvas, e);
    cursor.y = getMouseY(canvas, e);
    currCommand?.drag(cursor.x, cursor.y);

    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// mouse event to stop drawing
document.addEventListener("mouseup", () => {
  currCommand = null;

  canvas.dispatchEvent(drawingChangedEvent);
});

createSeparator();

// clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(firstIndex, commands.length);
  canvas.dispatchEvent(drawingChangedEvent);
});

// undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length) {
    redoCommands.push(commands.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length) {
    commands.push(redoCommands.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

const exportButton = document.createElement("button");
exportButton.innerHTML = "export";
app.append(exportButton);

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportctx = exportCanvas.getContext("2d");
  exportctx!.scale(4, 4);
  for (const command of commands) {
    command.display(exportctx!);
  }
  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

createSeparator();

// marker buttons //
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerHTML = "thin";
thinMarkerButton.classList.add("selectedTool");
app.append(thinMarkerButton);

thinMarkerButton.addEventListener("click", () => {
  thickMarkerButton.classList.remove("selectedTool");
  thinMarkerButton.classList.add("selectedTool");
  disableStickerButtons(null);
  usingSticker = false;
  currentStickerText = "⚬";
  markerThickness = thinMarker;
});

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerHTML = "thick";
app.append(thickMarkerButton);

thickMarkerButton.addEventListener("click", () => {
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.add("selectedTool");
  disableStickerButtons(null);
  usingSticker = false;
  currentStickerText = "⚬";
  markerThickness = thickMarker;
});

createSeparator();

// create sticker buttons and events
const stickerText: string[] = ["☕", "🍩", "🍦"];
const stickerButtons: HTMLButtonElement[] = [];

for (let i = firstIndex; i < stickerText.length; i++) {
  addStickerButton(stickerText[i]);
}

function disableStickerButtons(currSticker: string | null): void {
  for (const sticker of stickerButtons) {
    if (sticker.innerHTML != currSticker) {
      sticker.classList.remove("selectedTool");
    }
  }
}

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "custom";

customStickerButton.addEventListener("click", () => {
  const text = prompt("Custom Sticker Text", "🙂");
  addStickerButton(text!);
});

app.append(customStickerButton);

function addStickerButton(sticker: string) {
  const button = document.createElement("button");
  button.innerHTML = sticker;

  button.addEventListener("click", () => {
    button.classList.add("selectedTool");
    disableStickerButtons(button.innerHTML);
    thinMarkerButton.classList.remove("selectedTool");
    thickMarkerButton.classList.remove("selectedTool");
    markerThickness = 2;
    usingSticker = true;
    currentStickerText = button.innerHTML;
    canvas.dispatchEvent(toolMovedEvent);
  });

  stickerButtons.push(button);
  app.append(button);
}
