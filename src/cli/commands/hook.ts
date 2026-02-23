import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { checkDiffAgainstMemories } from '../../ai/checker.js';

export function registerHookCommands(program: Command) {
  const hookCmd = program.command('hook').description('Manage git pre-commit hook');

  hookCmd
    .command('install')
    .description('Install the pre-commit hook')
    .action(() => {
      const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
      if (!fs.existsSync(gitHooksDir)) {
        console.error('No .git directory found. Are you in a git repository?');
        process.exit(1);
      }

      const hookPath = path.join(gitHooksDir, 'pre-commit');
      const hookContent = `#!/bin/sh
# Engram pre-commit hook
echo "🧠 Engram checking staged changes..."
npx engram hook run
if [ $? -ne 0 ]; then
  echo "❌ Commit blocked by Engram. Use --no-verify to override."
  exit 1
fi
exit 0
`;

      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      console.log('✅ Engram pre-commit hook installed successfully.');
    });

  hookCmd
    .command('run')
    .description('Run the pre-commit check (internal use)')
    .action(async () => {
      try {
        const diff = execSync('git diff --cached').toString();
        if (!diff.trim()) {
          process.exit(0);
        }

        const result = await checkDiffAgainstMemories(diff, 'hook');
        if (!result.ok) {
          console.error('\n⚠️  [Engram] Commit blocked due to preference violations:');
          result.violations.forEach(v => console.error(v));
          process.exit(1);
        }

        console.log('✅  [Engram] All good.');
        process.exit(0);
      } catch (error) {
        console.error('Error running pre-commit check:', error);
        process.exit(1); // Fail closed on hook? Or fail open? Let's fail open to not block devs if API is down.
      }
    });
}
