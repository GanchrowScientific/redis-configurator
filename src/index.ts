'use strict';

import 'source-map-support/register';

import { default as chalk } from 'chalk';
import * as program from 'commander';

import { configHandler } from './actions/config';
import { infoHandler } from './actions/info';
import { listHandler } from './actions/list';
import { masterHandler } from './actions/master';
import { setHandler } from './actions/set';
import { parseConfig } from './configParser';
import { CommandHandler } from './interfaces';

// try
// https://github.com/klauscfhq/signale

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
  .command('set <key> <value>')
  .option('-r, --rewrite', 'rewrites configuration to disk after setting value')
  .description('get configuration on managed redis instances')
  .action((key, value, command) => {
    doAction(command.parent, setHandler, {
      key, value, rewrite: command.rewrite
    });
  });

program
  .command('master [master]')
  .description('sets all slaves matching the -p pattern to have the specified master;' +
    ' a -p pattern must be specified; leave [master] blank to convert master to "no one"')
  .option('-r, --rewrite', 'rewrites configuration to disk after setting value')
  .action((master, command) => {
    doAction(command.parent, masterHandler, {
      rewrite: command.rewrite
    }, master);
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

async function doAction(
  { pattern, config }: { pattern: string | undefined, config: string | undefined },
  action: CommandHandler, extraOptions: any, extraRedis?: string) {

  try {
    const instances = parseConfig(pattern, config);
    const extraInstance = getExtraRedisInstance(extraRedis, config);

    await action(instances, extraOptions, extraInstance);
  } catch (e) {
    console.error(chalk.red(e.stack));
    process.exit(-1);
  }
}

function getExtraRedisInstance(extraRedis: string | undefined, config: string | undefined) {
  if (!extraRedis) {
    return;
  }
  const extraInstance = parseConfig(extraRedis, config);
  if (!Object.keys(extraInstance)) {
    throw new Error(`Cannot find redis instance ${extraInstance}`);
  } else if (Object.keys(extraInstance).length > 1) {
    throw new Error(`${extraInstance} matches more than one redis`);
  }
  return Object.values(extraInstance)[0];
}
