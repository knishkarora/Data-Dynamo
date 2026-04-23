const fs = require('fs');
const path = require('path');

const tablePath = path.join(__dirname, 'water_context.txt');
const outputPath = path.join(__dirname, 'water_data.json');

try {
  const content = fs.readFileSync(tablePath, 'utf8');
  const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---') && !l.includes('State/UT'));
  
  const states = lines.map(line => {
    const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
    const name = parts[0];
    const totalAvail = parseFloat(parts[1].replace(/,/g, ''));
    const currentAvail = parseFloat(parts[2].replace(/,/g, ''));
    const extractionStage = parseFloat(parts[3].replace(/%/g, ''));
    const futureAvail = parseFloat(parts[4].replace(/,/g, ''));
    
    let status = "safe";
    if (extractionStage > 100) status = "over_exploited";
    else if (extractionStage > 70) status = "semi_critical";
    
    return {
      name,
      metrics: {
        totalAvailability: totalAvail,
        currentAvailability: currentAvail,
        extractionStage: extractionStage,
        futureAvailability: futureAvail,
        stage_of_extraction_percent: extractionStage,
        status: status
      }
    };
  });

  const finalData = {
    source: "Central Ground Water Board (CGWB)",
    lastUpdated: "2023-24 Assessment",
    data: states
  };

  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
  console.log(`Cleaned data saved to ${outputPath}. Found ${states.length} states.`);
} catch (e) {
  console.error(e);
}
