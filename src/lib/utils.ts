import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function findPath2(
  startName: string,
  endName: string,
  points: PositionPoint[],
  lines: PositionLine[]
): string[] | null {
  const adjacencyList: { [key: string]: string[] } = {};

  // 构建邻接表
  lines.forEach(line => {
    if (!adjacencyList[line.fromName]) {
      adjacencyList[line.fromName] = [];
    }
    adjacencyList[line.fromName].push(line.toName);
  });

  const visited = new Set<string>();
  const path: string[] = [];

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

  if (dfs(startName)) {
    return path;
  } else {
    return null;
  }
}

export function findPath3(
  startPosition: string,
  endPosition: string,
  points: PositionPoint[],
  lines: PositionLine[]
): string[] | null {
  const adjacencyList: { [key: string]: string[] } = {};

  // 构建邻接表
  lines.forEach(line => {
    if (!adjacencyList[line.fromName]) {
      adjacencyList[line.fromName] = [];
    }
    adjacencyList[line.fromName].push(line.toName);
  });

  const visited = new Set<string>();
  const path: string[] = [];

  // 查找 position 对应的 name
  function findNameByPosition(position: String): string | undefined {
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

  if (startName && endName && dfs(startName)) {
    return path;
  } else {
    return null;
  }
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

// // 测试数据
// const points: PositionPoint[] = [
//   { position: "pos1", name: "A", x: 0, y: 0, type: undefined },
//   { position: "pos2", name: "B", x: 1, y: 1, type: undefined },
//   { position: "pos3", name: "C", x: 2, y: 2, type: undefined },
//   { position: "pos4", name: "D", x: 3, y: 3, type: undefined }
// ];

// const lines: PositionLine[] = [
//   { fromName: "A", toName: "B", lineId: "AB" },
//   { fromName: "B", toName: "C", lineId: "BC" },
//   { fromName: "C", toName: "D", lineId: "CD" }
// ];

// // 查找从 "pos1" 到 "pos4" 的路径
// console.log(findPath("pos1", "pos4", points, lines)); // 期望输出: ["A", "B", "C", "D"]

// // 查找从 "pos4" 到 "pos1" 的路径
// console.log(findPath("pos4", "pos1", points, lines)); // 期望输出: ["D", "C", "B", "A"]


