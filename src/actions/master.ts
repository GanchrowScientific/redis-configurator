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

export async function masterHandler(instances: RedisInstances,
  { rewrite }: { rewrite: boolean },
  masterInstance?: RedisInstance): Promise<void> {

  const { masterHostPort, masterAuth, masterLabel } = getMasterHostPort(masterInstance);

  console.log(chalk.blue(`Setting master to ${masterHostPort}`));

  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, setMaster.bind(null, masterLabel, masterHostPort, masterAuth, rewrite));

  endClients(clients);
}

async function setMaster(masterLabel: string | undefined, masterHostPort: string,
  masterAuth: string, rewrite: boolean,
  instance: RedisInstance, client: RedisClient) {

  if (instance.label === masterLabel) {
    return;
  }

  if (client.connected) {
    if (masterAuth) {
      await invokeRedis(client, 'config', 'set', 'masterauth', masterAuth);
    }

    const masterResult = await invokeRedis(client, 'slaveof', ...masterHostPort);

    if (rewrite) {
      await invokeRedis(client, 'config', 'rewrite');
    }
    printClient(instance, client);
    console.log('  ', chalk.yellow(masterResult));

  } else {
    printClient(instance, client);
    console.log('  ', chalk.yellow('NOT CONNECTED'));
  }
}

function getMasterHostPort(masterInstance: RedisInstance | undefined):
  { masterHostPort: [string, string], masterAuth?: string, masterLabel?: string } {

  if (!masterInstance) {
    return { masterHostPort: ['no', 'one'] };
  } else {
    return {
      masterHostPort: [masterInstance.host || 'localhost', String(masterInstance.port) || '6379'],
      masterAuth: masterInstance.auth_pass,
      masterLabel: masterInstance.label
    };
  }
}
