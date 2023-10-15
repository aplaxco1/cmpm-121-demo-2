import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Autumn's Sketch Pad";

document.title = gameName;

// create header
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
app.append(canvas);
