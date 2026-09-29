import 'dotenv/config';
import { z } from 'zod';

const schema=z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'),
  PORT:z.coerce.number().int().positive().default(4000),HOST:z.string().default('0.0.0.0'),
  PUBLIC_URL:z.string().url().default('http://localhost:4000'),APP_ORIGIN:z.string().default('*'),
  APP_DEEP_LINK:z.string().optional(),
  KITE_API_KEY:z.string().min(1).optional(),KITE_API_SECRET:z.string().min(1).optional(),KITE_ACCESS_TOKEN:z.string().min(1).optional(),
  SESSION_PATH:z.string().default('./.data/session.json'),
  WATCHLIST_PATH:z.string().default('./data/full-watchlist.txt'),API_CLIENT_TOKEN:z.string().min(16).optional(),
  SCAN_MIN_CHANGE:z.coerce.number().default(-3),SCAN_MAX_CHANGE:z.coerce.number().default(3),SCAN_VOLUME_RATIO:z.coerce.number().positive().default(1.5),
  EXPO_ACCESS_TOKEN:z.string().optional()
});
export const config=schema.parse(process.env);
export const kiteConfigured=Boolean(config.KITE_API_KEY&&config.KITE_API_SECRET);
