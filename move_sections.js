const fs = require('fs');
const file = 'src/app/copia/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const spaRegex = /\{\/\* Salon 3D Spa Highlight Section \*\/\}\n\s*<section id="spa" className=\{\`\$\{salonStyles\.spaSection\} reveal\`\}>[\s\S]*?<\/section>\n/;
const spaMatch = content.match(spaRegex);
if (!spaMatch) { console.error("Could not find spaSection"); process.exit(1); }
const spaSection = spaMatch[0];

const assistRegex = /\{\/\* Assist Section \*\/\}\n\s*<section className=\{\`\$\{salonStyles\.assistSection\} reveal\`\}>[\s\S]*?<\/section>\n/;
const assistMatch = content.match(assistRegex);
if (!assistMatch) { console.error("Could not find assistSection"); process.exit(1); }
const assistSection = assistMatch[0];

const locRegex = /\{\/\* Location Section \*\/\}\n\s*<section id="location" className=\{salonStyles\.locationSection\}>[\s\S]*?<\/section>\n/;
const locMatch = content.match(locRegex);
if (!locMatch) { console.error("Could not find locSection"); process.exit(1); }
const locSection = locMatch[0];

const founderRegex = /\{\/\* Founders Section \*\/\}\n\s*<section className=\{salonStyles\.foundersSection\}>[\s\S]*?<\/section>\n/;
const founderMatch = content.match(founderRegex);
if (!founderMatch) { console.error("Could not find founderSection"); process.exit(1); }
const founderSection = founderMatch[0];

content = content.replace(spaRegex, '');

const spaInsertionPoint = `      {activeMode === 'spa' && (\n        <div className={styles.spaFullExperience}>\n`;
content = content.replace(spaInsertionPoint, spaInsertionPoint + `\n${spaSection}\n`);

const spaEndPoint = `          </section>\n        </div>\n      )}`;
const copiedSections = `\n${assistSection}\n${locSection}\n${founderSection}\n`;
content = content.replace(spaEndPoint, `          </section>\n${copiedSections}        </div>\n      )}`);

fs.writeFileSync(file, content);
console.log("Success!");
