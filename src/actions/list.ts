'use strict';

import { default as chalk } from 'chalk';

import { RedisInstances } from '../interfaces';

export function listHandler(instances: RedisInstances, extraOptions: any): void {
  console.log(chalk.blue('LISTING'));
  console.log(chalk.cyan(Object.keys(instances).join()));
}
