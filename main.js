import PerlinMap from "./perlinMap.js";

const clamp = n => Math.max(-1, Math.min(n, 1));
const logisticSquish = x => 2 / (1 + Math.pow(2, -15 * x)) - 1;
const sine = x => Math.sin(Math.PI * x);
const halfSine = x => Math.sin(Math.PI / 2 * x);

function heightToColor(height) {
    if(Math.abs(height * 8 % 1) > 0.97) {
        //Draw a topo "line";
        return "hsl(0, 0%, 30%)";
    } else {
        let hue = 125 + height * -125;
        return `hsl(${hue}, 100%, 50%)`;
    }
}

function heightToGrayscale(height) {
    let light = (height + 1) * 50;
    return `hsl(0, 0%, ${light}%)`;
}

const canvas = document.getElementsByTagName("canvas")[0];
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";

let map = new PerlinMap(canvasWidth, canvasHeight);
//Want to mess with the heightmap generator? Here's where to do it!
map.addOctave(800, 1, logisticSquish); //high plateaus, low valleys, steep slopes
map.addOctave(300, 0.4, logisticSquish);
map.addOctave(80, 0.2); //xtra txture

for(let y = 0; y < canvasHeight; y++) {
    for(let x = 0; x < canvasWidth; x++) {
        const mapVal = map.get(x, y);
        ctx.fillStyle = heightToColor(mapVal);
        ctx.fillRect(x, y, 1, 1);
    }
}