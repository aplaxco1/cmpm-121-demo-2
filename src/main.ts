import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Autumn's Sketch Pad";

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
  lines.splice(0, lines.length);
  canvas.dispatchEvent(drawingChangedEvent);
});

// div to seperate elements
const div = document.createElement("div");
div.innerHTML = `<br>`;
app.append(div);

// create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
app.append(canvas);

const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

// calculates mouse X position on canvas
function getMouseX(canvas: HTMLCanvasElement, e: MouseEvent) {
  return ((e.clientX - rect.left) / rect.width) * canvas.width;
}

// calculates mouse y position on canvas
function getMouseY(canvas: HTMLCanvasElement, e: MouseEvent) {
  return ((e.clientY - rect.top) / rect.height) * canvas.height;
}

// cursor object
const cursor = { active: false, x: 0, y: 0 };

// list of lines to be drawn each "drawing-changed" event
const lines: { x: number; y: number }[][] = [];
let currLine: { x: number; y: number }[] | null = null;

// redraws canvas on drawing changed event
const drawingChangedEvent = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

function redraw() {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx!.beginPath();
      const { x, y } = line[0];
      ctx!.moveTo(x, y);
      for (const { x, y } of line) {
        ctx!.lineTo(x, y);
      }
      ctx!.stroke();
    }
  }
}

// mouse event to start drawing
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = getMouseX(canvas, e);
  cursor.y = getMouseY(canvas, e);
  currLine = [];
  lines.push(currLine);
  currLine.push({ x: cursor.x, y: cursor.y });

  canvas.dispatchEvent(drawingChangedEvent);
});

// mouse event to track mouse path and draw on canvas
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = getMouseX(canvas, e);
    cursor.y = getMouseY(canvas, e);
    currLine!.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(drawingChangedEvent);
  }
});

// mouse event to stop drawing
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currLine = null;

  canvas.dispatchEvent(drawingChangedEvent);
});
