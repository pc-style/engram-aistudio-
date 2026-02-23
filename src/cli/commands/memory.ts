import { Command } from 'commander';
import { addMemory, updateMemory, deleteMemory, searchMemories, getAllMemories, decayMemories, pruneMemories } from '../../core/memory.js';

export function registerMemoryCommands(program: Command) {
  const memoryCmd = program.command('memory').description('Manage memories');

  memoryCmd
    .command('add <content>')
    .description('Add a new memory')
    .option('-s, --scope <scope>', 'Scope of the memory (global, project, session)', 'project')
    .option('-i, --importance <number>', 'Importance score (1-10)', '5')
    .option('-e, --enforced', 'Tag as enforced (blocks commits if violated)')
    .action((content, options) => {
      const id = addMemory(content, options.scope, parseInt(options.importance), !!options.enforced);
      console.log(`Memory added with ID: ${id}`);
    });

  memoryCmd
    .command('update <id> <content>')
    .description('Update an existing memory')
    .option('-i, --importance <number>', 'Importance score (1-10)', '5')
    .option('-e, --enforced', 'Tag as enforced (blocks commits if violated)')
    .action((id, content, options) => {
      updateMemory(parseInt(id), content, parseInt(options.importance), !!options.enforced);
      console.log(`Memory ${id} updated`);
    });

  memoryCmd
    .command('delete <id>')
    .description('Delete a memory')
    .action((id) => {
      deleteMemory(parseInt(id));
      console.log(`Memory ${id} deleted`);
    });

  memoryCmd
    .command('search <query>')
    .description('Search memories by keyword')
    .option('-s, --scope <scope>', 'Filter by scope')
    .action((query, options) => {
      const results = searchMemories(query, options.scope);
      if (results.length === 0) {
        console.log('No memories found.');
        return;
      }
      results.forEach(m => {
        console.log(`[${m.id}] (${m.scope}) [Imp: ${m.importance}] ${m.enforced ? '[ENFORCED] ' : ''}${m.content}`);
      });
    });

  memoryCmd
    .command('list')
    .description('List all memories')
    .action(() => {
      const results = getAllMemories();
      if (results.length === 0) {
        console.log('No memories found.');
        return;
      }
      results.forEach(m => {
        console.log(`[${m.id}] (${m.scope}) [Imp: ${m.importance}] ${m.enforced ? '[ENFORCED] ' : ''}${m.content}`);
      });
    });

  memoryCmd
    .command('prune')
    .description('Decay old memories and prune those with 0 importance')
    .option('-d, --days <number>', 'Days before a memory decays', '7')
    .action((options) => {
      const decayed = decayMemories(parseInt(options.days));
      const pruned = pruneMemories();
      console.log(`Decayed ${decayed} memories.`);
      console.log(`Pruned ${pruned} memories.`);
    });
}
