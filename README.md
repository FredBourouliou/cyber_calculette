# Cyber Calculator

A themed browser calculator with basic, scientific and programmer modes, written in plain HTML, CSS and JavaScript.

![Cyber Calculator in the Cyberpunk theme, with the history panel open](capture1.png)

**[▶ Live demo](https://fredbourouliou.github.io/cyber_calculette/)**

## What it does

- **Basic mode**: addition, subtraction, multiplication, division, modulo (`%`), memory keys (MC, MR, M+, M−), clear and backspace. Division by zero shows an error instead of `Infinity`.
- **Scientific mode**: sin, cos, tan (in degrees), log₁₀, ln, √, x², x³, eˣ, π, e, n!, |x|, round, ceil, floor. Each function applies to the number on the display.
- **Programmer mode**: integer arithmetic in HEX, DEC, OCT or BIN. Operands are typed and shown in the current base, and `+ − × ÷ %` work on integers (`÷` is integer division, so `FF ÷ 2 = 7F`). `<<` and `>>` shift bits (`8 << 2 = 32`), `AND`, `OR` and `XOR` are binary operators like `+`, and `NOT` applies to the displayed value. Changing the base converts the display and any pending operand, and keys that are invalid in the current base are disabled. Integers are arbitrary-precision (`BigInt`), so results stay exact at any size.
- **Keypad**: the digit and operator keys stay visible in every mode; scientific and programmer keys appear above them.
- **History**: the last 50 calculations with a timestamp; clicking an entry puts its exact result back on the display (`2,5` stays `2,5`). Results computed in HEX, OCT or BIN are tagged with their base and converted when reused elsewhere.
- **Themes**: seven visual themes selectable from a menu, plus a separate dark-mode toggle.
- **Sound**: short tones generated with the Web Audio API on key presses, can be muted.
- **Keyboard**: digits, `.`, `+ - * / %`, `Enter` or `=`, `Esc` (clear), `Backspace`, `H` (history panel); in programmer mode also `A`–`F` (in HEX), `<` and `>` (shifts).
- **Persistence**: theme, dark mode, sound setting, mode and history are saved in `localStorage`.

Numbers are formatted with the French locale (decimal comma, space as thousands separator).

## Known limitations

- Programmer mode has no fixed word size (8/16/32/64 bits): negative numbers are shown with a minus sign rather than in two's complement, and `NOT x` gives `−(x + 1)`.
- Programmer results saved in the history before this version carry no base tag and are read back as decimal.

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
