const fs = require('fs');
const path = require('path');

// Title Case helper
function titleCase(str) {
  const smallWords = ['and', 'or', 'but', 'a', 'an', 'the', 'in', 'on', 'at', 'with', 'by', 'for', 'of', 'to', 'as', 'vs', 'into'];
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && smallWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function convertFile(txtPath) {
  const mdPath = txtPath.replace(/\.txt$/, '.md');
  console.log(`Converting: ${txtPath} -> ${mdPath}`);
  
  const content = fs.readFileSync(txtPath, 'utf8');
  const rawLines = content.split(/\r?\n/);
  
  let outputLines = [];
  let i = 0;
  
  // 1. Parse Title Block at the very beginning
  if (rawLines[0] && rawLines[0].trim().match(/^={10,}$/)) {
    let title = 'Study Guide';
    let subtitle = '';
    i++; // skip first divider
    
    while (i < rawLines.length && !rawLines[i].trim().match(/^={10,}$/)) {
      const line = rawLines[i].trim();
      if (line.startsWith('STUDY GUIDE:')) {
        title = line;
      } else if (line.length > 0) {
        subtitle = line;
      }
      i++;
    }
    i++; // skip closing divider
    
    outputLines.push(`# ${title}`);
    if (subtitle) {
      outputLines.push(`\n> **${subtitle}**\n`);
    }
    outputLines.push('---\n');
  }
  
  // 2. Read the remaining lines
  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();
    
    // Skip empty end-of-study-guide lines
    if (trimmed.includes('END OF STUDY GUIDE') || (trimmed.match(/^={5,}$/) && i >= rawLines.length - 5)) {
      i++;
      continue;
    }
    
    // Check if it's a Major Section Header
    // If the next line is a divider
    const nextLine = rawLines[i + 1];
    const isNextDivider = nextLine && (nextLine.trim().match(/^={10,}$/) || nextLine.trim().match(/^-{10,}$/));
    if (isNextDivider && trimmed.length > 0) {
      let cleanHeader = trimmed;
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        cleanHeader = `${numMatch[1]}. ${titleCase(numMatch[2])}`;
      } else {
        cleanHeader = titleCase(cleanHeader);
      }
      outputLines.push(`\n## ${cleanHeader}\n`);
      i += 2; // skip header and its divider line
      continue;
    }
    
    // Check if it's a Code Block candidate
    // A code block starts if the line is indented by 4+ spaces, is not empty, does not start with bullet symbols,
    // and contains code keywords, OR we look ahead to see a block of indented code.
    const leadingSpaces = line.length - line.trimStart().length;
    const isCodeStart = leadingSpaces >= 4 && trimmed.length > 0 && 
                        !trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.match(/^\d+\./) && !trimmed.match(/^[A-Z]\)/) &&
                        (trimmed.includes('df =') || trimmed.includes('df.') || trimmed.includes('spark.') || trimmed.includes('%%') || trimmed.includes('SELECT') || trimmed.includes('CREATE TABLE') || trimmed.includes('import ') || trimmed.includes('from '));
    
    if (isCodeStart) {
      let codeLines = [];
      let codeType = 'python';
      
      // Consume consecutive lines starting with 4+ spaces or empty lines
      while (i < rawLines.length) {
        const cLine = rawLines[i];
        const cTrimmed = cLine.trim();
        const cSpaces = cLine.length - cLine.trimStart().length;
        
        // Stop code block if line is less indented and not empty, or is a bullet list
        if (cTrimmed.length > 0 && (cSpaces < 4 || cTrimmed.startsWith('-') || cTrimmed.startsWith('*') || cTrimmed.match(/^\d+\./) || cTrimmed.match(/^[A-Z]\)/))) {
          break;
        }
        
        if (cTrimmed.startsWith('%%sql') || cTrimmed.includes('SELECT') || cTrimmed.includes('CREATE TABLE')) {
          codeType = 'sql';
        } else if (cTrimmed.startsWith('%%configure') || cTrimmed.startsWith('{') || cTrimmed.startsWith('"conf"')) {
          codeType = 'json';
        }
        
        // Push line, stripping exactly 4 spaces of indentation if present
        codeLines.push(cLine.startsWith('    ') ? cLine.slice(4) : cLine.trimStart());
        i++;
      }
      
      // Trim empty lines from the end of the code block
      while (codeLines.length > 0 && codeLines[codeLines.length - 1].trim() === '') {
        codeLines.pop();
      }
      
      outputLines.push(`\`\`\`${codeType}`);
      outputLines.push(...codeLines);
      outputLines.push('\`\`\`\n');
      continue;
    }
    
    // Parse List Items and other structures
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const bulletContent = trimmed.slice(1).trim();
      if (leadingSpaces >= 4) {
        outputLines.push(`  - ${bulletContent}`);
      } else {
        outputLines.push(`- ${bulletContent}`);
      }
      i++;
      continue;
    }
    
    // Parse numbered sub-bullets: "  1. Ingest Data" -> "  1. Ingest Data"
    const numSubMatch = line.match(/^(\s{2,})(\d+)\.\s+(.+)$/);
    if (numSubMatch) {
      const spaces = numSubMatch[1].length;
      const num = numSubMatch[2];
      const text = numSubMatch[3];
      const prefix = spaces >= 4 ? '  ' : '';
      outputLines.push(`${prefix}${num}. ${text}`);
      i++;
      continue;
    }
    
    // Parse alphabetical lists: "  A) Native Execution Engine:" -> "  - **A)** **Native Execution Engine:**"
    const alphaMatch = line.match(/^(\s{2,})([A-Z\d]+)\)\s+(.+)$/);
    if (alphaMatch) {
      const spaces = alphaMatch[1].length;
      const bullet = alphaMatch[2];
      const text = alphaMatch[3];
      const prefix = spaces >= 4 ? '  ' : '';
      
      let formattedText = text;
      if (text.endsWith(':')) {
        formattedText = `**${text.slice(0, -1)}**:`;
      }
      
      outputLines.push(`${prefix}- **${bullet})** ${formattedText}`);
      i++;
      continue;
    }
    
    // Parse Sub-sections: "1.1 What is Apache Spark?" -> "### 1.1 What is Apache Spark?"
    const subMatch = trimmed.match(/^(\d+\.\d+)\s+(.+)$/);
    if (subMatch) {
      outputLines.push(`### ${subMatch[1]} ${subMatch[2]}\n`);
      i++;
      continue;
    }
    
    // Highlight short titles ending with colons: "Key Characteristics:" -> "**Key Characteristics:**"
    if (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.startsWith('http') && !trimmed.startsWith('file')) {
      const prefix = leadingSpaces >= 4 ? '    ' : (leadingSpaces >= 2 ? '  ' : '');
      outputLines.push(`${prefix}**${trimmed}**`);
      i++;
      continue;
    }
    
    // Standard paragraph or empty line
    if (trimmed === '') {
      outputLines.push('');
    } else {
      const prefix = leadingSpaces >= 4 ? '    ' : (leadingSpaces >= 2 ? '  ' : '');
      outputLines.push(prefix + trimmed);
    }
    
    i++;
  }
  
  // Clean double blank lines
  let cleanLines = [];
  for (let j = 0; j < outputLines.length; j++) {
    if (outputLines[j] === '' && outputLines[j - 1] === '') {
      continue;
    }
    cleanLines.push(outputLines[j]);
  }
  
  fs.writeFileSync(mdPath, cleanLines.join('\n'), 'utf8');
  console.log(`Successfully saved Markdown to ${mdPath}`);
}

function main() {
  const targetDir = path.join(__dirname, '..', 'Dp-700', 'Implement Lakehouse');
  
  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory not found: ${targetDir}`);
    process.exit(1);
  }
  
  const folders = fs.readdirSync(targetDir);
  let count = 0;
  
  for (const folder of folders) {
    const fullPath = path.join(targetDir, folder);
    if (fs.statSync(fullPath).isDirectory()) {
      const txtPath = path.join(fullPath, 'Overview.txt');
      if (fs.existsSync(txtPath)) {
        convertFile(txtPath);
        count++;
      }
    }
  }
  
  console.log(`\nDone! Processed ${count} files successfully.`);
}

main();
