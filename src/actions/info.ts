'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';
import { promisify } from 'util';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisInstance, RedisInstances } from '../interfaces';
import { iterateClients } from '../iterateClients';
import { printClient } from '../printClient';
import { printErrors } from '../printErrors';

export async function infoHandler(instances: RedisInstances, { section }: { section: string | null }): Promise<void> {
  console.log(chalk.blue('Info on Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, infoClient.bind(null, section));

  endClients(clients);
}

async function infoClient(section: (string | null), instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const info = await promisify(client.info).call(client, section);

    printClient(instance, client);
    console.log(info);
  } else {
    printClient(instance, client);
  }
}
