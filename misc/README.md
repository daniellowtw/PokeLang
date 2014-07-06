# Misc

## Creating the browser version for distribution

This will make a browser version for the modules.

`npm install browserify`
`browserify browser.js --s poke -o ../public/scripts/browser_version.js`

## Scraping move lists


`python pokemon.py` This will read pokemon_moves.txt and generate pokemon_out.txt which extracts relevant information of each pokemon.

## Sample

`test.poke` contains a sample program.
`ast.json` contains the corresponding ast tree for test.poke.