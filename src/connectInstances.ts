'use string';

import { RedisClient } from 'redis';

import { RedisClients, RedisErrors, RedisInstance, RedisInstances } from './interfaces';

export async function connectInstances(instances: RedisInstances):
Promise<{ clients: RedisClients, errors: RedisErrors }> {

  const clientsArray = await Promise.all(Object.values(instances)
    .map(instance => createConnectedClient(instance)));

  return clientsArray.reduce(({ clients, errors }, { label, client, error }) => {
    if (client) {
      clients[label] = client;
    } else if (error) {
      errors[label] = error;
    }

    return { clients, errors };
  }, { clients: {}, errors: {} } as { clients: RedisClients, errors: RedisErrors });

}

async function createConnectedClient(instance: RedisInstance):
Promise<{ label: string, client?: RedisClient, error?: Error }> {
  return new Promise<{ label: string, client?: RedisClient, error?: Error }>((resolve, reject) => {
    const client = new RedisClient(instance);
    client.on('ready', (error?: Error) => {
      if (error) {
        client.end(true);
        resolve({ label: instance.label, error });
      } else {
        resolve({ label: instance.label, client });
      }
    });
    client.on('error', (error?: Error) => {
      client.end(true);
      resolve({ label: instance.label, error });
    });
  });
}
