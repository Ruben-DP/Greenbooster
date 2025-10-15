const fs = require('fs');

// Read files
const woningen = JSON.parse(fs.readFileSync('/Users/ruben/Downloads/Greenbooster.woningen.json', 'utf8'));
const scenarios = JSON.parse(fs.readFileSync('/Users/ruben/Downloads/converted-scenarios.json', 'utf8'));

// Create a map of address to woning with measures
const addressToWoningMap = new Map();

woningen.forEach(woning => {
  // Only map woningen that have measures
  if (woning.measures && woning.measures.length > 0) {
    const address = woning.projectInformation?.adres;
    if (address) {
      // Store the woning with its measures
      addressToWoningMap.set(address, {
        woningId: woning._id.$oid,
        measureIds: woning.measures.map(m => m._id),
        measureCount: woning.measures.length
      });
    }
  }
});

console.log(`Found ${addressToWoningMap.size} residences with measures\n`);

// Match scenarios to residences and add woningId
const scenariosWithReferences = scenarios.map(scenario => {
  // Extract address from scenario name (remove " Scenario X" suffix)
  const address = scenario.naam.replace(/ Scenario [A-Z]+$/, '');

  const woningData = addressToWoningMap.get(address);

  if (woningData) {
    console.log(`✓ Matched: ${scenario.naam} → Woning ID: ${woningData.woningId}`);
    console.log(`  Measures: ${scenario.measureIds.length} in scenario, ${woningData.measureCount} in woning`);

    // Verify measure IDs match
    const scenarioIds = new Set(scenario.measureIds);
    const woningIds = new Set(woningData.measureIds);
    const matching = scenario.measureIds.filter(id => woningIds.has(id)).length;

    if (matching !== scenario.measureIds.length) {
      console.log(`  ⚠️  Warning: Only ${matching}/${scenario.measureIds.length} measure IDs match`);
    }

    return {
      ...scenario,
      woningId: woningData.woningId
    };
  } else {
    console.log(`✗ No match found for: ${scenario.naam} (address: "${address}")`);
    return {
      ...scenario,
      woningId: null
    };
  }
});

// Write output
const output = JSON.stringify(scenariosWithReferences, null, 2);
fs.writeFileSync('/Users/ruben/Downloads/scenarios-with-references.json', output, 'utf8');

console.log(`\n✓ Output written to: /Users/ruben/Downloads/scenarios-with-references.json`);
console.log(`\nSummary:`);
console.log(`  Total scenarios: ${scenariosWithReferences.length}`);
console.log(`  Matched to residence: ${scenariosWithReferences.filter(s => s.woningId).length}`);
console.log(`  Unmatched: ${scenariosWithReferences.filter(s => !s.woningId).length}`);
