'use strict';

import { default as chalk } from 'chalk';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisClients, RedisInstances } from '../interfaces';
import { printErrors } from '../printErrors';

export async function listHandler(instances: RedisInstances, extraOptions: any): Promise<void> {
  console.log(chalk.blue('Listing Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  printClients(clients, instances);

  endClients(clients);
}

function printClients(clients: RedisClients, instances: RedisInstances) {
  Object.entries(clients).sort(([l1], [l2]) =>
    instances[l1].index - instances[l2].index)
  .forEach(([label, client]) => {
    const instance = instances[label];

    console.log(chalk.black(chalk.bgGreen('>>>')), chalk.blue(label),
      client.connected ? chalk.green('Connected') : chalk.red('Not Connected'));
    console.log('   ', `${instance.host}:${instance.port}`);

    if (instance.description) {
      console.log('   ', instance.description);
    }
  });
}
