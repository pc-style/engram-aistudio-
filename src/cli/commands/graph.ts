import { Command } from 'commander';
import { addEdge, deleteEdge, searchEdges, getAllEdges } from '../../core/graph.js';

export function registerGraphCommands(program: Command) {
  const graphCmd = program.command('graph').description('Manage architecture graph edges');

  graphCmd
    .command('add <source> <relation> <target>')
    .description('Add a new relationship edge')
    .action((source, relation, target) => {
      const id = addEdge(source, relation, target);
      console.log(`Edge added with ID: ${id}`);
    });

  graphCmd
    .command('delete <id>')
    .description('Delete an edge')
    .action((id) => {
      deleteEdge(parseInt(id));
      console.log(`Edge ${id} deleted`);
    });

  graphCmd
    .command('search <query>')
    .description('Search edges by keyword')
    .action((query) => {
      const results = searchEdges(query);
      if (results.length === 0) {
        console.log('No edges found.');
        return;
      }
      results.forEach(e => {
        console.log(`[${e.id}] ${e.source} --(${e.relation})--> ${e.target}`);
      });
    });

  graphCmd
    .command('list')
    .description('List all edges')
    .action(() => {
      const results = getAllEdges();
      if (results.length === 0) {
        console.log('No edges found.');
        return;
      }
      results.forEach(e => {
        console.log(`[${e.id}] ${e.source} --(${e.relation})--> ${e.target}`);
      });
    });
}
