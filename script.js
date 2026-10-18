class AdvancedCalculator {
    // Upper bound for the << shift count, to keep BigInt results reasonable
    static MAX_SHIFT = 1024n;

    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.memory = 0;
        this.history = [];
        this.currentMode = 'basic';
        this.soundEnabled = true;
        this.currentTheme = 'cyberpunk';
        this.darkMode = false;
        this.currentBase = 10;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadPreferences();
        this.initializeAudio();
        this.showLoadingScreen();
    }

    initializeElements() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
        this.historyList = document.getElementById('historyList');
        this.historyPanel = document.getElementById('historyPanel');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.basicButtons = document.getElementById('basicButtons');
        this.scientificButtons = document.getElementById('scientificButtons');
        this.programmerButtons = document.getElementById('programmerButtons');
    }

    attachEventListeners() {
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.innerText);
                this.playSound('click');
            });
        });

        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.innerText);
                this.playSound('operation');
            });
        });

        const equalsButton = document.querySelector('[data-equals]');
        if (equalsButton) {
            equalsButton.addEventListener('click', () => {
                this.compute();
                this.playSound('equals');
            });
        }

        const clearButton = document.querySelector('[data-clear]');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clear();
                this.playSound('clear');
            });
        }

        const deleteButton = document.querySelector('[data-delete]');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.delete();
                this.playSound('delete');
            });
        }

        document.querySelectorAll('[data-memory-clear]').forEach(button => {
            button.addEventListener('click', () => this.memoryClear());
        });

        document.querySelectorAll('[data-memory-recall]').forEach(button => {
            button.addEventListener('click', () => this.memoryRecall());
        });

        document.querySelectorAll('[data-memory-add]').forEach(button => {
            button.addEventListener('click', () => this.memoryAdd());
        });

        document.querySelectorAll('[data-memory-subtract]').forEach(button => {
            button.addEventListener('click', () => this.memorySubtract());
        });

        document.querySelectorAll('.mode-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.switchMode(button.dataset.mode);
                this.playSound('mode');
            });
        });

        document.querySelectorAll('[data-function]').forEach(button => {
            button.addEventListener('click', () => {
                this.scientificFunction(button.dataset.function);
                this.playSound('scientific');
            });
        });

        document.querySelectorAll('[data-base]').forEach(button => {
            button.addEventListener('click', () => {
                this.changeBase(button.dataset.base);
                this.playSound('base');
            });
        });

        document.querySelectorAll('[data-bitwise]').forEach(button => {
            button.addEventListener('click', () => {
                this.bitwiseOperation(button.dataset.bitwise);
                this.playSound('bitwise');
            });
        });

        document.querySelectorAll('[data-shift]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.dataset.shift === 'left' ? '<<' : '>>');
                this.playSound('bitwise');
            });
        });

        document.querySelectorAll('[data-prog-number]').forEach(button => {
            button.addEventListener('click', () => {
                // appendNumber rejects digits that are invalid in the current base
                this.appendNumber(button.textContent.trim());
                this.playSound('click');
            });
        });

        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }

        const historyToggle = document.getElementById('historyToggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                this.toggleHistory();
            });
        }

        const clearHistory = document.getElementById('clearHistory');
        if (clearHistory) {
            clearHistory.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    handleKeyboardInput(e) {
        if (this.isProgrammer() && /^[a-f]$/i.test(e.key)) {
            this.appendNumber(e.key.toUpperCase());
            this.playSound('click');
        } else if (this.isProgrammer() && (e.key === '<' || e.key === '>')) {
            this.chooseOperation(e.key === '<' ? '<<' : '>>');
            this.playSound('bitwise');
        } else if (e.key >= '0' && e.key <= '9') {
            this.appendNumber(e.key);
            this.playSound('click');
        } else if (e.key === '.') {
            this.appendNumber('.');
            this.playSound('click');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const operation = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
            this.chooseOperation(operation);
            this.playSound('operation');
        } else if (e.key === '%') {
            this.chooseOperation('%');
            this.playSound('operation');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.compute();
            this.playSound('equals');
        } else if (e.key === 'Escape') {
            this.clear();
            this.playSound('clear');
        } else if (e.key === 'Backspace') {
            this.delete();
            this.playSound('delete');
        } else if (e.key === 'h' || e.key === 'H') {
            this.toggleHistory();
        }
    }

    appendNumber(number) {
        if (this.isProgrammer() && !this.isValidDigit(number)) return;
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' || this.currentOperand === 'Erreur') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    compute() {
        if (this.isProgrammer()) {
            this.computeInteger();
            return;
        }
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }

        const historyEntry = `${this.getFormattedNumber(prev)} ${this.operation} ${this.getFormattedNumber(current)} = ${this.getFormattedNumber(computation)}`;
        this.addToHistory(historyEntry, String(computation));

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    // Programmer mode: operands are strings written in the current base and
    // computed as BigInt, so results are exact integers whatever their size.
    computeInteger() {
        const prev = this.parseInteger(this.previousOperand);
        const current = this.parseInteger(this.currentOperand);
        if (prev === null || current === null || !this.operation) return;

        let result;
        switch (this.operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷':
            case '%':
                if (current === 0n) { this.showError(); return; }
                // BigInt division truncates toward zero (integer division)
                result = this.operation === '÷' ? prev / current : prev % current;
                break;
            case '<<':
            case '>>':
                if (current < 0n || current > AdvancedCalculator.MAX_SHIFT) { this.showError(); return; }
                result = this.operation === '<<' ? prev << current : prev >> current;
                break;
            case 'AND': result = prev & current; break;
            case 'OR': result = prev | current; break;
            case 'XOR': result = prev ^ current; break;
            default: return;
        }

        const value = this.formatInteger(result);
        const historyEntry = `${this.getFormattedNumber(this.formatInteger(prev))} ${this.operation} ${this.getFormattedNumber(this.formatInteger(current))} = ${this.getFormattedNumber(value)}${this.baseSuffix()}`;
        this.addToHistory(historyEntry, value);

        this.currentOperand = value;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    isProgrammer() {
        return this.currentMode === 'programmer';
    }

    isValidDigit(digit) {
        return digit.length === 1 && '0123456789ABCDEF'.slice(0, this.currentBase).includes(digit.toUpperCase());
    }

    // Parses an integer written in `base` (optional leading minus). Returns a BigInt, or null if invalid.
    parseInteger(text, base = this.currentBase) {
        const match = String(text).trim().toUpperCase().match(/^(-?)([0-9A-F]+)$/);
        if (!match) return null;
        const allowed = '0123456789ABCDEF'.slice(0, base);
        if ([...match[2]].some(c => !allowed.includes(c))) return null;
        const prefix = { 2: '0b', 8: '0o', 10: '', 16: '0x' }[base];
        const value = BigInt(prefix + match[2]);
        return match[1] ? -value : value;
    }

    formatInteger(value, base = this.currentBase) {
        return value.toString(base).toUpperCase();
    }

    // Decimal string -> decimal integer string (fraction truncated), '0' if not a number.
    toIntegerString(text) {
        const n = parseFloat(text);
        return Number.isFinite(n) ? BigInt(Math.trunc(n)).toString() : '0';
    }

    baseSuffix() {
        return { 2: ' (BIN)', 8: ' (OCT)', 10: '', 16: ' (HEX)' }[this.currentBase];
    }

    showError() {
        this.currentOperand = 'Erreur';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.updateDisplay();
    }

    memoryClear() {
        this.memory = 0;
        this.memoryIndicator.classList.remove('active');
        this.playSound('memory');
    }

    memoryRecall() {
        this.currentOperand = this.isProgrammer()
            ? this.formatInteger(BigInt(Math.trunc(this.memory)))
            : this.memory.toString();
        this.updateDisplay();
        this.playSound('memory');
    }

    memoryAdd() {
        this.memory += this.currentValueAsNumber();
        this.memoryIndicator.classList.add('active');
        this.playSound('memory');
    }

    memorySubtract() {
        this.memory -= this.currentValueAsNumber();
        this.memoryIndicator.classList.add('active');
        this.playSound('memory');
    }

    currentValueAsNumber() {
        if (this.isProgrammer()) {
            const value = this.parseInteger(this.currentOperand);
            return value === null ? 0 : Number(value);
        }
        return parseFloat(this.currentOperand) || 0;
    }

    scientificFunction(func) {
        const current = parseFloat(this.currentOperand);
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                break;
            case 'pow':
                result = Math.pow(current, 2);
                break;
            case 'pow3':
                result = Math.pow(current, 3);
                break;
            case 'exp':
                result = Math.exp(current);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'factorial':
                result = this.factorial(Math.floor(current));
                break;
            case 'abs':
                result = Math.abs(current);
                break;
            case 'round':
                result = Math.round(current);
                break;
            case 'ceil':
                result = Math.ceil(current);
                break;
            case 'floor':
                result = Math.floor(current);
                break;
        }

        if (result !== undefined) {
            const historyEntry = `${func}(${this.getFormattedNumber(current)}) = ${this.getFormattedNumber(result)}`;
            this.addToHistory(historyEntry, result.toString());
            this.currentOperand = result.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
        }
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    changeBase(base) {
        const newBase = { hex: 16, dec: 10, oct: 8, bin: 2 }[base];
        if (!newBase) return;
        const convert = text => {
            const value = this.parseInteger(text, this.currentBase);
            return value === null ? null : this.formatInteger(value, newBase);
        };

        this.currentOperand = convert(this.currentOperand) ?? '0';
        // Keep a pending operation consistent: its first operand switches base too
        if (this.previousOperand !== '') {
            const prev = convert(this.previousOperand);
            if (prev === null) {
                this.previousOperand = '';
                this.operation = undefined;
            } else {
                this.previousOperand = prev;
            }
        }
        this.currentBase = newBase;

        this.updateDigitButtons();
        this.updateDisplay();
        this.updateBaseButtons(base);
    }

    // In programmer mode, disable the digit keys that are invalid in the current base.
    updateDigitButtons() {
        const programmer = this.isProgrammer();
        document.querySelectorAll('[data-number], [data-prog-number]').forEach(button => {
            button.disabled = programmer && !this.isValidDigit(button.textContent.trim());
        });
    }

    updateBaseButtons(activeBase) {
        document.querySelectorAll('[data-base]').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.base === activeBase) {
                button.classList.add('active');
            }
        });
    }

    bitwiseOperation(operation) {
        if (operation !== 'not') {
            // AND / OR / XOR are binary operators like + and -, resolved by =
            this.chooseOperation(operation.toUpperCase());
            return;
        }
        const current = this.parseInteger(this.currentOperand);
        if (current === null) return;
        const value = this.formatInteger(~current);
        this.addToHistory(`NOT(${this.getFormattedNumber(this.formatInteger(current))}) = ${this.getFormattedNumber(value)}${this.baseSuffix()}`, value);
        this.currentOperand = value;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    switchMode(mode) {
        const wasProgrammer = this.isProgrammer();
        if (wasProgrammer && mode !== 'programmer') {
            this.leaveProgrammerMode();
        } else if (!wasProgrammer && mode === 'programmer') {
            this.enterProgrammerMode();
        }
        this.currentMode = mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        document.querySelectorAll('.buttons').forEach(buttons => {
            buttons.classList.remove('active');
        });

        // The digit/operator keypad stays visible in every mode; scientific and
        // programmer keys are shown above it.
        this.basicButtons.classList.add('active');
        switch (mode) {
            case 'basic':
                break;
            case 'scientific':
                this.scientificButtons.classList.add('active');
                break;
            case 'programmer':
                this.programmerButtons.classList.add('active');
                break;
        }
        this.updateDigitButtons();
        this.updateDisplay();
    }

    // Entering programmer mode (always in DEC): operands become integers.
    enterProgrammerMode() {
        this.currentOperand = this.toIntegerString(this.currentOperand);
        if (this.previousOperand !== '') {
            this.previousOperand = this.toIntegerString(this.previousOperand);
        }
    }

    // Leaving programmer mode: back to DEC, drop operators that only exist there.
    leaveProgrammerMode() {
        if (this.currentBase !== 10) this.changeBase('dec');
        if (['<<', '>>', 'AND', 'OR', 'XOR'].includes(this.operation)) {
            this.previousOperand = '';
            this.operation = undefined;
        }
    }

    changeTheme(theme) {
        const bodyClasses = document.body.className.split(' ');
        const darkModeClass = bodyClasses.find(c => c === 'dark-mode');
        const soundEnabledClass = bodyClasses.find(c => c === 'sound-enabled');
        
        document.body.className = '';
        
        if (theme !== 'cyberpunk') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        if (darkModeClass) {
            document.body.classList.add(darkModeClass);
        }
        
        if (soundEnabledClass) {
            document.body.classList.add(soundEnabledClass);
        }
        
        this.currentTheme = theme;
        this.savePreferences();
        this.animateThemeChange();
    }

    animateThemeChange() {
        const calculator = document.querySelector('.calculator');
        if (calculator) {
            calculator.style.transform = 'scale(0.95)';
            calculator.style.opacity = '0.8';
            
            setTimeout(() => {
                calculator.style.transform = 'scale(1)';
                calculator.style.opacity = '1';
            }, 300);
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('.mode-icon');
        icon.textContent = this.darkMode ? '☀️' : '🌙';
        this.savePreferences();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = document.querySelector('.sound-icon');
        icon.textContent = this.soundEnabled ? '🔊' : '🔇';
        document.body.classList.toggle('sound-enabled', this.soundEnabled);
        this.savePreferences();
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('active');
    }

    // `value` is the raw result (string in `base`), used to reuse it exactly.
    addToHistory(entry, value) {
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        const base = this.isProgrammer() ? this.currentBase : 10;
        this.history.unshift({ entry, timestamp, value, base });
        if (this.history.length > 50) {
            this.history.pop();
        }
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    updateHistoryDisplay() {
        this.historyList.replaceChildren();
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            // Build nodes with textContent: history comes from localStorage
            // and must never be parsed as HTML.
            const timeElement = document.createElement('div');
            timeElement.style.fontSize = '0.7rem';
            timeElement.style.color = 'var(--text-secondary)';
            timeElement.style.marginBottom = '0.25rem';
            timeElement.textContent = String(item.timestamp ?? '');

            const entryElement = document.createElement('div');
            entryElement.textContent = String(item.entry ?? '');

            historyItem.append(timeElement, entryElement);
            historyItem.addEventListener('click', () => this.reuseHistoryItem(item));
            this.historyList.appendChild(historyItem);
        });
    }

    reuseHistoryItem(item) {
        let text;
        let base = 10;
        if (typeof item.value === 'string') {
            text = item.value;
            base = [2, 8, 10, 16].includes(item.base) ? item.base : 10;
        } else {
            // Older entries only have the displayed text, formatted fr-FR ("1 234,5")
            const shown = String(item.entry ?? '').split(' = ')[1];
            if (!shown) return;
            text = shown.replace(/\s/g, '').replace(/\u2212/g, '-').replace(',', '.');
        }

        let value;
        if (this.isProgrammer()) {
            const integer = base === 10
                ? this.parseInteger(this.toIntegerString(text), 10)
                : this.parseInteger(text, base);
            if (integer === null) return;
            value = this.formatInteger(integer);
        } else if (base === 10) {
            if (!Number.isFinite(parseFloat(text))) return;
            value = text;
        } else {
            const integer = this.parseInteger(text, base);
            if (integer === null) return;
            value = integer.toString();
        }

        this.currentOperand = value;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        localStorage.removeItem('calculatorHistory');
    }

    getFormattedNumber(number) {
        if (number === '' || number === null || number === undefined) return '';
        if (this.isProgrammer() && this.currentBase !== 10) {
            // Values are already strings in the current base (e.g. "1E" in HEX)
            return number === 'Erreur' ? number : String(number).toUpperCase();
        }
        if (typeof number === 'string' && isNaN(parseFloat(number))) return number;
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 10
        }).format(number);
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getFormattedNumber(this.currentOperand) || this.currentOperand;
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getFormattedNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    initializeAudio() {
        this.audioContext = null;
        this.sounds = {
            click: { frequency: 800, duration: 50 },
            operation: { frequency: 600, duration: 80 },
            equals: { frequency: 1000, duration: 100 },
            clear: { frequency: 400, duration: 150 },
            delete: { frequency: 500, duration: 60 },
            memory: { frequency: 900, duration: 70 },
            mode: { frequency: 700, duration: 90 },
            scientific: { frequency: 1200, duration: 60 },
            base: { frequency: 550, duration: 70 },
            bitwise: { frequency: 650, duration: 80 }
        };
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const sound = this.sounds[type];
            if (!sound) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = sound.frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration / 1000);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    savePreferences() {
        const preferences = {
            theme: this.currentTheme,
            darkMode: this.darkMode,
            soundEnabled: this.soundEnabled,
            currentMode: this.currentMode
        };
        localStorage.setItem('calculatorPreferences', JSON.stringify(preferences));
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('calculatorPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                
                if (preferences.theme) {
                    this.changeTheme(preferences.theme);
                    const themeSelect = document.getElementById('themeSelect');
                    if (themeSelect) {
                        themeSelect.value = preferences.theme;
                    }
                }
                
                if (preferences.darkMode) {
                    this.toggleDarkMode();
                }
                
                if (preferences.soundEnabled === false) {
                    this.toggleSound();
                }
                
                if (preferences.currentMode) {
                    this.switchMode(preferences.currentMode);
                }
            }
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
        
        this.loadHistory();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            }
        } catch (e) {
            console.error('Error loading history:', e);
            this.history = [];
        }
    }

    showLoadingScreen() {
        this.loadingScreen.classList.add('active');
        
        setTimeout(() => {
            this.loadingScreen.classList.remove('active');
            this.animateCalculatorEntrance();
        }, 1500);
    }

    animateCalculatorEntrance() {
        const elements = [
            '.app-header',
            '.calculator',
            '.calculator-info',
            '.app-footer'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.5s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const calculator = new AdvancedCalculator();
});

console.log('%c🎮 Cyber Calculator Pro Loaded!', 'color: #00d4ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);');
console.log('%cDeveloped by Frederic Bourouliou', 'color: #ff00ff; font-size: 14px;');
console.log('%cVersion 2.0 - Professional Edition', 'color: #00ff88; font-size: 12px;');