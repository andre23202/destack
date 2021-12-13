#!/usr/bin/env node

const { spawn } = require('child_process')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const fs = require('fs')
const path = require('path')

const copyDirectory = async (src, dest) => {
  await fs.promises.mkdir(dest, { recursive: true })

  const entries = await fs.promises.readdir(src, { withFileTypes: true })
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    entry.isDirectory()
      ? await copyDirectory(srcPath, destPath)
      : await fs.promises.copyFile(srcPath, destPath)
  }
}

const { argv } = yargs(hideBin(process.argv))

;(async () => {
  if (argv.dev || argv.d) {
    const spawnArgs = [
      'nodemon --watch ../../lib/destack/server ../../node_modules/.bin/ts-node -O \'{"module":"commonjs"}\' ../../lib/destack/server/react.ts',
      argv.d,
    ]
    const proc = spawn('concurrently', spawnArgs)
    proc.stdout.on('data', (data) => {
      process.stdout.write(data.toString())
    })
    proc.stderr.on('data', (data) => {
      process.stdout.write(data.toString())
    })
  } else if (argv.build || argv.b) {
    const pathFrom = path.join(__dirname, '../../../dev/react-project/data')
    const pathTo = path.join(__dirname, '../../../dev/react-project/public/data')
    await copyDirectory(pathFrom, pathTo)

    const spawnArgs = ['&&', argv.b]
    const proc = spawn(`echo`, spawnArgs, { shell: true })
    proc.stdout.on('data', (data) => {
      process.stdout.write(data.toString())
    })
    proc.stderr.on('data', (data) => {
      process.stdout.write(data.toString())
    })
  }
})()