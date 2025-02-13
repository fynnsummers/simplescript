let intervalId;

async function runCode() {
    const code = document.getElementById('editor').value; 
    const lines = code.split('\n');
    let output = '';
    let variables = {};
    let currentLineIndex = 0;

    if (intervalId) {
        clearInterval(intervalId);
    }

    function escapeHTML(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function highlightCode(code) {
        return escapeHTML(code)
            .replace(/(add|subtract|multiply|divide|mod|power|increase_every|repeat|repeat_until|print|set|if|then|stop|wait|assign|reset|random)/g, '<span class="keyword">$1</span>') // Mathematische Operationen und Schlüsselwörter
            .replace(/([a-zA-Z_][a-zA-Z0-9]*)/g, '<span class="variable">$1</span>') // Variablen
            .replace(/(\d+)/g, '<span class="number">$1</span>') 
            .replace(/("[^"]*")/g, '<span class="string">$1</span>') 
            .replace(/(#.*)/g, '<span class="comment">$1</span>');
    }

    document.getElementById('debug').innerHTML = highlightCode(code);

    function evalCondition(condition) {
        const [left, operator, right] = condition.split(' ');
        const leftValue = isNaN(left) ? variables[left] : parseInt(left);
        const rightValue = isNaN(right) ? variables[right] : parseInt(right);
        
        switch (operator) {
            case '==': return leftValue === rightValue;
            case '!=': return leftValue !== rightValue;
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            default: return false;
        }
    }

    function evaluateExpression(expression) {
        const parts = expression.split(' ');
        let result = 0;
        let operator = '+';

        for (const part of parts) {
            if (!isNaN(part)) {
                const number = parseInt(part);
                result = performOperation(result, number, operator);
            } else if (part in variables) {
                const variableValue = variables[part];
                result = performOperation(result, variableValue, operator);
            } else if (['+', '-', '*', '/'].includes(part)) {
                operator = part;
            }
        }

        return result;
    }

    function performOperation(left, right, operator) {
        switch (operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: return right; // Im Falle von + als Startwert
        }
    }

    async function executeLine(line) {
        line = line.trim();
        if (line.startsWith('print ')) {
            const text = line.substring(6).trim();
            const formattedText = formatPrintText(text);
            output += `<span class="output">${formattedText}</span><br>`;
        } else if (line.startsWith('set ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                variables[varName] = parseInt(value);
                output += `<span class="action">Set variable ${varName} to ${value}</span><br>`;
            }
        } else if (line.includes('=')) {
            const [assignment, resultVar] = line.split('=').map(part => part.trim());
            const result = evaluateExpression(assignment);
            variables[resultVar] = result;
            output += `<span class="action">Assigned ${result} to ${resultVar}</span><br>`;
        } else if (line.startsWith('add ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 0;
                }
                variables[varName] += parseInt(value);
                output += `<span class="action">Added ${value} to ${varName}</span><br>`;
            }
        } else if (line.startsWith('subtract ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 0;
                }
                variables[varName] -= parseInt(value);
                output += `<span class="action">Subtracted ${value} from ${varName}</span><br>`;
            }
        } else if (line.startsWith('multiply ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 1;
                }
                variables[varName] *= parseInt(value);
                output += `<span class="action">Multiplied ${varName} by ${value}</span><br>`;
            }
        } else if (line.startsWith('divide ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value) && value !== '0') {
                if (!(varName in variables)) {
                    variables[varName] = 1;
                }
                variables[varName] /= parseInt(value);
                output += `<span class="action">Divided ${varName} by ${value}</span><br>`;
            }
        } else if (line.startsWith('mod ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 0;
                }
                variables[varName] %= parseInt(value);
                output += `<span class="action">Modulo ${value} from ${varName}</span><br>`;
            }
        } else if (line.startsWith('power ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 1;
                }
                variables[varName] = Math.pow(variables[varName], parseInt(value));
                output += `<span class="action">Raised ${varName} to the power of ${value}</span><br>`;
            }
        } else if (line.startsWith('reset ')) {
            const [_, varName] = line.split(' ');
            variables[varName] = 0;
            output += `<span class="action">Reset ${varName} to 0</span><br>`;
        } else if (line.startsWith('random ')) {
            const [_, varName, min, max] = line.split(' ');
            const randomValue = Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min);
            variables[varName] = randomValue;
            output += `<span class="action">Assigned random value ${randomValue} to ${varName}</span><br>`;
        } else if (line.startsWith('if ')) {
            const condition = line.substring(3, line.indexOf('then')).trim();
            const action = line.substring(line.indexOf('then') + 5).trim();
            if (evalCondition(condition)) {
                await executeLine(action);
                output += `<span class="action">Executed: ${action}</span><br>`;
            }
        } else if (line.startsWith('increase_every ')) {
            const [_, interval, value, varName] = line.split(' ');
            if (!isNaN(interval) && !isNaN(value)) {
                if (!(varName in variables)) {
                    variables[varName] = 0;
                }
                intervalId = setInterval(() => {
                    variables[varName] += parseInt(value);
                    output += `<span class="output">Variable ${varName}: ${variables[varName]}</span><br>`;
                    document.getElementById('output').innerHTML = output;
                }, parseInt(interval) * 1000);
            }
        } else if (line.startsWith('wait ')) {
            const [_, duration] = line.split(' ');
            const waitTime = parseInt(duration) * 1000; 
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, waitTime);
            });
        } else if (line.startsWith('wait_min ')) {
            const [_, duration] = line.split(' ');
            const waitTime = parseInt(duration) * 60 * 1000; 
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, waitTime);
            });
        } else if (line.startsWith('stop')) {
            clearInterval(intervalId);
            output += `<span class="end">Ende</span><br>`;
            document.getElementById('output').innerHTML = output; 
        }
    }

    async function executeLoop(line, repeatCount) {
        let current = 0;
        while (current < repeatCount) {
            await executeLine(line);
            current++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        document.getElementById('output').innerHTML = output;
        await executeLine('stop');
    }

    (async function run() {
        while (currentLineIndex < lines.length) {
            const line = lines[currentLineIndex].trim();

            if (line.startsWith('repeat ')) {
                const [_, countStr] = line.split(' ');
                const count = parseInt(countStr);
                if (!isNaN(count)) {
                    await executeLoop(lines[currentLineIndex + 1], count);
                    currentLineIndex++;
                }
            } else {
                await executeLine(line);
            }

            currentLineIndex++;
        }

        document.getElementById('output').innerHTML = output;
        document.getElementById('debug').innerHTML = highlightCode(code); 
    })();
}
