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
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
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

// mpuse event to start drawing
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = getMouseX(canvas, e);
  cursor.y = getMouseY(canvas, e);
});

// mouse event to track mouse path and draw on canvas
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx!.beginPath();
    ctx!.moveTo(cursor.x, cursor.y);
    ctx!.lineTo(getMouseX(canvas, e), getMouseY(canvas, e));
    ctx!.stroke();
    cursor.x = getMouseX(canvas, e);
    cursor.y = getMouseY(canvas, e);
  }
});

// mouse event to stop drawing
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});
