# Cyber Calculator

A themed browser calculator with basic, scientific and programmer modes, written in plain HTML, CSS and JavaScript.

![Cyber Calculator in the Cyberpunk theme, with the history panel open](capture1.png)

**[▶ Live demo](https://fredbourouliou.github.io/cyber_calculette/)**

## What it does

- **Basic mode**: addition, subtraction, multiplication, division, modulo (`%`), memory keys (MC, MR, M+, M−), clear and backspace. Division by zero shows an error instead of `Infinity`.
- **Scientific mode**: sin, cos, tan (in degrees), log₁₀, ln, √, x², x³, eˣ, π, e, n!, |x|, round, ceil, floor. Each function applies to the number on the display.
- **Programmer mode**: converts the current integer between HEX, DEC, OCT and BIN; bitwise NOT, and AND / OR / XOR against the previous operand.
- **History**: the last 50 calculations with a timestamp; clicking an entry puts its result back on the display.
- **Themes**: seven visual themes selectable from a menu, plus a separate dark-mode toggle.
- **Sound**: short tones generated with the Web Audio API on key presses, can be muted.
- **Keyboard**: digits, `.`, `+ - * / %`, `Enter` or `=`, `Esc` (clear), `Backspace`, `H` (history panel).
- **Persistence**: theme, dark mode, sound setting, mode and history are saved in `localStorage`.

Numbers are formatted with the French locale (decimal comma, space as thousands separator).

## Known limitations

- The `<<` and `>>` buttons in programmer mode are not wired to any action yet.
- Arithmetic operators parse operands as decimal, so `+ - × ÷` are only reliable in DEC.
- Reusing a decimal result from the history drops the fractional part (`2,5` is read back as `2`).

## How it is built

- `index.html`: markup for the three button panels, history panel and controls.
- `style.css`: layout (CSS Grid), themes as CSS custom properties, animations, responsive breakpoints at 1200 px and 768 px, and a `prefers-reduced-motion` override.
- `script.js`: a single `AdvancedCalculator` class handling input, computation, history, preferences and sound.

No framework and no build step. The only external resource is the set of display fonts loaded from Google Fonts. History entries are rendered with `textContent`, never parsed as HTML.

## Run locally

```bash
git clone https://github.com/FredBourouliou/cyber_calculette.git
cd cyber_calculette
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly in a browser also works.

## License

[MIT](LICENSE)
