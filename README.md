# cards

Printable scoreboards for card games — for playing with family and friends at the table.

**Just want to print one?** Open one of these PDFs and print it:

- [`examples/railroad.pdf`](examples/railroad.pdf): **Railroad** for Gary, Gian, Pete, Indy, Raj, Shahi and Harjeet, 15 rounds, India theme
- [`examples/scoreboard-7-players-10-rounds.pdf`](examples/scoreboard-7-players-10-rounds.pdf): blank names, 10 rounds

## Scoreboard

Players are columns, rounds `1..N` are rows, with a **Total** row at the bottom. Leave the player names blank to write them in by hand, or pass names to print them. Pages with more than 4 players print in landscape, and rows shrink as needed so every round and the Total fit on one page.

## Command line

Needs Node 20+.

```sh
npm install

# 7 blank player columns, rounds 1–10 (the default)
node src/cli.js

# Named players, custom title and file
node src/cli.js --players "Mom,Dad,Asha,Raj" --rows 12 --title "Rummy Night" --out out/rummy.html
```

Open the HTML file in a browser and print (Ctrl/⌘ + P).

| Option       | Default               | Meaning                                  |
|--------------|-----------------------|------------------------------------------|
| `--players`  | `7`                   | A count (blank names) or comma-separated names |
| `--rows`     | `10`                  | Number of rounds                         |
| `--title`    | `Scoreboard`          | Heading at the top                       |
| `--out`      | `out/scoreboard.html` | Output file                              |
| `--theme`    | `classic`             | `classic` (black and grey) or `india` (saffron, white and green, with a faint chakra watermark) |
| `--no-total` | off                   | Leave off the Total row                  |

## MCP server

`src/mcp.js` is an MCP server with one tool, `create_scoreboard`, so you can ask Claude things like *"make a scoreboard for Mom, Dad, and the Patels, 15 rounds, called Hearts"*.

Add it to Claude Code:

```sh
claude mcp add cards -- node /path/to/cards/src/mcp.js
```

Files are written to `~/cards-printables/` (override with `CARDS_OUT_DIR`).

## Development

```sh
npm test
npm run example           # regenerate the blank example HTML
npm run example:railroad  # regenerate the Railroad scoresheet
```
