import { registerPlugin } from '@capacitor/core';

import type { CleverTapPlugin } from './definitions';

/**
 * CleverTap SDK log levels. The values match CleverTap Android's `LogLevel`.
 */
export enum DEBUG_LEVEL {
  /** No logging. */
  OFF = -1,
  /** Errors and important information only (the SDK's default). */
  INFO = 0,
  /** Debug logging. On iOS the same as `VERBOSE`. */
  DEBUG = 2,
  /** Everything, including event and profile payloads. */
  VERBOSE = 3,
}

const CleverTapAnalytics = registerPlugin<CleverTapPlugin>('CleverTapAnalytics');

export * from './definitions';
export { CleverTapAnalytics };
