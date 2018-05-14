'use strict';

import 'source-map-support/register';

import { default as chalk } from 'chalk';
import * as program from 'commander';

import { configHandler } from './actions/config';
import { infoHandler } from './actions/info';
import { listHandler } from './actions/list';
import { parseConfig } from './configParser';
import { CommandHandler } from './interfaces';

// tslint:disable-next-line
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .description(makeDescription())
  .option('-p --pattern <expr>', 'Minimatch expression to that matches redis labels to operate on')
  .option('-c --config <file>', 'Config file that specifies managed redis instances');

program
  .command('list', undefined, { isDefault: true })
  .description('list managed redis instances and their current statuses')
  .action(command => {
    doAction(command.parent, listHandler, {});
   });

program
  .command('info [section]')
  .description('get info on managed redis instances')
  .action((section, command) => {
    doAction(command.parent, infoHandler, {
      section
    });
   });

program
  .command('config [pattern]')
  .description('get configuration on managed redis instances')
  .action((pattern, command) => {
    doAction(command.parent, configHandler, {
      pattern
    });
   });

program
  .parse(process.argv);

function makeDescription() {
  return packageJson.description + `
  Use -c to specify a non-default configuration file. Default is to look in
  current directory, and upwards through parent directories. If none are found,
  look in home directory.

  Use -p to restrict the operation to a subset of redis labels using a minimatch
  expression.`;
}

async function doAction({ pattern, config }: { pattern: string | null, config: string | null }, action: CommandHandler, extraOptions: any) {
  try {
    const instances = parseConfig(pattern, config);
    await action(instances, extraOptions);
  } catch (e) {
    console.error(chalk.red(e.stack));
    process.exit(-1);
  }
}
