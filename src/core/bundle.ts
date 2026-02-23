import { searchMemories, getAllMemories } from './memory.js';
import { searchEdges, getAllEdges } from './graph.js';

export function generateBundle(topic?: string, tokenBudget: number = 500): string {
  let memories = [];
  let edges = [];

  if (topic) {
    memories = searchMemories(topic);
    edges = searchEdges(topic);
  } else {
    memories = getAllMemories();
    edges = getAllEdges();
  }

  // Simple token estimation: ~4 chars per token
  let currentTokens = 0;
  let bundleLines: string[] = [];

  bundleLines.push('# Engram Context Bundle');
  if (topic) {
    bundleLines.push(`Topic: ${topic}`);
  }
  bundleLines.push('');

  bundleLines.push('## Memories & Preferences');
  for (const mem of memories) {
    const line = `- [Importance: ${mem.importance}] ${mem.enforced ? '(ENFORCED) ' : ''}${mem.content}`;
    const tokens = Math.ceil(line.length / 4);
    if (currentTokens + tokens > tokenBudget) break;
    
    bundleLines.push(line);
    currentTokens += tokens;
  }

  if (edges.length > 0) {
    bundleLines.push('');
    bundleLines.push('## Architecture Graph');
    for (const edge of edges) {
      const line = `- ${edge.source} ${edge.relation} ${edge.target}`;
      const tokens = Math.ceil(line.length / 4);
      if (currentTokens + tokens > tokenBudget) break;
      
      bundleLines.push(line);
      currentTokens += tokens;
    }
  }

  return bundleLines.join('\n');
}
