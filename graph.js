//Dead simple directed graph with a single source node
export default class Graph {
    constructor(rootData) {
        this.root = new GraphNode(rootData);
        this.nodes = [this.root];
    }

    addNode(data) {
        const node = new GraphNode(data);
        this.nodes.push(node);
        return node;
    }
}

class GraphNode {
    constructor(data) {
        this.data = data;
        this.edges = [];
    }

    connect(node, weight) {
        this.edges.push({node, weight});
    }
}