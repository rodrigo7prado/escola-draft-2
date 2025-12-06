import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  trimValues: false,
});

const buffer = readFileSync('tests/fixtures/RS_FichaIndividualAlunoHistorico.xlsx');
const zip = await JSZip.loadAsync(buffer);
const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
const wb = xmlParser.parse(workbookXml);
const sheetsRaw = wb.workbook?.sheets?.sheet ?? wb.sheets?.sheet;
const sheets = Array.isArray(sheetsRaw) ? sheetsRaw : [sheetsRaw];

console.log('Total sheets:', sheets.length);
console.log('Sheet names:', sheets.map(s => s.name).join(', '));

// Ler primeira sheet
const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
const rels = xmlParser.parse(relsXml);
const relList = rels.Relationships?.Relationship;
const relArray = Array.isArray(relList) ? relList : [relList];
const relMap = new Map();
for (const rel of relArray) {
  if (rel.Type?.includes("/worksheet")) {
    relMap.set(rel.Id, rel.Target);
  }
}

const firstSheet = sheets[0];
const relId = firstSheet["r:id"];
const target = relMap.get(relId);
const sheetPath = target.startsWith("/") ? target.slice(1) : 'xl/' + target;
const sheetXml = await zip.file(sheetPath)?.async("text");
const parsed = xmlParser.parse(sheetXml);
const rowsData = parsed.worksheet?.sheetData?.row;
const rowsArray = Array.isArray(rowsData) ? rowsData : [rowsData];

console.log('\n===== SHEET:', firstSheet.name, '=====');
console.log('Total rows:', rowsArray.length);
console.log('\nPrimeiras 30 linhas:\n');

rowsArray.slice(0, 30).forEach((r, idx) => {
  const cells = r.c;
  const cellsArray = Array.isArray(cells) ? cells : cells ? [cells] : [];
  if (cellsArray.length) {
    const values = cellsArray.map(c => {
      const val = c.is?.t || c.v || '';
      const str = typeof val === 'string' ? val : JSON.stringify(val);
      return c.r + '=' + str.substring(0,22);
    }).join(' | ');
    console.log('Row ' + (idx+1) + ':', values);
  }
});
