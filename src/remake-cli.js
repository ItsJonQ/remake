#!/usr/bin/env node
const program = require('commander');
const minimist = require('minimist');
const remake = require('./remake');
const pkg = require('../package.json');
const { getRelativeRemakePath, getRelativePath } = require('./utils');

const args = minimist(process.argv.slice(2));

// Usage
program.usage(`
  🦋  Remake

  remake <cmd> --option

  Example:
  remake component --name=MyComponent --someProp=value
`);

// Version
program.version(pkg.version);

// Options
program.option('-n, --name', 'The name for the generate file(s)');
program.option('-o, --output', 'Location to output generated file(s)');
program.option('-i, --entry', 'Location of the template file(s)');
program.option('-w, --overwrite', 'Overwrite existing files');
program.option('-s, --silence', 'Suppresses the logs');

// Commands
program
	.command('*')
	.description('The directory name for the template under .remake/')

	.action(function (command) {
		/* eslint-disable-next-line */
		const { _, ...props } = args;

		const remakeOptions = {
			entry: getRelativeRemakePath(props.entry || props.i),
			output: getRelativePath(props.output || props.o),
			overwrite: props.overwrite || props.w,
			name: props.name || props.n,
			silence: props.silence,
			command,
			props,
		};

		remake(remakeOptions);
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
