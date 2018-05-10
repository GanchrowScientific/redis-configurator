'use strict';

import { RedisClients } from './interfaces';

export function endClients(clients: RedisClients) {
  Object.values(clients).forEach(client => client.end(true));
}
