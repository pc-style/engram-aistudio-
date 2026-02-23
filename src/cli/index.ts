import { Command } from 'commander';
import { registerMemoryCommands } from './commands/memory.js';
import { registerGraphCommands } from './commands/graph.js';
import { registerBundleCommands } from './commands/bundle.js';
import { registerWatchCommands } from './commands/watch.js';
import { registerHookCommands } from './commands/hook.js';

const program = new Command();

program
  .name('engram')
  .description('AI Agent Memory System')
  .version('0.1.0');

registerMemoryCommands(program);
registerGraphCommands(program);
registerBundleCommands(program);
registerWatchCommands(program);
registerHookCommands(program);

program.parse(process.argv);
