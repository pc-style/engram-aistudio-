import { Command } from 'commander';
import { generateBundle } from '../../core/bundle.js';

export function registerBundleCommands(program: Command) {
  program
    .command('bundle [topic]')
    .description('Generate a context bundle for a given topic')
    .option('-t, --tokens <number>', 'Token budget', '500')
    .action((topic, options) => {
      const bundle = generateBundle(topic, parseInt(options.tokens));
      console.log(bundle);
    });
}
