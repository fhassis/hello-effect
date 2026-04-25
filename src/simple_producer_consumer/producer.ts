import { Effect, Queue, Schedule } from "effect";

export const makeProducer = (queue: Queue.Queue<number>) =>
  Effect.gen(function* () {
    let counter = 0;

    const produce = Effect.gen(function* () {
      counter++;
      yield* Effect.log(`[Producer] Produced: ${counter}`);
      yield* Queue.offer(queue, counter);
    });

    // loop every 1 second
    return yield* produce.pipe(Effect.repeat(Schedule.spaced("1 seconds")));
  });
