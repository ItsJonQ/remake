#!/usr/bin/env node
import program from 'commander'
import minimist from 'minimist'
import remake from './remake'
import pkg from '../package.json'
import {getRelativeRemakePath, getRelativePath} from './utils'

const args = minimist(process.argv.slice(2))

// Usage
program.usage(`
  🦋  Remake

  remake <cmd> --option

  Example:
  remake component --name=MyComponent --someProp=value
`)

// Version
program.version(pkg.version)

// Options
program.option('-n, --name', 'The name for the generate file(s)')
program.option('-o, --output', 'Location to output generated file(s)')
program.option('-i, --entry', 'Location of the template file(s)')
program.option('-w, --overwrite', 'Overwrite existing files')
program.option('-s, --silence', 'Suppresses the logs')

// Commands
program
  .command('*')
  .description('The directory name for the template under .remake/')

  .action(function(command) {
    const {_, ...props} = args

    const remakeOptions = {
      entry: getRelativeRemakePath(props.entry || props.i),
      output: getRelativePath(props.output || props.o),
      overwrite: props.overwrite || props.w,
      name: props.name || props.n,
      silence: props.silence,
      command,
      props,
    }

    remake(remakeOptions)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
