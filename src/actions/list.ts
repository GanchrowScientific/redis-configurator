'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisInstance, RedisInstances } from '../interfaces';
import { iterateClients } from '../iterateClients';
import { printErrors } from '../printErrors';

export async function listHandler(instances: RedisInstances, extraOptions: any): Promise<void> {
  console.log(chalk.blue('Listing Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  iterateClients(clients, instances, listClient);

  endClients(clients);
}

function listClient(instance: RedisInstance, client: RedisClient) {
  console.log(chalk.black(chalk.bgGreen('>>>')), chalk.blue(instance.label),
    client.connected ? chalk.green('Connected') : chalk.red('Not Connected'));
  console.log('   ', `${instance.host}:${instance.port}`);

  if (instance.description) {
    console.log('   ', instance.description);
  }
}
