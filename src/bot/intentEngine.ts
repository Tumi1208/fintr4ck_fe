type IntentRule = {
  name:
    | "add_expense"
    | "add_income"
    | "report"
    | "create_category"
    | "join_challenge"
    | "help";
  keywords: string[];
  synonyms: string[];
  patterns?: RegExp[];
};

export const intentRules: IntentRule[] = [
  {
    name: "add_expense",
    keywords: ["thêm chi", "giao dịch chi", "chi tiêu", "chi phí", "ghi chi", "khoản chi"],
    synonyms: ["expense", "spending", "thanh toán", "chi mới", "add expense"],
    patterns: [/\bthem\s+(khoan\s+)?chi/, /\bghi\s+chu?i?\s*chi/],
  },
  {
    name: "add_income",
    keywords: ["thêm thu", "thu nhập", "khoản thu", "ghi thu", "thu mới"],
    synonyms: ["income", "earnings", "revenue", "add income"],
    patterns: [/\bthem\s+(khoan\s+)?thu/, /\bghi\s+thu/],
  },
  {
    name: "report",
    keywords: ["báo cáo", "report", "thống kê", "biểu đồ", "chart", "thống kê chi tiêu"],
    synonyms: ["dashboard", "analytics", "xem số liệu", "xem biểu đồ"],
    patterns: [/bao\s*cao/, /thong\s*ke/, /bieu\s*do/],
  },
  {
    name: "create_category",
    keywords: ["danh mục", "category", "tạo danh mục", "thêm danh mục", "nhóm chi"],
    synonyms: ["new category", "loại chi", "loại thu", "custom category"],
    patterns: [/tao\s+(danh\s+)?muc/, /them\s+(danh\s+)?muc/],
  },
  {
    name: "join_challenge",
    keywords: ["thử thách", "challenge", "tham gia thử thách", "đua top", "challenge saving"],
    synonyms: ["join challenge", "vào thử thách", "chinh phục mục tiêu", "challenge nhóm"],
    patterns: [/thu\s*thach/, /tham\s*gia\s*challenge/],
  },
  {
    name: "help",
    keywords: ["trợ giúp", "help", "hỗ trợ", "hướng dẫn", "cần giúp", "giao dịch"],
    synonyms: ["support", "bắt đầu", "cách dùng", "làm gì được", "transaction"],
    patterns: [/cach\s+su\s*dung/, /huong\s+dan/],
  },
];

const accentRegex = /[\u0300-\u036f]/g;

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(accentRegex, "").toLowerCase();
}

function scoreIntent(text: string, rule: IntentRule): number {
  const normalizedText = normalizeText(text);
  const normalizedKeywords = rule.keywords.map(normalizeText);
  const normalizedSynonyms = rule.synonyms.map(normalizeText);

  let score = 0;

  normalizedKeywords.forEach((keyword) => {
    if (normalizedText.includes(keyword)) score += 2;
  });

  normalizedSynonyms.forEach((synonym) => {
    if (normalizedText.includes(synonym)) score += 1;
  });

  rule.patterns?.forEach((pattern) => {
    if (pattern.test(normalizedText)) score += 2;
  });

  return score;
}

export function detectIntent(text: string): { name: IntentRule["name"] | "unknown"; score: number } {
  const trimmed = text.trim();
  if (!trimmed) return { name: "unknown", score: 0 };

  let bestIntent: IntentRule | null = null;
  let maxScore = 0;

  intentRules.forEach((rule) => {
    const score = scoreIntent(trimmed, rule);
    if (score > maxScore) {
      maxScore = score;
      bestIntent = rule;
    }
  });

  if (!bestIntent || maxScore < 2) return { name: "unknown", score: maxScore };
  return { name: bestIntent.name, score: maxScore };
}
