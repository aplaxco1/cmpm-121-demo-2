import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

// global variables
const gameName = "Autumn's Sketch Pad";
const firstIndex = 0;
const canvasCorner = 0;
const thinMarker = 1;
const thickMarker = 4;
let markerThickness = thinMarker;

document.title = gameName;

// create header
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(firstIndex, lines.length);
  canvas.dispatchEvent(drawingChangedEvent);
});

// undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length) {
    redoLines.push(lines.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length) {
    lines.push(redoLines.pop()!);
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// div to seperate elements
const div = document.createElement("div");
div.innerHTML = `<br>`;
app.append(div);

// marker buttons //
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerHTML = "thin";
thinMarkerButton.classList.add("selectedTool");
app.append(thinMarkerButton);

thinMarkerButton.addEventListener("click", () => {
  thickMarkerButton.classList.remove("selectedTool");
  thinMarkerButton.classList.add("selectedTool");
  markerThickness = thinMarker;
});

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerHTML = "thick";
app.append(thickMarkerButton);

thickMarkerButton.addEventListener("click", () => {
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.add("selectedTool");
  markerThickness = thickMarker;
});

// another div to seperate elements
const div1 = document.createElement("div");
div1.innerHTML = `<br>`;
app.append(div1);

// create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
app.append(canvas);

// ---- DRAWING STUFF ----//
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

// cursor object
let cursor: Cursor | null = null;

class Cursor {
  x: number;
  y: number;
  size: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = markerThickness * 3 + 10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.size = markerThickness * 3 + 10;
    ctx.font = this.size + "px monospace";
    ctx.fillText("⚬", this.x - this.size / 4, this.y + this.size / 2);
  }
}

// list of lines to be drawn each "drawing-changed" event
const lines: Line[] = [];
let currLine: Line | null = null;
const redoLines: Line[] = [];

// line class (holds array of points with a display and drag method)
class Line {
  points: { x: number; y: number }[];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.thickness;
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

// calculates mouse X position on canvas
function getMouseX(canvas: HTMLCanvasElement, e: MouseEvent) {
  return ((e.clientX - rect.left) / rect.width) * canvas.width;
}

// calculates mouse y position on canvas
function getMouseY(canvas: HTMLCanvasElement, e: MouseEvent) {
  return ((e.clientY - rect.top) / rect.height) * canvas.height;
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
  for (const line of lines) {
    line.display(ctx!);
  }
}

canvas.addEventListener("mouseout", () => {
  cursor = null;
  canvas.dispatchEvent(toolMovedEvent);
});

canvas.addEventListener("mouseenter", (e) => {
  cursor = new Cursor(getMouseX(canvas, e), getMouseY(canvas, e));
  canvas.dispatchEvent(toolMovedEvent);
});

// mouse event to start drawing
canvas.addEventListener("mousedown", (e) => {
  cursor!.x = getMouseX(canvas, e);
  cursor!.y = getMouseY(canvas, e);
  currLine = new Line(cursor!.x, cursor!.y, markerThickness);
  lines.push(currLine);
  redoLines.splice(firstIndex, redoLines.length);

  canvas.dispatchEvent(drawingChangedEvent);
});

// mouse event to track mouse path and draw on canvas
canvas.addEventListener("mousemove", (e) => {
  if (cursor) {
    cursor.x = getMouseX(canvas, e);
    cursor.y = getMouseY(canvas, e);
    currLine?.drag(cursor.x, cursor.y);

    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// mouse event to stop drawing
document.addEventListener("mouseup", () => {
  currLine = null;

  canvas.dispatchEvent(drawingChangedEvent);
});
