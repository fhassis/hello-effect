import { Console, Effect } from "effect";

const program = Console.log("Hello, Effect!");

Effect.runSync(program);
