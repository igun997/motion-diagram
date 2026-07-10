const FUNCTIONS = { sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs };
const TOKEN = /\s*(sin|cos|tan|abs|x|\d*\.?\d+|[()+\-*/^])\s*/y;

function tokenize(source) {
  const result = [];
  let index = 0;
  while (index < source.length) {
    TOKEN.lastIndex = index;
    const token = TOKEN.exec(source);
    if (!token) throw new Error("Invalid expression");
    result.push(token[1]);
    index = TOKEN.lastIndex;
  }
  return result;
}

export function evaluateExpression(expression, x = 0) {
  if (typeof expression !== "string" || !Number.isFinite(x)) throw new Error("Invalid expression");
  const tokens = tokenize(expression);
  let index = 0;
  const take = () => tokens[index++];
  const peek = () => tokens[index];

  const primary = () => {
    const token = take();
    if (token === "(") {
      const value = sum();
      if (take() !== ")") throw new Error("Invalid expression");
      return value;
    }
    if (token in FUNCTIONS) {
      if (take() !== "(") throw new Error("Invalid expression");
      const value = FUNCTIONS[token](sum());
      if (take() !== ")") throw new Error("Invalid expression");
      return value;
    }
    if (token === "x") return x;
    if (Number.isFinite(Number(token))) return Number(token);
    throw new Error("Invalid expression");
  };
  const unary = () => {
    if (peek() === "+") {
      take();
      return unary();
    }
    if (peek() === "-") {
      take();
      return -unary();
    }
    return primary();
  };
  const power = () => {
    let value = unary();
    if (peek() === "^") value **= power();
    return value;
  };
  const product = () => {
    let value = power();
    while (peek() === "*" || peek() === "/") {
      const operator = take();
      value = operator === "*" ? value * power() : value / power();
    }
    return value;
  };
  const sum = () => {
    let value = product();
    while (peek() === "+" || peek() === "-")
      value = take() === "+" ? value + product() : value - product();
    return value;
  };

  try {
    const value = sum();
    if (index !== tokens.length || !Number.isFinite(value)) throw new Error();
    return value;
  } catch {
    throw new Error("Invalid expression");
  }
}
