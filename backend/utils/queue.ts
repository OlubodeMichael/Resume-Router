// utils/queue.ts
import { processResumeAsync } from "./worker"; // your function shown earlier

export type ProcessArgs = {
  resumeId: string;
  userId: string;
  jd: string;
  tone: string;
  templateId?: string;
};

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 10);
const MAX_QUEUE = Number(process.env.WORKER_MAX_QUEUE ?? 2000);

const q: ProcessArgs[] = [];
let active = 0;

export function enqueueResumeJob(args: ProcessArgs) {
  if (q.length >= MAX_QUEUE) {
    const err: any = new Error("Queue is full");
    err.status = 429;
    throw err;
  }
  q.push(args);
  pump();
}

function pump() {
  while (active < CONCURRENCY && q.length > 0) {
    const job = q.shift()!;
    active++;
    setImmediate(async () => {
      try { await processResumeAsync(job); }
      catch (e) { /* already updates status: failed */ }
      finally { active--; pump(); }
    });
  }
}
