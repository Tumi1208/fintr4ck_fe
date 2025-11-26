import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectIntent } from "../bot/intentEngine";
import { parseNaturalInput, parseAmount } from "../bot/parsers";
import { apiCreateTransaction } from "../api/transactions";
import { apiCreateCategory } from "../api/categories";
import { authApiHelpers } from "../api/auth";
import { apiGetSummary, apiGetTransactions } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import { getBudgets } from "../utils/budgets";
import { saveBudget } from "../utils/budgets";

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}

function guessTransactionType(text) {
  const intent = detectIntent(text).name;
  if (intent === "add_income") return "income";
  if (intent === "add_expense") return "expense";
  const lower = text.toLowerCase();
  if (lower.includes("thu")) return "income";
  if (lower.includes("chi") || lower.includes("mua")) return "expense";
  return null;
}

const initialDraftState = {
  type: null,
  amount: null,
  categoryName: null,
  note: "",
  originalText: "",
};

const quickSuggestions = [
  "Thêm khoản chi mới",
  "Mình muốn ghi nhận thu nhập",
  "Xem báo cáo chi tiêu tháng này",
  "Tạo danh mục mới",
  "Tham gia thử thách tiết kiệm",
];

const fallbackChips = ["Giao dịch", "Danh mục", "Báo cáo", "Thử thách"];

const quickReplyChips = [
  "Thêm chi tiêu",
  "Thêm thu nhập",
  "Xem báo cáo tháng này",
  "Tạo danh mục",
  "Tham gia thử thách",
  "Trợ giúp",
  "Tạo bộ danh mục chuẩn",
  "Set ngân sách 50/30/20",
];

const commandPalette = [
  { command: "/add-expense", text: "Thêm chi tiêu" },
  { command: "/add-income", text: "Thêm thu nhập" },
  { command: "/report-month", text: "Xem báo cáo tháng này" },
  { command: "/create-category", text: "Tạo danh mục" },
  { command: "/join-challenge", text: "Tham gia thử thách" },
  { command: "/help", text: "Trợ giúp" },
  { command: "/template-categories", text: "Tạo bộ danh mục chuẩn" },
  { command: "/budget-50-30-20", text: "Set ngân sách 50/30/20" },
];

function createMessageId(prefix = "msg") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function splitIntoChunks(text) {
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";
  sentences.forEach((s) => {
    if ((current + " " + s).trim().length > 120 && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = (current + " " + s).trim();
    }
  });
  if (current) chunks.push(current.trim());
  return chunks;
}

function shouldUseReveal(text) {
  if (!text) return false;
  return text.length > 120;
}

function getSectionLabel(context) {
  if (context === "insight") return "— Gợi ý tháng này —";
  if (context === "help") return "— Thao tác nhanh —";
  if (context === "confirm") return "— Xác nhận —";
  return `— ${context} —`;
}

function getChipVariant(label = "") {
  const normalized = label.toLowerCase();
  const primaryKeywords = ["xác nhận", "tiếp tục", "gợi ý", "thêm", "join", "check-in", "tham gia", "set ngân sách"];
  const secondaryKeywords = ["xem", "mở", "để sau", "chi tiết"];
  if (primaryKeywords.some((k) => normalized.includes(k))) return "primary";
  if (secondaryKeywords.some((k) => normalized.includes(k))) return "secondary";
  return "secondary";
}

