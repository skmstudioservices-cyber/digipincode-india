// middleware.ts — wrap the D1 binding in a Session so reads route to the
// nearest replica (D1 read replication / Sessions API).
// Creates a NEW runtime + env object per request (never mutates shared env).
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const rt = (context.locals as any).runtime;
  const db = rt?.env?.DB;
  if (db && typeof db.withSession === 'function') {
    try {
      const session = db.withSession();
      (context.locals as any).runtime = { ...rt, env: { ...rt.env, DB: session } };
    } catch {
      // replication not available (e.g. local dev) — fall through to primary
    }
  }
  return next();
});
