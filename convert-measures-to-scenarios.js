const fs = require('fs');

// Read the woningen file
const woningen = JSON.parse(fs.readFileSync('/Users/ruben/Downloads/Greenbooster.woningen.json', 'utf8'));

// Group woningen by street address and convert to scenarios
const streetGroups = {};

woningen.forEach(woning => {
  // Only process woningen that have measures
  if (!woning.measures || woning.measures.length === 0) {
    return;
  }

  const street = woning.projectInformation?.adres;
  if (!street) {
    return;
  }

  // Initialize array for this street if it doesn't exist
  if (!streetGroups[street]) {
    streetGroups[street] = [];
  }

  // Extract only the measure IDs
  const measureIds = woning.measures.map(measure => measure._id);

  streetGroups[street].push({
    measureIds,
    woningId: woning._id.$oid
  });
});

// Convert to scenarios with sequential letters per street
const scenarios = [];
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

Object.entries(streetGroups).forEach(([street, woningenOnStreet]) => {
  woningenOnStreet.forEach((woning, index) => {
    const letter = alphabet[index] || `${alphabet[Math.floor(index / 26) - 1]}${alphabet[index % 26]}`;

    scenarios.push({
      naam: `${street} Scenario ${letter}`,
      measureIds: woning.measureIds,
      createdAt: new Date()
    });
  });
});

// Write output
const output = JSON.stringify(scenarios, null, 2);
fs.writeFileSync('/Users/ruben/Downloads/converted-scenarios.json', output, 'utf8');

console.log(`Converted ${scenarios.length} scenarios from ${Object.keys(streetGroups).length} streets`);
console.log(`Output written to: /Users/ruben/Downloads/converted-scenarios.json`);

// Print summary
console.log('\nSummary by street:');
Object.entries(streetGroups).forEach(([street, woningenOnStreet]) => {
  console.log(`  ${street}: ${woningenOnStreet.length} scenario(s)`);
});
