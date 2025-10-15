const fs = require('fs');

// Read the woningen file
const woningen = JSON.parse(fs.readFileSync('/Users/ruben/Downloads/Greenbooster.woningen.json', 'utf8'));

// Create a map to track duplicates by key fields
const residenceMap = new Map();
const duplicates = [];

woningen.forEach((woning, index) => {
  // Create a unique key based on identifying information (excluding measures)
  const key = JSON.stringify({
    projectNumber: woning.projectInformation?.projectNumber,
    complexName: woning.projectInformation?.complexName,
    adres: woning.projectInformation?.adres,
    postcode: woning.projectInformation?.postcode,
    plaats: woning.projectInformation?.plaats,
    typeId: woning.typeId,
    dimensions: woning.dimensions
  });

  if (residenceMap.has(key)) {
    // Found a duplicate
    const firstOccurrence = residenceMap.get(key);
    duplicates.push({
      firstIndex: firstOccurrence.index,
      firstId: firstOccurrence.id,
      duplicateIndex: index,
      duplicateId: woning._id.$oid,
      address: woning.projectInformation?.adres,
      measuresInFirst: firstOccurrence.measuresCount,
      measuresInDuplicate: woning.measures?.length || 0
    });
  } else {
    residenceMap.set(key, {
      index,
      id: woning._id.$oid,
      measuresCount: woning.measures?.length || 0
    });
  }
});

console.log(`Total woningen: ${woningen.length}`);
console.log(`Unique residences: ${residenceMap.size}`);
console.log(`Duplicate residences: ${duplicates.length}`);

if (duplicates.length > 0) {
  console.log('\n=== Duplicates Found ===');
  duplicates.forEach((dup, i) => {
    console.log(`\n${i + 1}. ${dup.address}`);
    console.log(`   First: Index ${dup.firstIndex}, ID: ${dup.firstId}, Measures: ${dup.measuresInFirst}`);
    console.log(`   Duplicate: Index ${dup.duplicateIndex}, ID: ${dup.duplicateId}, Measures: ${dup.measuresInDuplicate}`);
  });
} else {
  console.log('\nNo duplicates found!');
}

// Write detailed report
fs.writeFileSync('/Users/ruben/Downloads/duplicate-report.json', JSON.stringify(duplicates, null, 2), 'utf8');
console.log('\nDetailed report written to: /Users/ruben/Downloads/duplicate-report.json');
