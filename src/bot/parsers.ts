import { normalizeText } from "./intentEngine";

type DraftTransaction = {
  type: "expense" | "income";
  amount: number;
  note: string;
  date: Date;
  categoryName?: string;
  originalText: string;
};

type DraftCategory = {
  name: string;
  type: "expense" | "income";
  originalText: string;
};

type ParseResult =
  | { kind: "transaction"; draft: DraftTransaction }
  | { kind: "category"; draft: DraftCategory }
  | null;

const numberRegex = /(\d+(?:[\.,]\d+)?)(k|ngan|ngàn|ngàn đồng|tr|trieu|triệu)?/i;

function parseAmount(raw: string): number | null {
  const match = raw.match(numberRegex);
  if (!match) return null;
  const [, numStr, unitRaw] = match;
  const value = parseFloat(numStr.replace(",", "."));
  if (Number.isNaN(value)) return null;
  if (!unitRaw) return Math.round(value);
  const unit = unitRaw.toLowerCase();
  if (unit.startsWith("k") || unit.startsWith("ng")) return Math.round(value * 1_000);
  if (unit.startsWith("tr")) return Math.round(value * 1_000_000);
  if (unit.startsWith("triệu")) return Math.round(value * 1_000_000);
  return Math.round(value);
}

export function parseNaturalInput(text: string): ParseResult {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();

  // Category creation
  const categoryMatch = text.match(/t(?:a|ạ)o\s+danh\s+m[ưu][c̣c]/i) || text.match(/tao danh muc/i);
  if (categoryMatch) {
    const name = text.slice(categoryMatch.index! + categoryMatch[0].length).trim();
    if (name) {
      return {
        kind: "category",
        draft: {
          name,
          type: "expense",
          originalText: text,
        },
      };
    }
  }

  const isIncome = lower.startsWith("thu") || lower.includes("thu nhap");
  const isExpense = lower.startsWith("chi") || lower.includes("chi tieu") || lower.includes("mua");

  const amount = parseAmount(lower);
  if (amount === null) return null;

  // Note extraction: remove amount token and known prefixes
  let note = text;
  const amountIndex = lower.search(numberRegex);
  if (amountIndex >= 0) {
    note = text.slice(0, amountIndex) + text.slice(amountIndex + (text.match(numberRegex)?.[0].length || 0));
  }
  note = note.replace(/(chi tieu|chi|mua|thu nhap|thu)/i, "").trim();
  if (!note) note = "Ghi chú";

  const transactionType: "expense" | "income" = isIncome && !isExpense ? "income" : "expense";

  return {
    kind: "transaction",
    draft: {
      type: transactionType,
      amount,
      note: note.trim(),
      date: new Date(),
      categoryName: undefined,
      originalText: text,
    },
  };
}

export type { DraftTransaction, DraftCategory, ParseResult };
