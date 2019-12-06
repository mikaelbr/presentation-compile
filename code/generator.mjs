export default function generate(ast) {
  function dice(num, d) {
    let str = `Math.floor(Math.random()*${d})+1`;
    return Array.from(new Array(num))
      .fill(str)
      .join("*");
  }

  function operator(type, lhs, rhs) {
    return `${lhs}${type}${rhs}`;
  }

  function walk(node) {
    if (node.type === "number") {
      return parseInt(node.value);
    }

    if (node.type === "operatorExpression") {
      return operator(node.operator, walk(node.lhs), walk(node.rhs));
    }

    if (node.type === "diceExpression") {
      return dice(walk(node.lhs), walk(node.rhs));
    }
  }

  return walk(ast.body) + ";";
}
