'use strict';

import { RedisClient } from 'redis';

export interface RedisInstance {
  label: string;
  index: number;
  port?: number;
  host?: string;
  auth_pass?: string;
  description?: string;
  config?: string;
}

export type RawConfig = RedisInstance[];

export type RedisInstances = Record<string, RedisInstance>;
export type RedisClients = Record<string, RedisClient>;
export type RedisErrors = Record<string, Error>;

export type CommandHandler = (instances: RedisInstances, extraOptions: any,
  extraInstance?: RedisInstance) => Promise<void>;
