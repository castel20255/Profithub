const fs = require('fs');
const path = require('path');

const normalBotsDir = path.join(__dirname, '../pages/free-bot/Normal Bot');
const automatedBotsDir = path.join(__dirname, '../pages/free-bot/Automated Bots');

function readXMLFiles(dir, isPremium) {
    const files = fs.readdirSync(dir);
    return files
        .filter(file => file.endsWith('.xml'))
        .map(file => {
            const filePath = path.join(dir, file);
            const xml = fs.readFileSync(filePath, 'utf-8');
            const name = file.replace('.xml', '');
            const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            return {
                id,
                name,
                xml: JSON.stringify(xml),
                isPremium,
            };
        });
}

const normalBots = readXMLFiles(normalBotsDir, false);
const premiumBots = readXMLFiles(automatedBotsDir, true);
const allBots = [...normalBots, ...premiumBots];

const output = `// Auto-generated file - Do not edit manually
export const PRE_LOADED_BOTS = ${JSON.stringify(allBots, null, 2)};
`;

const outputPath = path.join(__dirname, '../pages/free-bot/preloaded-bots-data.ts');
fs.writeFileSync(outputPath, output);

console.log(`Generated ${allBots.length} bot strategies (${normalBots.length} normal, ${premiumBots.length} premium)`);
