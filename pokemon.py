__author__ = 'Daniel'
import re;

f = open("pokemon_moves.txt")
g = open("pokemon_out.txt", 'w')

flag = 0
first = 0
firstPokemon = 1
g.writelines('{')
for line in f.readlines():
    match = re.match('^([0-9]+)\.\s(.*?)\s\((.*?)\)', line)
    if match:
        flag = 0
        if firstPokemon:
            firstPokemon = 0
            g.writelines('"'+match.group(2)+'"' + ':{"Index":' + match.group(1) + ',"Type":["' + '","'.join(match.group(3).split('/')) + '"], "Moves": {' + '\n')
        else:
            g.writelines('}},')
            g.writelines('"'+match.group(2)+'"' + ':{"Index":' + match.group(1) +',"Type":["' + '","'.join(match.group(3).split('/')) + '"], "Moves": {' + '\n')
    if flag:
        match = re.match('\s+(.*?)\s\((.*?)\)\s\-\s.*?', line)
        if match and first:
            first = 0
            g.writelines('"'+match.group(1) + '":{"Type":"' + '","'.join(match.group(2).split('/')) + '"}\n')
        elif match:
            g.writelines(',"'+match.group(1) + '":{"Type":"' + '","'.join(match.group(2).split('/')) + '"}  \n')

    match = re.match('.*?Abilities', line)
    if match:
        flag = 1
        first = 1

g.writelines('}}}')

