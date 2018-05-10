'use strict';

export interface RedisInstance {
  label: string;
  index: number;
  port?: number;
  host?: string;
  auth?: string;
  description?: string;
  config?: string;
}

export type RawConfig = RedisInstance[];

export type RedisInstances = Record<string, RedisInstance>;

export type CommandHandler = (instances: RedisInstances, extraOptions: any) => void;
