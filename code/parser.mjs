import tokenize from "./tokenize.mjs";

export default function parser(tokens) {
  function walk([current, next, ...rest]) {
    if (next && next.type === "operator") {
      return {
        type: "operatorExpression",
        operator: next.value,
        lhs: walk([current]),
        rhs: walk(rest)
      };
    }

    if (current.type === "number") {
      return current;
    }

    if (current.type === "dice") {
      let parts = current.value.split("d");
      return {
        type: "diceExpression",
        lhs: { type: "number", value: parts[0] || "1" },
        rhs: { type: "number", value: parts[1] }
      };
    }

    throw new Error("Unexpected syntax");
  }

  return {
    type: "program",
    body: walk(tokens)
  };
}
