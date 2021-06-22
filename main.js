import PerlinMap from "./perlin.js";
import Graph from "./graph.js";
import dijkstra from "./dijkstra.js";

const TERRAIN_SCALE = 500;

const clamp = n => Math.max(-1, Math.min(n, 1));
const sigmoidStretch = x => 2 / (1 + Math.pow(2, -15 * x)) - 1;
const sine = x => Math.sin(Math.PI * x);
const halfSine = x => Math.sin(Math.PI / 2 * x);

const mod = (n, m) => (n + m) % m;
const pythag = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
const pointDist = (i, j) => pythag(i.x - j.x, i.y - j.y);

function hueToChannel(h) {
    h = mod(h, 1530);
    if(h <= 255) return h;
    if(h <= 765) return 255;
    if(h <= 1020) return 255 - (h % 255);
    return 0;
}

function heightToColorData(height) {
    if(Math.abs(height * 8 % 1) > 0.97) {
        return [75, 75, 75];
    } else {
        const hue = (height + 1) * 525;
        const r = hueToChannel(hue - 510);
        const g = hueToChannel(hue);
        const b = hueToChannel(hue + 510);
        return [r, g, b];
    }
}

function drawMap(m, ctx) {
    const w = m.width;
    const h = m.height;
    let id = ctx.getImageData(0, 0, w, h);
    let data = id.data;
    let i = 0;
    for(let y = 0; y < h; y++) {
        for(let x = 0; x < w; x++) {
            const mapVal = m.get(x, y);
            const color = heightToColorData(mapVal);
            data[i] = color[0];
            data[i + 1] = color[1];
            data[i + 2] = color[2];
            data[i + 3] = 255;
            i += 4;
        }
    }
    ctx.putImageData(id, 0, 0);
}

//GRAPH STUFF ///////////////////////////////////

function connectWithWeight(n, d, map) {
    const nx = n.data.x;
    const ny = n.data.y;
    const dx = d.data.x;
    const dy = d.data.y;
    const dist2d = pointDist(n.data, d.data);
    const nElev = map.get(Math.round(nx), Math.round(ny));
    const dElev = map.get(Math.round(dx), Math.round(dy));
    let weight = pythag(dist2d, (nElev - dElev) * TERRAIN_SCALE);
    /*
    if(dx > 800 && dx < 900 && dy > 450 && dy < 550) {
        weight = 5000;
    }
    */
    n.connect(d, weight);
}

function generateRingGraph(map, cx, cy, radius, ringSpacing, pointSpacing, connectRadius) {
    let graph = new Graph({x: cx, y: cy});
    let lastRing = [graph.root];

    for(let r = ringSpacing; r < radius; r += ringSpacing) {
        const numPoints = Math.ceil(2 * Math.PI * r / pointSpacing);
        const arcLength = 2 * Math.PI / numPoints;
        let thisRing = [];
        //Create next ring
        for(let p = 0; p < numPoints; p++) {
            const t = arcLength * p;
            const x = Math.cos(t) * r + cx;
            const y = Math.sin(t) * r + cy;
            thisRing.push(graph.addNode({x, y}));
        }
        //console.log(`Ring with radius ${r} and ${numPoints} points`);

        //Connect to last ring
        let ti = -3; //TODO: set this in a smarter way?
        for(const n of lastRing) {
            while(pointDist(n.data, thisRing[mod(ti, numPoints)].data) > connectRadius) ti++;
            let ci = ti;
            let cons = 0;
            while(pointDist(n.data, thisRing[mod(ci, numPoints)].data) < connectRadius && cons < numPoints) {
                connectWithWeight(n, thisRing[mod(ci, numPoints)], map);
                ci++;
                cons++;
            }
        }
        lastRing = thisRing;
    }

    return graph;
}

function drawGraph(graph, ctx) {
    ctx.beginPath();
    for(const n of graph.nodes) {
        for(const e of n.edges) {
            ctx.moveTo(n.data.x, n.data.y);
            ctx.lineTo(e.node.data.x, e.node.data.y);
        }
    }
    ctx.stroke();
}

function drawDistThreshold(graph, ctx, distThreshold) {
    for(const n of graph.nodes) {
        if(n.data.dist < distThreshold) {
            ctx.fillRect(n.data.x, n.data.y, 1, 1);
        }
    }
}
//console.log(graph);
//drawGraph(graph, ctx);

/*
const phi = (1 + Math.sqrt(5)) / 2;
const RADIUS = 500;
const NUMPOINTS = 10000;

let points = [];

for(let i = 0; i < NUMPOINTS; i++) {
    const r = Math.sqrt(i / NUMPOINTS) * RADIUS;
    const t = 2 * Math.PI * phi * i;

    const x = Math.cos(t) * r + centerX;
    const y = Math.sin(t) * r + centerY;
    points.push([x, y]);
}

function drawOffsetSpiral(offset) {
    for(let spiral = 0; spiral < offset; spiral++) {
        ctx.moveTo(points[0][0], points[0][1]);
        for(let i = spiral; i < NUMPOINTS; i += offset) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
    }
}
drawOffsetSpiral(144);
drawOffsetSpiral(233);
*/

function main() {
    const canvas = document.getElementsByTagName("canvas")[0];
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";

    let map = new PerlinMap(canvasWidth, canvasHeight);
    //Want to mess with the heightmap generator? Here's where to do it!
    map.addOctave(800, 1, sigmoidStretch); //high plateaus, low valleys, steep slopes
    map.addOctave(300, 0.4);
    map.addOctave(80, 0.2); //xtra txture

    drawMap(map, ctx);

    ctx.fillStyle = "#eb34d8";
    ctx.strokeStyle = "#eb34d8";
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const graph = generateRingGraph(map, centerX, centerY, 300, 2, 2, 5);
    dijkstra(graph);
    drawDistThreshold(graph, ctx, 300);

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.stroke();
}

main();