import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

type CellValue = string | undefined;

export type SheetRows = Record<number, Record<string, CellValue>>;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  trimValues: false,
});

function parseCellValue(cell: any): CellValue {
  if (!cell) return undefined;

  // Inline string
  if (cell.is) {
    const inline = cell.is.t;
    if (typeof inline === "string") return inline;
    if (Array.isArray(inline)) {
      return inline
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") return item.text ?? item["#text"] ?? "";
          return "";
        })
        .join("");
    }
    if (inline && typeof inline === "object") {
      if (typeof inline.text === "string") return inline.text;
      if (typeof inline["#text"] === "string") return inline["#text"];
    }

    // Rich text inline strings (<is><r><t>...</t></r>...</is>)
    if (cell.is.r) {
      const fragments = Array.isArray(cell.is.r) ? cell.is.r : [cell.is.r];
      const texto = fragments
        .map((part: any) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object") {
            if (typeof part.t === "string") return part.t;
            if (part.t && typeof part.t === "object") {
              if (typeof part.t.text === "string") return part.t.text;
              if (typeof part.t["#text"] === "string") return part.t["#text"];
            }
            if (typeof part.text === "string") return part.text;
          }
          return "";
        })
        .join("");
      return texto || undefined;
    }
  }

  // Shared string não é usado neste template; se aparecer, retorna v
  if (cell.v !== undefined) {
    if (typeof cell.v === "string") return cell.v;
    if (typeof cell.v === "number") return String(cell.v);
    if (cell.v && typeof cell.v === "object") {
      return typeof cell.v.text === "string" ? cell.v.text : undefined;
    }
  }

  return undefined;
}

function splitCellRef(ref: string | undefined): { col: string; row: number } | null {
  if (!ref) return null;
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  return { col: match[1], row: Number(match[2]) };
}

export async function loadWorkbookSheets(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");

  if (!workbookXml || !relsXml) {
    throw new Error("Workbook inválido: não encontrei workbook.xml ou relationships");
  }

  const workbook = xmlParser.parse(workbookXml);
  const rels = xmlParser.parse(relsXml);

  const relMap = new Map<string, string>();
  const relList = rels.Relationships?.Relationship;
  const relArray = Array.isArray(relList) ? relList : relList ? [relList] : [];
  for (const rel of relArray) {
    if (rel.Type?.includes("/worksheet")) {
      relMap.set(rel.Id, rel.Target);
    }
  }

  const sheetsRaw = workbook.workbook?.sheets?.sheet ?? workbook.sheets?.sheet;
  const sheets = Array.isArray(sheetsRaw) ? sheetsRaw : sheetsRaw ? [sheetsRaw] : [];

  const result: { name: string; path: string; rows: SheetRows }[] = [];

  for (const sheet of sheets) {
    const relId = sheet["r:id"];
    const target = relMap.get(relId);
    if (!target) continue;
    const sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    const xml = await zip.file(sheetPath)?.async("text");
    if (!xml) continue;
    const parsed = xmlParser.parse(xml);
    const rowsData = parsed.worksheet?.sheetData?.row;
    const rowsArray = Array.isArray(rowsData) ? rowsData : rowsData ? [rowsData] : [];

    const rows: SheetRows = {};
    for (const r of rowsArray) {
      const cells = r.c;
      const cellsArray = Array.isArray(cells) ? cells : cells ? [cells] : [];
      for (const cell of cellsArray) {
        const ref = splitCellRef(cell.r);
        if (!ref) continue;
        const value = parseCellValue(cell);
        if (value === undefined) continue;
        if (!rows[ref.row]) rows[ref.row] = {};
        rows[ref.row][ref.col] = value;
      }
    }

    result.push({
      name: sheet["name"] ?? "sheet",
      path: sheetPath,
      rows,
    });
  }

  return result;
}
