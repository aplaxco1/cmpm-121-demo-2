import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Autumn's Sketch Pad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);
