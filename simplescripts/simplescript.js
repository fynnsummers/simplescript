let intervalId;

document.getElementById("run").addEventListener("click", function(event) {
    event.preventDefault();
    runCode();
});

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
            .replace(/(add|subtract|multiply|divide|mod|power|increase_every|repeat|repeat_until|print|set|if|then|stop|wait)/g, '<span class="keyword">$1</span>') // Schlüsselwörter
            .replace(/([a-zA-Z_][a-zA-Z0-9]*)/g, '<span class="variable">$1</span>') 
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

    async function executeLine(line) {
        line = line.trim();

        // Neuen Mechanismus zur Berechnung von Ausdrücken hinzufügen
        if (line.includes('=') && (line.includes('+') || line.includes('-') || line.includes('*') || line.includes('/'))) {
            // Beispiel: a + b = f
            const [expression, varName] = line.split('=').map(part => part.trim());
            let result = 0;

            // Prüfe den Operator (+, -, *, /)
            if (expression.includes('+')) {
                const [left, right] = expression.split('+').map(part => part.trim());
                const leftValue = isNaN(left) ? variables[left] : parseInt(left);
                const rightValue = isNaN(right) ? variables[right] : parseInt(right);
                result = leftValue + rightValue;
            } else if (expression.includes('-')) {
                const [left, right] = expression.split('-').map(part => part.trim());
                const leftValue = isNaN(left) ? variables[left] : parseInt(left);
                const rightValue = isNaN(right) ? variables[right] : parseInt(right);
                result = leftValue - rightValue;
            } else if (expression.includes('*')) {
                const [left, right] = expression.split('*').map(part => part.trim());
                const leftValue = isNaN(left) ? variables[left] : parseInt(left);
                const rightValue = isNaN(right) ? variables[right] : parseInt(right);
                result = leftValue * rightValue;
            } else if (expression.includes('/')) {
                const [left, right] = expression.split('/').map(part => part.trim());
                const leftValue = isNaN(left) ? variables[left] : parseInt(left);
                const rightValue = isNaN(right) ? variables[right] : parseInt(right);
                result = leftValue / rightValue;
            }

            // Weise das Ergebnis der Variablen zu
            variables[varName] = result;
            output += `<span class="action">Set variable ${varName} to ${result}</span><br>`;
        }

        // Verarbeitung von Ausdrücken mit Variablen im Text
        else if (line.startsWith('print ')) {
            let text = line.substring(6).trim();
            
            // Ersetze Variable in Text (z.B. 'f' in "Mein Arm ist 'f' groß")
            text = text.replace(/'(.*?)'/g, (match, varName) => {
                return variables[varName] !== undefined ? variables[varName] : match;
            });

            output += `<span class="output">${text}</span><br>`;
        } 
        
        // Befehl 'set'
        else if (line.startsWith('set ')) {
            const [_, varName, value] = line.split(' ');
            if (!isNaN(value)) {
                variables[varName] = parseInt(value);
                output += `<span class="action">Set variable ${varName} to ${value}</span><br>`;
            }
        }

        // Befehle wie 'add', 'subtract', etc.
        else if (line.startsWith('add ')) {
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
                    output += `<span class="output">${variables[varName]}</span><br>`;
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
