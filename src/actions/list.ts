'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisInstance, RedisInstances } from '../interfaces';
import { iterateClients } from '../iterateClients';
import { printClient } from '../printClient';
import { printErrors } from '../printErrors';

export async function listHandler(instances: RedisInstances, extraOptions: any): Promise<void> {
  console.log(chalk.blue('Listing Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, listClient);

  endClients(clients);
}

async function listClient(instance: RedisInstance, client: RedisClient) {
  printClient(instance, client);
  console.log('   ', `${instance.host}:${instance.port}`);

  if (instance.description) {
    console.log('   ', instance.description);
  }
}
