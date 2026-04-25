import { Effect, Queue } from "effect";

export const makeConsumer = (queue: Queue.Queue<number>) =>
  Effect.gen(function* () {
    const consume = Effect.gen(function* () {
      const message = yield* Queue.take(queue);
      yield* Effect.log(`[Consumer] Received: ${message}`);
    });

    // Run forever
    return yield* consume.pipe(Effect.forever);
  });
