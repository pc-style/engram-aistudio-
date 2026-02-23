import { db } from '../db/index.js';

export interface GraphEdge {
  id: number;
  source: string;
  relation: string;
  target: string;
  created_at: string;
}

export function addEdge(source: string, relation: string, target: string): number {
  const stmt = db.prepare('INSERT INTO graph_edges (source, relation, target) VALUES (?, ?, ?)');
  const info = stmt.run(source, relation, target);
  return info.lastInsertRowid as number;
}

export function deleteEdge(id: number): void {
  const stmt = db.prepare('DELETE FROM graph_edges WHERE id = ?');
  stmt.run(id);
}

export function searchEdges(query: string): GraphEdge[] {
  const stmt = db.prepare('SELECT * FROM graph_edges WHERE source LIKE ? OR target LIKE ? OR relation LIKE ? ORDER BY created_at DESC');
  const param = `%${query}%`;
  return stmt.all(param, param, param) as GraphEdge[];
}

export function getAllEdges(): GraphEdge[] {
  const stmt = db.prepare('SELECT * FROM graph_edges ORDER BY created_at DESC');
  return stmt.all() as GraphEdge[];
}
