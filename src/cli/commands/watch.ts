import { Command } from 'commander';
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { checkDiffAgainstMemories } from '../../ai/checker.js';
import fs from 'fs';

let isPaused = false;
let changeCount = 0;
const N_CHANGES = 3;

export function registerWatchCommands(program: Command) {
  const watchCmd = program.command('watch').description('Watch mode for preference enforcement');

  watchCmd
    .command('start')
    .description('Start watching file changes')
    .option('-n, --changes <number>', 'Number of changes before checking', '3')
    .action((options) => {
      const nChanges = parseInt(options.changes) || N_CHANGES;
      console.log(`Starting Engram watch mode. Checking every ${nChanges} changes...`);
      
      const watcher = chokidar.watch('.', {
        ignored: /(^|[\/\\])\..|node_modules|dist|\.engram/, // ignore dotfiles, node_modules, dist
        persistent: true
      });

      watcher.on('change', async (path) => {
        if (fs.existsSync('.engram/paused')) return;
        
        changeCount++;
        if (changeCount >= nChanges) {
          changeCount = 0;
          
          try {
            // Get diff of currently modified files
            const diff = execSync('git diff HEAD').toString();
            if (!diff.trim()) return;

            console.log(`\n[Engram] Checking recent changes against memories...`);
            const result = await checkDiffAgainstMemories(diff, 'watch');
            
            if (!result.ok) {
              console.log(`\n⚠️  [Engram] Preference Violation Detected:`);
              result.violations.forEach(v => console.log(v));
            } else {
              console.log(`✅  [Engram] Changes look good.`);
            }
          } catch (error) {
            console.error('Error during watch check:', error);
          }
        }
      });
    });

  watchCmd
    .command('pause')
    .description('Pause watch mode')
    .action(() => {
      // In a real CLI, we'd use IPC to pause the daemon.
      // For MVP, we'll just create a lockfile.
      fs.writeFileSync('.engram/paused', 'true');
      console.log('Watch mode paused.');
    });

  watchCmd
    .command('resume')
    .description('Resume watch mode')
    .action(() => {
      if (fs.existsSync('.engram/paused')) {
        fs.unlinkSync('.engram/paused');
      }
      console.log('Watch mode resumed.');
    });
}
