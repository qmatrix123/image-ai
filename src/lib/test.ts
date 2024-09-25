interface PositionPoint {
    position: String | undefined;
    name: String | undefined;
    x: Number;
    y: Number;
    type: String | undefined
}

interface PositionLine {
    // 起点uuid
    fromName: string;
    // 终点uuid
    toName: string;

    lineId: string;
}

export function findPath(
    startPosition: string,
    endPosition: string,
    points: PositionPoint[],
    lines: PositionLine[]
): string[] | null {
    const adjacencyList: { [key: string]: string[] } = {};

    // 构建双向邻接表
    lines.forEach(line => {
        // 从 fromName 到 toName 的路径
        if (!adjacencyList[line.fromName]) {
            adjacencyList[line.fromName] = [];
        }
        adjacencyList[line.fromName].push(line.toName);

        // 从 toName 到 fromName 的路径（确保双向查找）
        if (!adjacencyList[line.toName]) {
            adjacencyList[line.toName] = [];
        }
        adjacencyList[line.toName].push(line.fromName);
    });

    const visited = new Set<string>();
    const path: string[] = [];

    // 查找 position 对应的 name
    function findNameByPosition(position: string): string | undefined {
        const point = points.find(p => p.position === position);
        return point ? point.name + "" : undefined;
    }

    // DFS 搜索路径
    function dfs(current: string): boolean {
        if (current === endName) {
            path.push(current);
            return true;
        }

        if (visited.has(current)) {
            return false;
        }

        visited.add(current);
        path.push(current);

        const neighbors = adjacencyList[current];
        if (neighbors) {
            for (const neighbor of neighbors) {
                if (dfs(neighbor)) {
                    return true;
                }
            }
        }

        path.pop();
        return false;
    }

    const startName = findNameByPosition(startPosition);
    const endName = findNameByPosition(endPosition);

    if (!startName || !endName) {
        console.error("Start or end position not found.");
        return null;
    }

    if (dfs(startName)) {
        return path;
    } else {
        console.error("Path not found.");
        return null;
    }
}



