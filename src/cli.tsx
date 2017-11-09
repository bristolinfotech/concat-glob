#! /usr/bin/env node

import chalk from 'chalk';
import * as program from 'commander';
import * as fs from 'graceful-fs';
import { Writable } from 'stream';

import { concatGlob, concatGlobToFile } from './';

const pkg = require('./../package.json');

program
  .version(pkg.version, '-v, --version')
  .arguments('[...paths]')
  .option('-o, --output [outputPath]')
  .parse(process.argv)
;

if (program.args.length === 0) {
  console.error(chalk.red.bold('You must provide paths'));
  process.exit(1);
}

async function main() {
  let output: Writable;
  if (program.output) {
    output = fs.createWriteStream(program.output); // normalize path here
  } else {
    output = process.stdout;
  }

  if (program.output) {
    await concatGlobToFile(program.args, program.output);
    console.log(chalk.green(`Successfully concatenated files into "${program.output}"`));
  } else {
    process.stdout.write(await concatGlob(program.args));
  }
}

main().catch((e) => {
  console.error(chalk.red(e));
});
