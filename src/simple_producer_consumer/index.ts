import { Effect, Queue } from "effect";
import { makeProducer } from "./producer";
import { makeConsumer } from "./consumer";

const program = Effect.gen(function* () {
  yield* Effect.log("Initializing Simple Producer/Consumer module...");

  // Bounded queue provides built-in backpressure
  const queue = yield* Queue.bounded<number>(100);

  // Run both effects concurrently in the same runtime
  yield* Effect.all([makeProducer(queue), makeConsumer(queue)], {
    concurrency: "unbounded",
  });
});

// Run the program
Effect.runPromise(program).catch(console.error);
