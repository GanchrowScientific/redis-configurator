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

export async function infoHandler(instances: RedisInstances, { section }:
    { section?: string }): Promise<void> {
  console.log(chalk.blue('Info on Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, infoClient.bind(null, section));

  endClients(clients);
}

async function infoClient(section: (string | undefined), instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const info = await invokeRedis(client, 'info', section);

    printClient(instance, client);
    console.log(info);
  } else {
    printClient(instance, client);
  }
}
