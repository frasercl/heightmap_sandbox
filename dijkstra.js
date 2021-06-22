class Heap {
    constructor(getEl = x => x) {
        this.contents = [];
        this.getEl = getEl;
    }

    getParentIndex = i => Math.ceil(i / 2) - 1;
    getChildIndex = (i) => i * 2 + 1;

    compare(i, j) {
        return this.getEl(this.contents[i]) > this.getEl(this.contents[j]);
    }

    swap(i, j) {
        const t = this.contents[i];
        this.contents[i] = this.contents[j];
        this.contents[j] = t;
    }

    isEmpty() {
        return this.contents.length < 1;
    }

    insert(el) {
        let index = this.contents.length;
        this.contents.push(el);
        let parentIndex = this.getParentIndex(index);
        while(parentIndex >= 0 && this.compare(parentIndex, index)) {
            this.swap(index, parentIndex);
            index = parentIndex;
            parentIndex = this.getParentIndex(index);
        }
    }

    remove() {
        if(this.contents.length <= 1) return this.contents.pop();
        const result = this.contents[0];
        this.contents[0] = this.contents.pop();
        let index = 0, childIndex = 1;
        let swapped = true;
        const length = this.contents.length;
        while(swapped && childIndex < length) {
            swapped = false;
            if(childIndex != length - 1 && this.compare(childIndex, childIndex + 1))
                childIndex++;
            if(this.compare(index, childIndex)) {
                this.swap(index, childIndex);
                swapped = true;
                index = childIndex;
                childIndex = this.getChildIndex(index);
            }
        }
        return result;
    }
}

export default function dijkstra(graph) {
    let heap = new Heap(n => n.data.dist);
    graph.root.data.dist = 0;
    heap.insert(graph.root);
    while(!heap.isEmpty()) {
        let currentNode = heap.remove();
        for(let e of currentNode.edges) {
            const tempDist = currentNode.data.dist + e.weight;
            if(e.node.data.dist === undefined) {
                e.node.data.dist = tempDist;
                heap.insert(e.node);
            } else if(tempDist < e.node.data.dist) {
                e.node.data.dist = tempDist;
            }
        }
    }
}