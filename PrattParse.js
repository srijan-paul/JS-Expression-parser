const precedence = {
    ')': 0,
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 3
}

function lex(text) {
    start = 0;
    current = 0;
    tokens = [];

    function isOperator(c) {
        return '-+*/'.includes(c);
    }

    function isUnary(c) {
        return '-!+'.includes(c);
    }

    function advance() {
        return text.charAt(current++);
    }

    function eof() {
        return current >= text.length;
    }

    function peekNext() {
        if (current + 1 >= text.length) return null;
        return text.charAt(current + 1);
    }

    function peek() {
        if (eof()) return null;
        return text.charAt(current);
    }

    function isDigit(c) {
        return c >= '0' && c <= '9';
    }

    function getNum() {
        while (!eof() && isDigit(peek())) {
            advance();
        }

        if (peek() === '.' && isDigit(peekNext())) {
            advance();
            while (isDigit(peek())) advance();
        }

        tokens.push(parseFloat(text.substring(start, current)));
    }

    while (!eof()) {
        start = current;
        let c = advance();
        if (isDigit(c)) {
            getNum();
        } else if (isOperator(c) || c === '(' || c === ')') {
            tokens.push(c);
        }
    }

    for (let i = 0; i < tokens.length - 1; i++) {
        let tk = tokens[i];
        if (isUnary(tk)) {
            if (i == 0 || precedence[tokens[i - 1]]) {
                tokens[i + 1] = evaluateBinary(tk, tokens[i + 1]);
                tokens.splice(i, 1);
            }
        }
    }

    return tokens;
}

function evaluateBinary(op, operand) {
    switch (op) {
        case '-':
            return -operand;
        case '+':
            return +operand;
        case '!':
            return !operand;
        default:
            return NaN;
    }
}


function generateAST(tokens) {

    function next() {
        return tokens.shift();
    }

    function peek() {
        return tokens[0];
    }

    function Tree(left, node, right) {
        return {
            left: left,
            value: node,
            right: right
        }
    }

    function NUD(node) {
        if (node === '(') {
            const e = expr(0);
            next();
            return e;
        }
        return Tree(null, node, null);
    }

    function LED(left, op) {
        return Tree(left, op, expr(precedence[op]));
    }

    function expr(rp = 0) {
        let left = NUD(next());
        while (precedence[peek()] > rp)
            left = LED(left, next());
        return left;
    }

    return expr();
}

function parseExpr(tree) {
    return eval(tree);
}

function eval(node) {
    if (node.left == null)
        return node.value;


    switch (node.value) {
        case '/':
            return eval(node.left) / eval(node.right);
        case '*':
            return eval(node.left) * eval(node.right);
        case '-':
            return eval(node.left) - eval(node.right);
        case '+':
            return eval(node.left) + eval(node.right);
    }
}


//Node JS stuff for getting user input from the terminal 


const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your expression : \n', (expression) => {
    let ast = generateAST(lex(expression));
    console.log(parseExpr(ast));
    rl.close();
})