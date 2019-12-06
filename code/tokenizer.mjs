export default function tokenize([current, ...rest], tokens = []) {
  if (!current) {
    return tokens;
  }

  if (current === " ") {
    return tokenize(rest, tokens);
  }

  if (current === "+" || current === "-") {
    return tokenize(
      rest,
      tokens.concat({
        type: "operator",
        value: current
      })
    );
  }

  let diceTest = /^([1-9]\d*)?d([1-9]\d*)/i;
  let src = [current].concat(rest).join("");
  let m = diceTest.exec(src);
  if (m) {
    let value = m[0];
    return tokenize(
      rest.slice(value.length),
      tokens.concat({
        type: "dice",
        value
      })
    );
  }

  let numberTest = /^([1-9]\d*)/;
  let n = numberTest.exec(src);
  if (n) {
    let value = n[0];
    return tokenize(
      rest.slice(value.length),
      tokens.concat({
        type: "number",
        value
      })
    );
  }

  throw new Error("Unexpected token");
}
