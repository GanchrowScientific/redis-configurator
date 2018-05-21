'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisInstance, RedisInstances } from '../interfaces';
import { invokeRedis } from '../invokeRedis';
import { iterateClients } from '../iterateClients';
import { printClient } from '../printClient';
import { printErrors } from '../printErrors';

export async function restartHandler(instances: RedisInstances, { noSave }: { noSave: boolean }): Promise<void> {
  console.log(chalk.blue('Restarting Redis clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, restartClient.bind(null, noSave));

  endClients(clients);
}

async function restartClient(noSave: boolean, instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const result = await invokeRedis(client, 'shutdown', noSave ? 'nosave' : 'save');

    printClient(instance, client);
    console.log(result);
  } else {
    printClient(instance, client);
  }
}
