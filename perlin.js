//generate finite heightmaps with layered Perlin noise
//it's a bit slow. oh well

function interpolate(a0, a1, w) { //Stolen from Wikipedia!
    return (a1 - a0) * (3 - w * 2) * w * w + a0;
}

function dotProduct(x, y, vec) {
    return x * vec.x + y * vec.y;
}

export default class PerlinMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.octaves = [];
    }

    addOctave(scale, weight, func) {
        const fieldWidth = Math.ceil(this.width / scale) + 1;
        const fieldHeight = Math.ceil(this.height / scale) + 1;
        let field = [];

        for(let vy = 0; vy < fieldHeight; vy++) {
            let fieldRow = [];
            for(let vx = 0; vx < fieldWidth; vx++) {
                const theta = Math.random() * 2 * Math.PI;
                const x = Math.cos(theta);
                const y = Math.sin(theta);
                fieldRow.push({x, y});
            }
            field.push(fieldRow);
        }

        this.octaves.push({scale, weight, field, func});
    }

    getSingleOctave(x, y, octave) {
        const sx = x / octave.scale;
        const sy = y / octave.scale;

        //Gradient vector grid coordinates
        const gx0 = Math.floor(sx);
        const gx1 = gx0 + 1;
        const gy0 = Math.floor(sy);
        const gy1 = gy0 + 1;

        //Offset vector components (vx0, vy0 also used as interpolation weights)
        const vx0 = sx - gx0;
        const vx1 = vx0 - 1;
        const vy0 = sy - gy0;
        const vy1 = vy0 - 1;

        let n0, n1, i0, i1;
        n0 = dotProduct(vx0, vy0, octave.field[gy0][gx0]);
        n1 = dotProduct(vx1, vy0, octave.field[gy0][gx1]);
        i0 = interpolate(n0, n1, vx0);

        n0 = dotProduct(vx0, vy1, octave.field[gy1][gx0]);
        n1 = dotProduct(vx1, vy1, octave.field[gy1][gx1]);
        i1 = interpolate(n0, n1, vx0);
        let val = interpolate(i0, i1, vy0);
        if(octave.func) val = octave.func(val);
        return val;
    }

    get(x, y) {
        let val = 0;
        let weightSum = 0;
        for(const oct of this.octaves) {
            val += this.getSingleOctave(x, y, oct) * oct.weight;
            weightSum += oct.weight;
        }
        return val / weightSum;
    }
}