'use strict';

import { default as chalk } from 'chalk';

import { RedisErrors } from './interfaces';

export function printErrors(...errors: RedisErrors[]): void {
  if (noErrors(errors)) {
    return;
  }

  console.warn(chalk.red('---------------'));
  console.warn(chalk.red('Errors'));

  errors.forEach(errorGroup => Object.entries(errorGroup).forEach(([label, error]) =>
    console.warn(chalk.red(label, ':', error.message))));

  console.warn(chalk.red('---------------'));
}

function noErrors(errors: RedisErrors[]): boolean {
  return errors.every(error => Object.values(error).length === 0);
}