function buildBotReply(text) {
  const intent = detectIntent(text).name;

  switch (intent) {
    case "add_expense":
      return {
        intent,
        text:
          "Để thêm khoản chi: vào Giao dịch, chọn loại Chi, nhập số tiền, danh mục và ghi chú rồi lưu. Bạn cũng có thể bấm Quick add ngay trên Dashboard.",
      };
    case "add_income":
      return {
        intent,
        text: "Bạn mở Giao dịch, chuyển sang tab Thu, nhập số tiền, danh mục thu và lưu để ghi nhận thu nhập mới.",
      };
    case "report":
      return {
        intent,
        text:
          "Báo cáo nằm ở Dashboard/Reports. Bạn có thể xem biểu đồ breakdown, lọc theo thời gian và danh mục để theo dõi xu hướng chi tiêu.",
        actions: [
          { label: "Mở Dashboard", to: "/app" },
          { label: "Xem Báo cáo", to: "/app" },
        ],
      };
    case "create_category":
      return {
        intent,
        text:
          "Vào mục Danh mục, bấm “Thêm danh mục”, chọn loại (Thu/Chi), đặt tên và icon rồi lưu. Danh mục mới sẽ xuất hiện khi thêm giao dịch.",
        actions: [{ label: "Mở Danh mục", to: "/app/categories" }],
      };
    case "join_challenge":
      return {
        intent,
        text:
          "Bạn mở tab Challenges, chọn thử thách muốn tham gia và bấm Join. Hệ thống sẽ theo dõi tiến độ và nhắc bạn qua bảng điều khiển.",
        actions: [
          { label: "Mở My Challenges", to: "/app/my-challenges" },
          { label: "Tham gia bằng ID", type: "join_challenge_prompt" },
        ],
      };
    case "help":
      return {
        intent,
        text:
          "Mình có thể hỗ trợ cách thêm giao dịch, tạo danh mục, xem báo cáo hoặc tham gia thử thách. Hỏi mình bất cứ lúc nào nhé!",
      };
    default:
      return {
        intent,
        text: "Mình chưa hiểu rõ yêu cầu. Bạn có thể chọn nhanh một trong các chủ đề dưới đây để tiếp tục nhé:",
        chips: fallbackChips,
      };
  }
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [isAnimatingClose, setIsAnimatingClose] = useState(false);
  const [botStatus, setBotStatus] = useState("idle");
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [, setDrafts] = useState([]);
  const [lastIntent, setLastIntent] = useState(null);
  const [draftStep, setDraftStep] = useState(null);
  const [draftTransactionPartial, setDraftTransactionPartial] = useState(initialDraftState);
  const [confirmingId, setConfirmingId] = useState(null);
  const coachPromptedRef = useRef(false);
  const [messages, setMessages] = useState([]);
  const [budgetAlertCount, setBudgetAlertCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [, setContextSection] = useState(null);
  const [reactions, setReactions] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const insightsFetchedRef = useRef(false);
  const listRef = useRef(null);
  const closeTimerRef = useRef(null);
  const typingTimersRef = useRef([]);
  const contextRef = useRef(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      typingTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    maybePromptChallengeCoach();
  }, []);

  const isLayerVisible = open || isAnimatingClose;

  function attachId(msg) {
    if (msg.id) return msg;
    messageIdRef.current += 1;
    const prefix = msg.from === "user" ? "user" : "bot";
    return { ...msg, id: createMessageId(prefix) };
  }

  function addDividerIfNeeded(context) {
    if (!context || contextRef.current === context) return [];
    contextRef.current = context;
    setContextSection(context);
    return [attachId({ from: "bot", type: "divider", text: getSectionLabel(context) })];
  }

  function insertDividerBeforeTyping(context, typingId) {
    if (!context) return;
    setMessages((prev) => {
      const divider = addDividerIfNeeded(context);
      if (!divider.length) return prev;
      const idx = prev.findIndex((m) => m.id === typingId);
      if (idx === -1) return [...prev, ...divider];
      const next = [...prev];
      next.splice(idx, 0, ...divider);
      return next;
    });
  }

  function startReveal(typingId, payload) {
    const chunks = splitIntoChunks(payload.text);
    if (!chunks.length) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === typingId
          ? { from: "bot", id: typingId, typing: false, ...payload, text: chunks[0], reveal: { chunks, index: 1 } }
          : m
      )
    );
    chunks.slice(1).forEach((chunk, idx) => {
      const timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== typingId) return m;
            const joined = `${m.text} ${chunk}`.trim();
            return { ...m, text: joined, reveal: { chunks, index: (m.reveal?.index || 1) + 1 } };
          })
        );
      }, 200 * (idx + 1));
      typingTimersRef.current.push(timer);
    });
  }

  function updateTypingMessage(typingId, payload) {
    if (payload?.text && shouldUseReveal(payload.text) && !payload.draft) {
      startReveal(typingId, payload);
      return;
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === typingId ? { from: "bot", id: typingId, typing: false, ...payload } : m))
    );
  }

  function handleReaction(messageId, value) {
    if (!messageId) return;
    setReactions((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === value ? null : value,
    }));
  }

  async function maybeSendInsights() {
    if (insightsFetchedRef.current) return;
    insightsFetchedRef.current = true;
    try {
      const [summary, cats, txs] = await Promise.all([
        apiGetSummary().catch(() => null),
        apiGetCategories().catch(() => []),
        apiGetTransactions({ limit: 400 }).catch(() => []),
      ]);

      const categories = Array.isArray(cats) ? cats : cats?.categories || [];
      const transactions = Array.isArray(txs) ? txs : txs?.transactions || [];
      let alertCount = 0;

      // Personal spend insight
      const expenseByCat = new Map();
      let totalExpense = 0;
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const catName = t.category?.name || categories.find((c) => c._id === t.categoryId)?.name || "Khác";
          expenseByCat.set(catName, (expenseByCat.get(catName) || 0) + (t.amount || 0));
          totalExpense += t.amount || 0;
        });
      if (expenseByCat.size && totalExpense > 0) {
        const top = Array.from(expenseByCat.entries()).sort((a, b) => b[1] - a[1])[0];
        const pct = Math.round((top[1] / totalExpense) * 100);
        sendBotMessage(
          {
            text: `Tháng này bạn chi ${top[0]} ${pct}%. Bạn muốn xem gợi ý giảm chi không?`,
            actions: [
              { label: "Gợi ý tiết kiệm", type: "saving_tip" },
              { label: `Xem giao dịch ${top[0]}`, type: "view_transactions" },
            ],
            insight: {
              title: `Danh mục ${top[0]} vượt ngưỡng`,
              metric: `${pct}%`,
              progress: pct,
              severity: pct >= 80 ? "alert" : "warn",
              icon: "alert",
            },
          },
          { context: "insight", withTyping: true }
        );
      } else if (summary?.topCategory && summary?.expenseRatio) {
        const pct = Math.round(summary.expenseRatio * 100);
        sendBotMessage(
          {
            text: `Tháng này bạn chi ${summary.topCategory} ${pct}%. Bạn muốn xem gợi ý giảm chi không?`,
            actions: [
              { label: "Gợi ý tiết kiệm", type: "saving_tip" },
              { label: `Xem giao dịch ${summary.topCategory}`, type: "view_transactions" },
            ],
            insight: {
              title: `Danh mục ${summary.topCategory} vượt ngưỡng`,
              metric: `${pct}%`,
              progress: pct,
              severity: pct >= 80 ? "alert" : "warn",
              icon: "alert",
            },
          },
          { context: "insight", withTyping: true }
        );
      }

      // Budget alerts
      const budgets = getBudgets();
      if (budgets.length) {
        const spendByCatId = new Map();
        transactions
          .filter((t) => t.type === "expense")
          .forEach((t) => {
            const key = t.categoryId || t.category?._id || t.category?.name;
            if (!key) return;
            spendByCatId.set(key, (spendByCatId.get(key) || 0) + (t.amount || 0));
          });
        const firstOver = budgets
          .map((b) => {
            const spent = spendByCatId.get(b.categoryId) || 0;
            const ratio = b.limitAmount ? spent / b.limitAmount : 0;
            const catName = categories.find((c) => c._id === b.categoryId)?.name || b.categoryId;
            return { ...b, spent, ratio, catName };
          })
          .find((b) => b.ratio >= 0.8);
        if (firstOver) {
          const pct = Math.round(firstOver.ratio * 100);
          alertCount += 1;
          sendBotMessage(
            {
              text: `Danh mục ${firstOver.catName} đã dùng ${pct}% ngân sách.`,
              actions: [
                { label: "Đặt lại ngân sách", to: "/app" },
                { label: "Xem giao dịch", type: "view_transactions" },
              ],
              insight: {
                title: `Ngân sách ${firstOver.catName} sắp quá hạn`,
                metric: `${pct}%`,
                progress: pct,
                severity: "alert",
                icon: "budget",
              },
            },
            { context: "insight", withTyping: true }
          );
        }
      }
      setBudgetAlertCount(alertCount);
    } catch (err) {
      console.warn("Cannot fetch insights", err);
    }
  }

  function buildDraftFromPartial(partial, incomingText) {
    if (!partial.type || !partial.amount) return null;
    return {
      kind: "transaction",
      draft: {
        type: partial.type,
        amount: partial.amount,
        note: partial.note?.trim() || "Không ghi chú",
        categoryName: partial.categoryName || undefined,
        date: new Date(),
        originalText: partial.originalText || incomingText,
      },
    };
  }

  function continueDraftFlow(text, typingId) {
    if (!draftStep) return false;

    if (draftStep === "need_type") {
      const type = guessTransactionType(text);
      if (!type) {
        updateTypingMessage(typingId, { text: "Bạn muốn ghi giao dịch Chi hay Thu?" });
        setBotStatus("idle");
        return true;
      }
      setDraftTransactionPartial((prev) => ({
        ...prev,
        type,
        originalText: prev.originalText || text,
      }));
      setLastIntent(type);
      setDraftStep("need_amount");
      updateTypingMessage(typingId, {
        text: type === "income" ? "Bạn muốn thu nhập bao nhiêu?" : "Bạn muốn chi tiêu bao nhiêu?",
      });
      setBotStatus("idle");
      return true;
    }

    if (draftStep === "need_amount") {
      const amount = parseAmount(text);
      if (amount === null) {
        updateTypingMessage(typingId, { text: "Mình chưa rõ số tiền, bạn nhập lại giúp mình nhé (vd: 120k)." });
        setBotStatus("confused");
        return true;
      }
      const noteGuess = text.replace(/(\d+(?:[.,]\d+)?(k|ngan|ngàn|tr|trieu|triệu)?)/i, "").trim();
      setDraftTransactionPartial((prev) => ({
        ...prev,
        amount,
        note: prev.note || noteGuess,
        originalText: prev.originalText || text,
      }));
      setDraftStep("need_category");
      updateTypingMessage(typingId, { text: "Danh mục nào? (vd: food / shopping / transport / cafe...)" });
      setBotStatus("idle");
      return true;
    }

    if (draftStep === "need_category") {
      const cat = text.trim();
      if (!cat) {
        updateTypingMessage(typingId, { text: "Danh mục nào? Bạn có thể gõ tên danh mục." });
        setBotStatus("confused");
        return true;
      }
      setDraftTransactionPartial((prev) => ({
        ...prev,
        categoryName: cat,
        originalText: prev.originalText || text,
      }));
      setDraftStep("need_note");
      updateTypingMessage(typingId, { text: "Ghi chú gì cho giao dịch này? (vd: ăn trưa, mua cafe...)" });
      setBotStatus("idle");
      return true;
    }

    if (draftStep === "need_note") {
      const note = text.trim() || draftTransactionPartial.note || "Không ghi chú";
      const finalPartial = {
        ...draftTransactionPartial,
        note,
        originalText: draftTransactionPartial.originalText || text,
      };
      const draftData = buildDraftFromPartial(finalPartial, text);
      setDraftStep(null);
      setDraftTransactionPartial(initialDraftState);
      if (draftData) {
        setDrafts((prev) => [...prev, { id: typingId, data: draftData }]);
        const confirmText = `Bạn muốn thêm ${
          draftData.draft.type === "expense" ? "CHI TIÊU" : "THU NHẬP"
        } ${formatCurrency(draftData.draft.amount)} cho "${draftData.draft.note}"${
          draftData.draft.categoryName ? ` (danh mục ${draftData.draft.categoryName})` : ""
        } đúng không?`;
        updateTypingMessage(typingId, { text: confirmText, draft: draftData });
        setBotStatus("idle");
        return true;
      }
    }

    return false;
  }

  async function handleJoinChallengePrompt() {
    const id = window.prompt("Nhập ID challenge bạn muốn tham gia:");
    if (!id) return;
    try {
      setBotStatus("thinking");
      const { API_BASE, getAuthHeaders } = authApiHelpers;
      const res = await fetch(`${API_BASE}/challenges/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Không thể tham gia challenge");
      setMessages((prev) => [...prev, attachId({ from: "bot", text: "Đã tham gia challenge ✓" })]);
      refreshAppData("/app/my-challenges");
    } catch (err) {
      setMessages((prev) => [...prev, attachId({ from: "bot", text: `Tham gia thất bại: ${err.message || "Lỗi"} ` })]);
    } finally {
      setBotStatus("idle");
    }
  }

  async function handleCheckIn(challengeId) {
    try {
      setBotStatus("thinking");
      const { API_BASE, getAuthHeaders } = authApiHelpers;
      const res = await fetch(`${API_BASE}/challenges/my-challenges/${challengeId}/check-in`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Check-in thất bại");
      sendBotMessage({ text: "Tuyệt vời, bạn đã check-in challenge hôm nay! 🚀" });
      refreshAppData("/app/my-challenges");
    } catch (err) {
      sendBotMessage({ text: `Không thể check-in: ${err.message || "Lỗi"}` });
    } finally {
      setBotStatus("idle");
    }
  }

  async function maybePromptChallengeCoach() {
    if (coachPromptedRef.current) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem("fintr_coach_last_date");
    if (last === todayKey) return;
    coachPromptedRef.current = true;
    try {
      const { API_BASE, getAuthHeaders } = authApiHelpers;
      const res = await fetch(`${API_BASE}/challenges/my-challenges`, { headers: { ...getAuthHeaders() } });
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data.challenges || data.items || [];
      const active = list.find((c) => (c.status || c.challenge?.status || "").toUpperCase() === "ACTIVE" || !c.status);
      const id = active?._id || active?.challenge?._id;
      const title = active?.challenge?.title || active?.title;
      if (id) {
        sendBotMessage(
          {
            text: `Hôm nay bạn check-in challenge "${title || "đang tham gia"}" chưa?`,
            actions: [
              { label: "Check-in ngay", type: "challenge_checkin", challengeId: id },
              { label: "Để sau", type: "noop" },
            ],
          },
          { context: "help" }
        );
        localStorage.setItem("fintr_coach_last_date", todayKey);
      }
    } catch {
      // ignore
    }
  }

  function handleAction(action) {
    if (action.to) navigate(action.to);
    if (action.type === "join_challenge_prompt") {
      handleJoinChallengePrompt();
    }
    if (action.type === "challenge_checkin" && action.challengeId) {
      handleCheckIn(action.challengeId);
    }
    if (action.type === "saving_tip") {
      sendBotMessage({
        text: "Gợi ý: đặt giới hạn cho danh mục Shopping, bật thông báo khi vượt 70% và thử thử thách no-spend 3 ngày.",
      });
    }
    if (action.type === "view_transactions") {
      navigate("/app/transactions");
    }
    if (action.type === "template_categories") {
      promptTemplate("categories");
    }
    if (action.type === "template_budget") {
      promptTemplate("budget");
    }
  }

  function refreshAppData(preferredPath) {
    if (preferredPath && location.pathname !== preferredPath) {
      navigate(preferredPath);
      return;
    }
    if (location.pathname.startsWith("/app")) {
      window.location.reload();
    }
  }

  function sendBotMessage(payload, meta = {}) {
    if (meta.withTyping || shouldUseReveal(payload.text)) {
      const typingId = meta.id || createMessageId("typing");
      setBotStatus("thinking");
      setMessages((prev) => [...prev, ...addDividerIfNeeded(meta.context), { from: "bot", typing: true, id: typingId }]);
      const timer = setTimeout(() => {
        updateTypingMessage(typingId, { ...payload, id: typingId });
        setBotStatus("idle");
      }, meta.delay ?? 320);
      typingTimersRef.current.push(timer);
      return;
    }
    setMessages((prev) => [...prev, ...addDividerIfNeeded(meta.context), attachId({ from: "bot", typing: false, ...payload })]);
  }

  function promptTemplate(template) {
    const draft = { kind: "template", template };
    const text =
      template === "categories"
        ? "Tạo bộ danh mục chuẩn (Ăn uống, Đi lại, Mua sắm, Hóa đơn, Tiết kiệm)?"
        : "Đặt ngân sách 50/30/20 cho tháng này?";
    const id = `draft-${Date.now()}`;
    setMessages((prev) => [...prev, ...addDividerIfNeeded("confirm"), attachId({ from: "bot", text, draft, id })]);
  }

  async function handleConfirmDraft(message) {
    if (!message?.draft || confirmingId) return;
    let confirmed = false;
    try {
      setConfirmingId(message.id);
      if (message.draft.kind === "transaction") {
        const payload = {
          type: message.draft.draft.type,
          amount: message.draft.draft.amount,
          note: message.draft.draft.note,
          categoryName: message.draft.draft.categoryName || undefined,
          date: message.draft.draft.date instanceof Date ? message.draft.draft.date.toISOString() : new Date().toISOString(),
        };
        await apiCreateTransaction(payload);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, from: "bot", text: "Đã thêm giao dịch ✓", draft: null } : m
          )
        );
        refreshAppData("/app/transactions");
        confirmed = true;
      } else if (message.draft.kind === "category") {
        const payload = {
          name: message.draft.draft.name,
          type: message.draft.draft.type || "expense",
        };
        await apiCreateCategory(payload);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, from: "bot", text: "Đã tạo danh mục ✓", draft: null } : m
          )
        );
        refreshAppData("/app/categories");
        confirmed = true;
      } else if (message.draft.kind === "template") {
        if (message.draft.template === "categories") {
          const cats = [
            { name: "Ăn uống", type: "expense" },
            { name: "Đi lại", type: "expense" },
            { name: "Mua sắm", type: "expense" },
            { name: "Hóa đơn", type: "expense" },
            { name: "Tiết kiệm", type: "income" },
          ];
          for (const c of cats) {
            try {
              await apiCreateCategory(c);
            } catch {
              // ignore individual errors
            }
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message.id ? { ...m, from: "bot", text: "Đã tạo bộ danh mục ✓", draft: null } : m
            )
          );
          refreshAppData("/app/categories");
          confirmed = true;
        }
        if (message.draft.template === "budget") {
          const monthKey = new Date().toISOString().slice(0, 7);
          const budgets = [
            { categoryId: "needs", limitAmount: 5000000 },
            { categoryId: "wants", limitAmount: 3000000 },
            { categoryId: "savings", limitAmount: 2000000 },
          ];
          budgets.forEach((b) => saveBudget({ ...b, monthKey }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message.id ? { ...m, from: "bot", text: "Đã set ngân sách 50/30/20 ✓", draft: null } : m
            )
          );
          refreshAppData("/app");
          confirmed = true;
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? {
                ...m,
                draft: null,
                text: `Không thể xử lý: ${err.message || "Đã có lỗi xảy ra"}`,
              }
            : m
        )
      );
    } finally {
      setConfirmingId(null);
      if (confirmed) resetMode();
    }
  }

  function handleOpen() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsAnimatingClose(false);
    setOpen(true);
    maybeSendInsights();
  }

  function handleClose() {
    setIsAnimatingClose(true);
    setOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setIsAnimatingClose(false);
    }, 220);
  }

  function sendMessage(content) {
    if (!content.trim()) return;
    const userMsg = attachId({ from: "user", text: content.trim() });
    const typingId = createMessageId("typing");
    setBotStatus("thinking");
    setMessages((prev) => [...prev, userMsg, { from: "bot", typing: true, id: typingId }]);
    setInput("");
    setShowCommands(false);
    setHasInteracted(true);

    const timer = setTimeout(() => {
      const trimmed = content.trim();

      if (draftStep) {
        const handled = continueDraftFlow(trimmed, typingId);
        if (handled) return;
      }

      const parsed = parseNaturalInput(trimmed);
      if (parsed) {
        setDraftStep(null);
        setDraftTransactionPartial(initialDraftState);
        setLastIntent(parsed.kind);
        insertDividerBeforeTyping("confirm", typingId);
        const confirmText =
          parsed.kind === "transaction"
            ? `Bạn muốn thêm ${parsed.draft.type === "expense" ? "CHI TIÊU" : "THU NHẬP"} ${formatCurrency(
                parsed.draft.amount
              )} cho "${parsed.draft.note}" đúng không?`
            : `Bạn muốn tạo danh mục "${parsed.draft.name}" chứ?`;

        setDrafts((prev) => [...prev, { id: typingId, data: parsed }]);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? { from: "bot", text: confirmText, draft: parsed, id: typingId }
              : m
          )
        );
        setBotStatus("idle");
        return;
      }

      const intent = detectIntent(trimmed).name;
      const normalized = trimmed.toLowerCase();
      const isTransactionStart = normalized.includes("giao dich") || normalized.includes("giao dịch") || normalized.includes("tạo giao dịch");

      if (intent === "add_expense" || intent === "add_income") {
        const type = intent === "add_income" ? "income" : "expense";
        setDraftTransactionPartial({ ...initialDraftState, type, originalText: trimmed });
        setDraftStep("need_amount");
        setLastIntent(intent);
        insertDividerBeforeTyping("confirm", typingId);
        updateTypingMessage(typingId, {
          text: type === "income" ? "Bạn muốn thu nhập bao nhiêu?" : "Bạn muốn chi tiêu bao nhiêu?",
        });
        setBotStatus("idle");
        return;
      }

      if (trimmed.toLowerCase() === "tạo bộ danh mục chuẩn") {
        const draft = { kind: "template", template: "categories" };
        const confirmText = "Tạo bộ danh mục chuẩn (Ăn uống, Đi lại, Mua sắm, Hóa đơn, Tiết kiệm)?";
        insertDividerBeforeTyping("confirm", typingId);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId ? { from: "bot", text: confirmText, draft, id: typingId } : m
          )
        );
        return;
      }

      if (trimmed.toLowerCase() === "set ngân sách 50/30/20") {
        const draft = { kind: "template", template: "budget" };
        const confirmText = "Đặt ngân sách 50/30/20 cho tháng này?";
        insertDividerBeforeTyping("confirm", typingId);
        setMessages((prev) =>
          prev.map((m) => (m.id === typingId ? { from: "bot", text: confirmText, draft, id: typingId } : m))
        );
        return;
      }

      if (isTransactionStart) {
        setDraftTransactionPartial({ ...initialDraftState, originalText: trimmed });
        setDraftStep("need_type");
        setLastIntent("transaction");
        insertDividerBeforeTyping("confirm", typingId);
        updateTypingMessage(typingId, { text: "Bạn muốn ghi giao dịch Chi hay Thu?" });
        setBotStatus("idle");
        return;
      }

      const botReply = buildBotReply(trimmed);
      insertDividerBeforeTyping("help", typingId);
      setLastIntent(botReply.intent);
      updateTypingMessage(typingId, { text: botReply.text, chips: botReply.chips, actions: botReply.actions });
      setBotStatus(botReply.intent === "unknown" ? "confused" : "idle");
    }, 450);
    typingTimersRef.current.push(timer);
  }

  function resetMode() {
    setLastIntent(null);
    setDraftStep(null);
    setDraftTransactionPartial(initialDraftState);
    setInput("");
    setShowCommands(false);
    contextRef.current = null;
    setContextSection(null);
  }

  const statusLine = `• Đang theo dõi chi tiêu tháng này${budgetAlertCount ? ` • ${budgetAlertCount} cảnh báo ngân sách` : ""}`;
  const currentMode = (() => {
    if (draftStep) return "Thêm giao dịch";
    if (lastIntent === "add_expense" || lastIntent === "add_income" || lastIntent === "transaction") return "Thêm giao dịch";
    if (lastIntent === "report") return "Báo cáo";
    if (lastIntent === "create_category") return "Tạo danh mục";
    if (lastIntent === "join_challenge") return "Thử thách";
    return null;
  })();
  const modeLabel = currentMode ? `Mode: ${currentMode}` : null;

  return (
    <div style={styles.shell}>
      <style>{`
        @keyframes botPulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes botBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.8; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes gentleGradient {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-4%, -3%,0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes softPulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>
      {isLayerVisible && (
        <div
          style={{
            ...styles.overlay,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
          }}
          onClick={handleClose}
        />
      )}

      {!open && (
        <button style={styles.fab} onClick={handleOpen} aria-label="Mở chatbot">
          <img src="/logo.svg" alt="FIntrAI" style={{ width: 18, height: 18 }} />
          <span>FIntrAI</span>
        </button>
      )}

      {isLayerVisible && (
        <div
          style={{
            ...styles.panel,
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0.96)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div style={styles.panelBg} />
          <div style={styles.gradientAura} />
          <div style={styles.headerStrip} />
          <div style={styles.header}>
            <div>
              <div style={styles.title}>FIntrAI Assistant</div>
              <div style={styles.subtitle}>Hỏi nhanh về cách dùng sản phẩm</div>
              <div style={styles.statusRow}>
                <span style={styles.statusPulse} />
                <span style={styles.statusText}>{statusLine}</span>
              </div>
            </div>
            <div style={styles.headerActions}>
              <div style={styles.avatarWrap} aria-label={`Trạng thái bot: ${botStatus}`}>
                <div style={styles.avatarCircle}>
                  {botStatus === "confused" ? (
                    <span style={styles.avatarEmoji}>?</span>
                  ) : botStatus === "thinking" ? (
                    <div style={styles.typingDots}>
                      <span style={{ ...styles.dot, animationDelay: "0ms" }} />
                      <span style={{ ...styles.dot, animationDelay: "120ms" }} />
                      <span style={{ ...styles.dot, animationDelay: "240ms" }} />
                    </div>
                  ) : (
                    <span style={styles.avatarDot} />
                  )}
                </div>
              </div>
              <button style={styles.closeBtn} onClick={handleClose} aria-label="Đóng chatbot">
                ✕
              </button>
            </div>
          </div>

          <div style={styles.suggestions}>
            {quickSuggestions.map((q) => {
              const variant = getChipVariant(q);
              return (
                <button
                  key={q}
                  style={variant === "primary" ? styles.suggestionBtnPrimary : styles.suggestionBtn}
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              );
            })}
          </div>

          <div style={styles.messages} ref={listRef}>
            {!hasInteracted && (
              <div style={styles.welcomeCard}>
                <div style={styles.welcomeTitle}>Xin chào, mình là FintrAI</div>
                <div style={styles.welcomeDesc}>
                  Mình có thể giúp bạn thêm giao dịch, tạo danh mục, xem báo cáo hoặc theo dõi thử thách tiết kiệm.
                </div>
                <div style={styles.welcomeActions}>
                  {["Thêm chi tiêu", "Xem báo cáo tháng này", "Tham gia thử thách"].map((cta, index) => {
                    const variant = index === 0 ? "primary" : "secondary";
                    return (
                      <button
                        key={cta}
                        style={variant === "primary" ? styles.primaryBtn : styles.secondaryBtn}
                        onClick={() => sendMessage(cta)}
                      >
                        {cta}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {messages.map((m) => {
              if (m.type === "divider") {
                return (
                  <div key={m.id || m.text} style={styles.dividerRow}>
                    <span style={styles.dividerLine} />
                    <span style={styles.dividerIcon}>✦</span>
                    <span style={styles.dividerText}>{m.text}</span>
                    <span style={styles.dividerLine} />
                  </div>
                );
              }
              const isUser = m.from === "user";
              const currentReaction = m.id ? reactions[m.id] : null;
              const progressWidth = m.insight?.progress ? Math.min(m.insight.progress, 100) : 0;

              return (
                <div
                  key={m.id || m.text}
                  style={{
                    ...styles.bubble,
                    ...(isUser ? styles.userBubble : styles.botBubble),
                  }}
                >
                  {m.typing ? (
                    <div style={styles.typingDots}>
                      <span style={{ ...styles.dot, animationDelay: "0ms" }} />
                      <span style={{ ...styles.dot, animationDelay: "120ms" }} />
                      <span style={{ ...styles.dot, animationDelay: "240ms" }} />
                    </div>
                  ) : m.draft ? (
                    <div style={styles.card}>
                      <div style={styles.cardTitle}>Xác nhận</div>
                      <div style={styles.cardText}>{m.text}</div>
                      <div style={styles.cardActions}>
                        <button
                          style={styles.secondaryBtn}
                          disabled={confirmingId === m.id}
                          onClick={() => {
                            setDrafts((prev) => prev.filter((d) => d.id !== m.id));
                            setDraftStep(null);
                            setDraftTransactionPartial(initialDraftState);
                            if (m.draft?.draft?.originalText) setInput(m.draft.draft.originalText);
                            setShowCommands(false);
                          }}
                        >
                          Sửa lại
                        </button>
                        <button
                          style={styles.primaryBtn}
                          disabled={confirmingId === m.id}
                          onClick={() => {
                            setDrafts((prev) => prev.filter((d) => d.id !== m.id));
                            setDraftStep(null);
                            setDraftTransactionPartial(initialDraftState);
                            handleConfirmDraft(m);
                          }}
                        >
                          {confirmingId === m.id ? "Đang lưu..." : "Xác nhận"}
                        </button>
                      </div>
                    </div>
                  ) : m.insight ? (
                    <div style={styles.insightCard}>
                      <div style={styles.insightTop}>
                        <div style={styles.cardTitle}>{m.insight.title}</div>
                        <div style={styles.insightIcon}>{m.insight.icon === "budget" ? "🛎️" : "📊"}</div>
                      </div>
                      <div style={styles.insightMetric}>{m.insight.metric}</div>
                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressBar,
                            width: `${progressWidth}%`,
                            background:
                              m.insight.severity === "alert"
                                ? "linear-gradient(90deg, rgba(248,113,113,0.9), rgba(251,146,60,0.9))"
                                : "linear-gradient(90deg, rgba(74,222,128,0.8), rgba(52,211,153,0.8))",
                          }}
                        />
                      </div>
                      <div style={styles.cardText}>{m.text}</div>
                      {m.actions?.length ? (
                        <div style={styles.cardActions}>
                          {m.actions.map((action) => {
                            const variant = getChipVariant(action.label);
                            return (
                              <button
                                key={action.label}
                                style={variant === "primary" ? styles.primaryBtn : styles.secondaryBtn}
                                onClick={() => handleAction(action)}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div>{m.text}</div>
                      {m.chips?.length ? (
                        <div style={styles.chipsRow}>
                          {m.chips.map((chip) => {
                            const variant = getChipVariant(chip);
                            return (
                              <button
                                key={chip}
                                style={variant === "primary" ? styles.chipPrimary : styles.chipSecondary}
                                onClick={() => sendMessage(chip)}
                              >
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {m.actions?.length ? (
                        <div style={styles.actionsRow}>
                          {m.actions.map((action) => {
                            const variant = getChipVariant(action.label);
                            return (
                              <button
                                key={action.label}
                                style={variant === "primary" ? styles.actionBtnPrimary : styles.actionBtnSecondary}
                                onClick={() => handleAction(action)}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </>
                  )}
                  {m.from === "bot" && !m.typing ? (
                    <div style={styles.reactionRow}>
                      <button
                        style={{
                          ...styles.reactionBtn,
                          ...(currentReaction === "up" ? styles.reactionActive : {}),
                        }}
                        onClick={() => handleReaction(m.id, "up")}
                        type="button"
                      >
                        👍 Hữu ích
                      </button>
                      <button
                        style={{
                          ...styles.reactionBtn,
                          ...(currentReaction === "down" ? styles.reactionActive : {}),
                        }}
                        onClick={() => handleReaction(m.id, "down")}
                        type="button"
                      >
                        👎 Chưa đúng
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <form
            style={styles.inputRow}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            {modeLabel && (
              <div style={styles.modePill}>
                <span>{modeLabel}</span>
                <button type="button" style={styles.modeClose} onClick={resetMode} aria-label="Reset mode">
                  ×
                </button>
              </div>
            )}
            <div style={styles.quickChipRow}>
              <div style={styles.quickChipScroll}>
                {quickReplyChips.map((chip) => (
                  <button
                    key={chip}
                    style={getChipVariant(chip) === "primary" ? styles.quickChipPrimary : styles.quickChipSecondary}
                    type="button"
                    onClick={() => {
                      setInput(chip);
                      sendMessage(chip);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.inputActionRow}>
              <input
                style={styles.input}
                placeholder="Đặt câu hỏi của bạn..."
                value={input}
                onChange={(e) => {
                  const value = e.target.value;
                  setInput(value);
                  setShowCommands(value.startsWith("/"));
                }}
              />
              <button type="submit" style={styles.sendBtn}>
                Gửi
              </button>
            </div>
            {showCommands && (
              <div style={styles.commandPalette}>
                {commandPalette
                  .filter((cmd) => cmd.command.includes(input.trim() || "/"))
                  .map((cmd) => (
                    <button
                      key={cmd.command}
                      type="button"
                      style={styles.commandItem}
                      onClick={() => {
                        setInput(cmd.text);
                        sendMessage(cmd.text);
                      }}
                    >
                      <span style={styles.commandCode}>{cmd.command}</span>
                      <span>{cmd.text}</span>
                    </button>
                  ))}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  shell: { position: "fixed", right: 24, bottom: 24, zIndex: 999 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.14)",
    transition: "opacity 200ms ease",
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    zIndex: 998,
  },
  fab: {
    padding: "10px 14px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(14,165,233,0.9))",
    color: "#0B1021",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 30px rgba(14,165,233,0.35)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  panel: {
    width: 360,
    maxWidth: "calc(100vw - 32px)",
    background: "rgba(10,12,24,0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    color: "#E2E8F0",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "opacity 200ms ease, transform 200ms ease",
    transformOrigin: "bottom right",
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 1000,
    pointerEvents: "auto",
    overflow: "hidden",
  },
  panelBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(120% 120% at 20% 20%, rgba(59,130,246,0.08), transparent 40%), radial-gradient(120% 120% at 80% 0%, rgba(16,185,129,0.08), transparent 40%), rgba(255,255,255,0.02)",
    animation: "gentleGradient 12s ease-in-out infinite",
    zIndex: 0,
    pointerEvents: "none",
  },
  gradientAura: {
    position: "absolute",
    inset: -40,
    background: "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(14,165,233,0.06))",
    filter: "blur(60px)",
    zIndex: 0,
    animation: "gentleGradient 14s ease-in-out infinite",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 14px 6px",
    position: "relative",
    zIndex: 1,
    gap: 12,
  },
  headerStrip: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 4,
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(59,130,246,0.9), rgba(14,165,233,0.85), rgba(34,197,94,0.85))",
    zIndex: 1,
    opacity: 0.9,
    pointerEvents: "none",
  },
  title: { fontWeight: 800, fontSize: 16, letterSpacing: 0.2, color: "#F8FAFC" },
  subtitle: { color: "rgba(226,232,240,0.8)", fontSize: 12, marginTop: 2 },
  statusRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
  statusPulse: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(16,185,129,0.95))",
    boxShadow: "0 0 0 6px rgba(59,130,246,0.18)",
    animation: "softPulse 1.8s ease-in-out infinite",
  },
  statusText: { fontSize: 12, color: "rgba(226,232,240,0.75)" },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  avatarWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: 2,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.24)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.32), rgba(14,165,233,0.22))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.9)",
    boxShadow: "0 0 0 6px rgba(99,102,241,0.12)",
    animation: "botPulse 1.6s ease-in-out infinite",
  },
  avatarEmoji: { fontSize: 16, lineHeight: "16px" },
  closeBtn: {
    border: "none",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(226,232,240,0.9)",
    cursor: "pointer",
    fontSize: 16,
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "0 12px",
    position: "relative",
    zIndex: 1,
  },
  suggestionBtn: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(226,232,240,0.04)",
    padding: "9px 12px",
    borderRadius: 12,
    color: "#E2E8F0",
    fontSize: 12,
    cursor: "pointer",
  },
  suggestionBtnPrimary: {
    border: "1px solid rgba(99,102,241,0.35)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(59,130,246,0.32))",
    padding: "9px 12px",
    borderRadius: 12,
    color: "#F8FAFC",
    fontWeight: 700,
    cursor: "pointer",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 270,
    overflowY: "auto",
    padding: "0 12px",
    position: "relative",
    zIndex: 1,
  },
  bubble: {
    padding: "12px 14px",
    borderRadius: 16,
    fontSize: 13,
    lineHeight: 1.5,
    maxWidth: "92%",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 14px 26px rgba(0,0,0,0.28)",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.18))",
    border: "1px solid rgba(99,102,241,0.35)",
  },
  botBubble: { alignSelf: "flex-start", background: "rgba(255,255,255,0.04)" },
  typingDots: { display: "inline-flex", gap: 6, alignItems: "center", minHeight: 12 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "rgba(226,232,240,0.9)",
    animation: "botBounce 1.2s infinite ease-in-out",
  },
  card: {
    background: "rgba(226,232,240,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "rgba(226,232,240,0.8)",
  },
  cardText: { fontSize: 13, lineHeight: 1.5 },
  cardActions: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" },
  primaryBtn: {
    border: "1px solid rgba(99,102,241,0.4)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.92), rgba(59,130,246,0.9))",
    color: "#0B1021",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(226,232,240,0.08)",
    color: "#E2E8F0",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  insightCard: {
    background: "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08), rgba(255,255,255,0.02))",
    border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 18px 38px rgba(0,0,0,0.32)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  insightTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  insightIcon: { fontSize: 16 },
  insightMetric: {
    fontSize: 26,
    fontWeight: 800,
    background: "linear-gradient(135deg, rgba(34,197,94,0.9), rgba(59,130,246,0.9))",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: { height: "100%", borderRadius: 999 },
  chipsRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  actionsRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chipPrimary: {
    border: "1px solid rgba(99,102,241,0.4)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.26), rgba(14,165,233,0.24))",
    borderRadius: 12,
    padding: "8px 12px",
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  chipSecondary: {
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: "8px 12px",
    color: "#E2E8F0",
    fontSize: 12,
    cursor: "pointer",
  },
  actionBtnPrimary: {
    border: "1px solid rgba(59,130,246,0.4)",
    background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(14,165,233,0.4))",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#F8FAFC",
    fontWeight: 800,
    cursor: "pointer",
  },
  actionBtnSecondary: {
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#E2E8F0",
    fontWeight: 700,
    cursor: "pointer",
  },
  reactionRow: {
    display: "flex",
    gap: 6,
    marginTop: 10,
    opacity: 0.9,
  },
  reactionBtn: {
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 999,
    padding: "6px 10px",
    color: "rgba(226,232,240,0.85)",
    cursor: "pointer",
    fontSize: 12,
  },
  reactionActive: {
    borderColor: "rgba(99,102,241,0.5)",
    background: "rgba(99,102,241,0.12)",
    transform: "scale(1.02)",
  },
  quickChipRow: { width: "100%", overflow: "hidden" },
  quickChipScroll: { display: "flex", gap: 8, overflowX: "auto", padding: "0 2px 6px" },
  quickChipPrimary: {
    border: "1px solid rgba(59,130,246,0.35)",
    background: "linear-gradient(135deg, rgba(59,130,246,0.26), rgba(14,165,233,0.22))",
    color: "#F8FAFC",
    padding: "8px 12px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  quickChipSecondary: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(226,232,240,0.06)",
    color: "#E2E8F0",
    padding: "8px 12px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontSize: 12,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "10px 12px 12px",
    borderTop: "1px solid rgba(148,163,184,0.12)",
    position: "relative",
    flexDirection: "column",
    background: "rgba(255,255,255,0.02)",
    zIndex: 2,
  },
  inputActionRow: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.06)",
    color: "#E2E8F0",
    outline: "none",
  },
  sendBtn: {
    border: "1px solid rgba(99,102,241,0.3)",
    padding: "10px 12px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(14,165,233,0.9))",
    color: "#0B1021",
    fontWeight: 800,
    cursor: "pointer",
    alignSelf: "stretch",
  },
  commandPalette: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 52,
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    zIndex: 1001,
  },
  commandItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: "rgba(226,232,240,0.04)",
    color: "#E2E8F0",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
  },
  commandCode: { fontFamily: "monospace", fontSize: 12, color: "rgba(226,232,240,0.8)" },
  modePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    border: "1px solid rgba(99,102,241,0.25)",
    background: "rgba(99,102,241,0.12)",
    color: "#E2E8F0",
    padding: "6px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
  },
  modeClose: {
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#E2E8F0",
    borderRadius: 6,
    cursor: "pointer",
    width: 20,
    height: 20,
    lineHeight: "18px",
  },
  welcomeCard: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.08))",
    border: "1px solid rgba(99,102,241,0.25)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.32)",
  },
  welcomeTitle: { fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#F8FAFC" },
  welcomeDesc: { fontSize: 13, color: "rgba(226,232,240,0.85)", lineHeight: 1.5 },
  welcomeActions: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "rgba(226,232,240,0.6)",
    fontSize: 11,
    padding: "4px 0",
    justifyContent: "center",
  },
  dividerIcon: { opacity: 0.6 },
  dividerText: { letterSpacing: 0.2 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.1)", display: "block" },
};
