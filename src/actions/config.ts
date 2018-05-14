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

export async function configHandler(instances: RedisInstances, extraOptions: any): Promise<void> {
  console.log(chalk.blue('Configuration in Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, configGetClient.bind(null, extraOptions.pattern));

  endClients(clients);
}

async function configGetClient(pattern: (string | null), instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const info = await promisify(client.config).call(client, 'get', pattern || '*');

    printClient(instance, client);
    printList(info);
  } else {
    printClient(instance, client);
  }
}

function printList(list: string[]) {
  for (let i = 0; i < list.length; i += 2) {
    console.log('  ', chalk.yellow(list[i]), ':', list[i + 1]);
  }
}
