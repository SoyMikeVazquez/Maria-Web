const fs = require('fs');
const copiaFile = 'src/app/copia/page.tsx';
const originalFile = 'src/app/page.tsx';

let copiaContent = fs.readFileSync(copiaFile, 'utf8');
let origContent = fs.readFileSync(originalFile, 'utf8');

// Grab spaSection from origContent
const spaRegex = /\{\/\* 3D Spa Highlight Section \*\/\}\n\s*<section id="spa" className=\{\`\$\{styles\.spaSection\} reveal\`\}>[\s\S]*?<\/section>\n/;
let spaMatch = origContent.match(spaRegex);

if (!spaMatch) {
  // Let's try matching without the comment just in case
  const spaRegex2 = /<section id="spa" className=\{\`\$\{styles\.spaSection\} reveal\`\}>[\s\S]*?<\/section>\n/;
  spaMatch = origContent.match(spaRegex2);
}

if (!spaMatch) { console.error("Could not find spaSection in orig"); process.exit(1); }
let spaSection = spaMatch[0].replace(/styles\./g, 'salonStyles.'); // Convert to salonStyles

// Add the comment if missing
if (!spaSection.includes("3D Spa Highlight Section")) {
  spaSection = `{/* 3D Spa Highlight Section */}\n` + spaSection;
}

// Grab assistSection, locSection, founderSection from copiaContent
const assistRegex = /\{\/\* Assist Section \*\/\}\n\s*<section className=\{\`\$\{salonStyles\.assistSection\} reveal\`\}>[\s\S]*?<\/section>\n/;
let assistMatch = copiaContent.match(assistRegex);
if (!assistMatch) { console.error("Could not find assistSection"); process.exit(1); }
let assistSection = assistMatch[0];

const locRegex = /\{\/\* Location Section \*\/\}\n\s*<section id="location" className=\{salonStyles\.locationSection\}>[\s\S]*?<\/section>\n/;
let locMatch = copiaContent.match(locRegex);
if (!locMatch) { console.error("Could not find locSection"); process.exit(1); }
let locSection = locMatch[0];

const founderRegex = /\{\/\* Founders Section \*\/\}\n\s*<section className=\{salonStyles\.foundersSection\}>[\s\S]*?<\/section>\n/;
let founderMatch = copiaContent.match(founderRegex);
if (!founderMatch) { console.error("Could not find founderSection"); process.exit(1); }
let founderSection = founderMatch[0];

// Insert spaSection into headSpaExperience (just after <main className={styles.headSpaExperience}>)
const spaInsertionPoint = `            <main className={styles.headSpaExperience}>\n`;
copiaContent = copiaContent.replace(spaInsertionPoint, spaInsertionPoint + `\n${spaSection}\n`);

// Insert the copied sections at the end of headSpaExperience (just before </main>)
// Let's check how the headSpaExperience ends:
const spaEndPointMatch = copiaContent.match(/          <\/section>\n        <\/main>\n      \)\}/);
if (spaEndPointMatch) {
  copiaContent = copiaContent.replace(/          <\/section>\n        <\/main>\n      \)\}/, `          </section>\n${assistSection}\n${locSection}\n${founderSection}\n        </main>\n      )}`);
} else {
  // Try another ending pattern
  copiaContent = copiaContent.replace(/          <\/section>\n        <\/main>/, `          </section>\n${assistSection}\n${locSection}\n${founderSection}\n        </main>`);
}

fs.writeFileSync(copiaFile, copiaContent);
console.log("Success fix!");
