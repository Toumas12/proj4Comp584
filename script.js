const display = document.querySelector("#display");
const buttons = document.querySelector(".calculator-buttons");
// Keep the displayed number, pending operation, and last calculation.
let current = "0";
let total = null;
let operator = null;
let startNewNumber = false;
let lastOperator = null;
let lastOperand = null;

function render() {
    display.textContent = current;
    display.style.fontSize = current.length > 14 ? "24px" : "40px";
}

function clear() {
    current = "0";
    total = null;
    operator = null;
    startNewNumber = false;
    lastOperator = null;
    lastOperand = null;
    render();
}

// Start a new number after an operator or a result.
function inputDigit(digit) {
    if (current === "Error") clear();
    if (startNewNumber) {
        current = digit;
        startNewNumber = false;
    } else if (current.replace(/[^0-9]/g, "").length < 12) {
        current = current === "0" ? digit : current + digit;
    }
    lastOperator = null;
    lastOperand = null;
    render();
}

function inputDecimal() {
    if (current === "Error") clear();
    if (startNewNumber) {
        current = "0";
        startNewNumber = false;
    }
    if (!current.includes(".") && !current.includes("e")) current += ".";
    lastOperator = null;
    lastOperand = null;
    render();
}

function calculate(left, right, operation) {
    switch (operation) {
        case "add": return left + right;
        case "subtract": return left - right;
        case "multiply": return left * right;
        case "divide": return right === 0 ? NaN : left / right;
        default: return right;
    }
}

// Show an error for invalid results and round long decimals.
function showResult(result) {
    if (!Number.isFinite(result)) {
        clear();
        current = "Error";
        startNewNumber = true;
        render();
        return false;
    }
    current = String(Number(result.toPrecision(12)));
    render();
    return true;
}

// Finish the pending calculation before starting the next one.
function chooseOperator(nextOperator) {
    if (current === "Error") return;
    if (operator && !startNewNumber) {
        if (!showResult(calculate(total, Number(current), operator))) return;
    }
    total = Number(current);
    operator = nextOperator;
    startNewNumber = true;
    lastOperator = null;
    lastOperand = null;
}

function equals() {
    if (current === "Error") return;
    if (operator) {
        const operand = Number(current);
        const operation = operator;
        if (!showResult(calculate(total, operand, operation))) return;
        lastOperator = operation;
        lastOperand = operand;
        operator = null;
        total = null;
    } else if (lastOperator) {
        // Pressing equals again repeats the last calculation.
        if (!showResult(calculate(Number(current), lastOperand, lastOperator))) return;
    }
    startNewNumber = true;
}

function backspace() {
    if (current === "Error") {
        clear();
        return;
    }
    if (startNewNumber) return;
    current = current.slice(0, -1);
    if (current === "" || current === "-") current = "0";
    lastOperator = null;
    lastOperand = null;
    render();
}

// Use each button’s data attributes to choose an action.
buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
    else if (button.dataset.operator) chooseOperator(button.dataset.operator);
    else if (button.dataset.action === "clear") clear();
    else if (button.dataset.action === "backspace") backspace();
    else if (button.dataset.action === "equals") equals();
});

const keyboardOperators = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "x": "multiply",
    "/": "divide"
};

// Keyboard shortcuts use the same actions as the buttons.
document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key;
    if (/^[0-9]$/.test(key)) inputDigit(key);
    else if (keyboardOperators[key]) chooseOperator(keyboardOperators[key]);
    else if (key === "=" || key === "Enter") equals();
    else if (key === "Backspace") backspace();
    else if (key === "Escape" || key === "c" || key === "C") clear();
    else if (key === ".") inputDecimal();
    else return;
    event.preventDefault();
});

render();
