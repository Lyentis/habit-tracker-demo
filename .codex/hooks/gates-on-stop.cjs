const { spawnSync } = require('node:child_process')
const { resolve } = require('node:path')

const root = resolve(__dirname, '../..')

for (const script of ['lint', 'test:unit']) {
  const command = `npm run ${script}`
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    stdio: ['ignore', 2, 2],
  })

  if (result.status !== 0) {
    const failure = result.error?.message ?? result.signal ?? `exit code ${result.status}`
    process.stderr.write(`Stop hook: ${command} failed (${failure}). Resolve the failure before finishing.\n`)
    process.exitCode = 2
    break
  }
}

if (!process.exitCode) {
  process.stdout.write('{}\n')
}
