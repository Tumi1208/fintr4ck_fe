const STORAGE_KEY = "fintr4ck_budgets";

function readBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Cannot read budgets", err);
    return [];
  }
}

function writeBudgets(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Cannot write budgets", err);
  }
}

export function getBudgets() {
  const list = readBudgets();
  if (list.length) return list;
  const monthKey = new Date().toISOString().slice(0, 7);
  const seed = [
    { id: "seed-1", categoryId: "food", period: "monthly", limitAmount: 2000000, monthKey },
    { id: "seed-2", categoryId: "transport", period: "monthly", limitAmount: 800000, monthKey },
    { id: "seed-3", categoryId: "entertainment", period: "monthly", limitAmount: 1200000, monthKey },
  ];
  writeBudgets(seed);
  return seed;
}

export function upsertBudget(budget) {
  const list = readBudgets();
  const idx = list.findIndex((b) => b.id === budget.id);
  if (idx >= 0) list[idx] = budget;
  else list.push(budget);
  writeBudgets(list);
  return budget;
}

export function saveBudget({ id, categoryId, period = "monthly", limitAmount, monthKey }) {
  const finalId = id || `budget-${Date.now()}`;
  const payload = {
    id: finalId,
    categoryId,
    period,
    limitAmount: Number(limitAmount) || 0,
    monthKey,
  };
  upsertBudget(payload);
  return payload;
}

export function removeBudget(id) {
  const list = readBudgets().filter((b) => b.id !== id);
  writeBudgets(list);
}
