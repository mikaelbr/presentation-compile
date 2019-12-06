import tokenize from "./tokenizer.mjs";
import parser from "./parser.mjs";
import generator from "./generator.mjs";
import execute from "./executor.mjs";

let source = "2d6 + 3 + d20";

console.log(`Input: ${source}`);

let output = generator(parser(tokenize(source)));
console.log(`Output: ${output}`);

console.log(`Result: ${execute(output)}`);
