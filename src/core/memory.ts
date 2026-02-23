import { db } from '../db/index.js';

export interface Memory {
  id: number;
  content: string;
  scope: 'global' | 'project' | 'session';
  importance: number;
  enforced: boolean;
  created_at: string;
  updated_at: string;
}

export function addMemory(content: string, scope: string = 'project', importance: number = 5, enforced: boolean = false): number {
  const stmt = db.prepare('INSERT INTO memories (content, scope, importance, enforced) VALUES (?, ?, ?, ?)');
  const info = stmt.run(content, scope, importance, enforced ? 1 : 0);
  return info.lastInsertRowid as number;
}

export function updateMemory(id: number, content: string, importance: number, enforced: boolean): void {
  const stmt = db.prepare('UPDATE memories SET content = ?, importance = ?, enforced = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(content, importance, enforced ? 1 : 0, id);
}

export function deleteMemory(id: number): void {
  const stmt = db.prepare('DELETE FROM memories WHERE id = ?');
  stmt.run(id);
}

export function searchMemories(query: string, scope?: string): Memory[] {
  let sql = 'SELECT * FROM memories WHERE content LIKE ?';
  const params: any[] = [`%${query}%`];
  
  if (scope) {
    sql += ' AND scope = ?';
    params.push(scope);
  }
  
  sql += ' ORDER BY importance DESC';
  const stmt = db.prepare(sql);
  return stmt.all(...params) as Memory[];
}

export function getAllMemories(): Memory[] {
  const stmt = db.prepare('SELECT * FROM memories ORDER BY importance DESC');
  return stmt.all() as Memory[];
}

export function decayMemories(days: number = 7): number {
  // Reduce importance by 1 for memories older than `days` days, that are not enforced
  const stmt = db.prepare(`
    UPDATE memories 
    SET importance = importance - 1 
    WHERE enforced = 0 
      AND updated_at < datetime('now', '-' || ? || ' days')
      AND importance > 0
  `);
  const info = stmt.run(days);
  return info.changes;
}

export function pruneMemories(): number {
  // Delete memories with importance <= 0
  const stmt = db.prepare('DELETE FROM memories WHERE importance <= 0 AND enforced = 0');
  const info = stmt.run();
  return info.changes;
}
