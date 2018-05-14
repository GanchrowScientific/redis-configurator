'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { RedisInstance } from './interfaces';

export function printClient(instance: RedisInstance, client: RedisClient) {
  console.log(chalk.black(chalk.bgGreen('>>>')), chalk.blue(instance.label),
    client.connected ? chalk.green('Connected') : chalk.red('Not Connected'));

}
