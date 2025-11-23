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
];

const commandPalette = [
  { command: "/add-expense", text: "Thêm chi tiêu" },
  { command: "/add-income", text: "Thêm thu nhập" },
  { command: "/report-month", text: "Xem báo cáo tháng này" },
  { command: "/create-category", text: "Tạo danh mục" },
  { command: "/join-challenge", text: "Tham gia thử thách" },
  { command: "/help", text: "Trợ giúp" },
];

function buildBotReply(text) {
  const intent = detectIntent(text).name;

  switch (intent) {
    case "add_expense":
      return {
        intent,
        text:
          "Để thêm khoản chi: vào Transactions, chọn loại Chi, nhập số tiền, danh mục và ghi chú rồi lưu. Bạn cũng có thể bấm Quick add ngay trên Dashboard.",
      };
    case "add_income":
      return {
        intent,
        text: "Bạn mở Transactions, chuyển sang tab Thu, nhập số tiền, danh mục thu và lưu để ghi nhận thu nhập mới.",
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
          "Vào mục Categories, bấm “Thêm danh mục”, chọn loại (Thu/Chi), đặt tên và icon rồi lưu. Danh mục mới sẽ xuất hiện khi thêm giao dịch.",
        actions: [{ label: "Mở Categories", to: "/app/categories" }],
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
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi là FIntrAI. Bạn có thể hỏi về giao dịch, danh mục, báo cáo hoặc bảo mật." },
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const insightsFetchedRef = useRef(false);
  const listRef = useRef(null);
  const closeTimerRef = useRef(null);
  const typingTimersRef = useRef([]);

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

  const isLayerVisible = open || isAnimatingClose;

  function updateTypingMessage(typingId, payload) {
    setMessages((prev) =>
      prev.map((m) => (m.id === typingId ? { from: "bot", id: typingId, ...payload } : m))
    );
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
        sendBotMessage({
          text: `Tháng này bạn chi ${top[0]} ${pct}%. Bạn muốn xem gợi ý giảm chi không?`,
          actions: [
            { label: `Xem giao dịch ${top[0]}`, type: "view_transactions" },
            { label: "Gợi ý tiết kiệm", type: "saving_tip" },
          ],
        });
      } else if (summary?.topCategory && summary?.expenseRatio) {
        const pct = Math.round(summary.expenseRatio * 100);
        sendBotMessage({
          text: `Tháng này bạn chi ${summary.topCategory} ${pct}%. Bạn muốn xem gợi ý giảm chi không?`,
          actions: [
            { label: `Xem giao dịch ${summary.topCategory}`, type: "view_transactions" },
            { label: "Gợi ý tiết kiệm", type: "saving_tip" },
          ],
        });
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
          sendBotMessage({
            text: `Danh mục ${firstOver.catName} đã dùng ${pct}% ngân sách.`,
            actions: [
              { label: "Đặt lại ngân sách", to: "/app" },
              { label: "Xem giao dịch", type: "view_transactions" },
            ],
          });
        }
      }
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
      setMessages((prev) => [...prev, { from: "bot", text: "Đã tham gia challenge ✓" }]);
      refreshAppData("/app/my-challenges");
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: `Tham gia thất bại: ${err.message || "Lỗi"} ` }]);
    } finally {
      setBotStatus("idle");
    }
  }

  function handleAction(action) {
    if (action.to) navigate(action.to);
    if (action.type === "join_challenge_prompt") {
      handleJoinChallengePrompt();
    }
    if (action.type === "saving_tip") {
      sendBotMessage({
        text: "Gợi ý: đặt giới hạn cho danh mục Shopping, bật thông báo khi vượt 70% và thử thử thách no-spend 3 ngày.",
      });
    }
    if (action.type === "view_transactions") {
      navigate("/app/transactions");
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

  function sendBotMessage(payload) {
    setMessages((prev) => [...prev, { from: "bot", ...payload }]);
  }

  async function handleConfirmDraft(message) {
    if (!message?.draft || confirmingId) return;
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
          prev.map((m) => (m.id === message.id ? { from: "bot", text: "Đã thêm giao dịch ✓" } : m))
        );
        refreshAppData("/app/transactions");
      } else if (message.draft.kind === "category") {
        const payload = {
          name: message.draft.draft.name,
          type: message.draft.draft.type || "expense",
        };
        await apiCreateCategory(payload);
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { from: "bot", text: "Đã tạo danh mục ✓" } : m))
        );
        refreshAppData("/app/categories");
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
    const userMsg = { from: "user", text: content.trim() };
    const typingId = `typing-${Date.now()}`;
    setBotStatus("thinking");
    setMessages((prev) => [
      ...prev,
      userMsg,
      { from: "bot", typing: true, id: typingId },
    ]);
    setInput("");
    setShowCommands(false);

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
        updateTypingMessage(typingId, {
          text: type === "income" ? "Bạn muốn thu nhập bao nhiêu?" : "Bạn muốn chi tiêu bao nhiêu?",
        });
        setBotStatus("idle");
        return;
      }

      if (isTransactionStart) {
        setDraftTransactionPartial({ ...initialDraftState, originalText: trimmed });
        setDraftStep("need_type");
        setLastIntent("transaction");
        updateTypingMessage(typingId, { text: "Bạn muốn ghi giao dịch Chi hay Thu?" });
        setBotStatus("idle");
        return;
      }

      const botReply = buildBotReply(trimmed);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { from: "bot", text: botReply.text, chips: botReply.chips, actions: botReply.actions, id: typingId }
            : m
        )
      );
      setBotStatus(botReply.intent === "unknown" ? "confused" : "idle");
    }, 450);
    typingTimersRef.current.push(timer);
  }

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
          <div style={styles.header}>
            <div>
              <div style={styles.title}>FIntrAI Assistant</div>
              <div style={styles.subtitle}>Hỏi nhanh về cách dùng sản phẩm</div>
            </div>
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

          <div style={styles.suggestions}>
            {quickSuggestions.map((q) => (
              <button key={q} style={styles.suggestionBtn} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          <div style={styles.messages} ref={listRef}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.bubble,
                  alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                  background: m.from === "user" ? "rgba(99,102,241,0.18)" : "rgba(226,232,240,0.06)",
                  border: m.from === "user" ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(148,163,184,0.12)",
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
                ) : (
                  <>
                    <div>{m.text}</div>
                    {m.chips?.length ? (
                      <div style={styles.chipsRow}>
                        {m.chips.map((chip) => (
                          <button key={chip} style={styles.chip} onClick={() => sendMessage(chip)}>
                            {chip}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {m.actions?.length ? (
                      <div style={styles.actionsRow}>
                        {m.actions.map((action) => (
                          <button
                            key={action.label}
                            style={styles.actionBtn}
                            onClick={() => handleAction(action)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>

          <form
            style={styles.inputRow}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div style={styles.quickChipRow}>
              <div style={styles.quickChipScroll}>
                {quickReplyChips.map((chip) => (
                  <button
                    key={chip}
                    style={styles.quickChip}
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
  shell: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 999,
  },
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
    width: 340,
    maxWidth: "calc(100vw - 32px)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 18,
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px 0",
  },
  title: { fontWeight: 800, fontSize: 15 },
  subtitle: { color: "rgba(226,232,240,0.75)", fontSize: 12 },
  avatarWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
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
  avatarEmoji: {
    fontSize: 16,
    lineHeight: "16px",
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    color: "rgba(226,232,240,0.8)",
    cursor: "pointer",
    fontSize: 16,
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "0 12px",
  },
  suggestionBtn: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(226,232,240,0.05)",
    padding: "8px 10px",
    borderRadius: 10,
    color: "#E2E8F0",
    fontSize: 12,
    cursor: "pointer",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 260,
    overflowY: "auto",
    padding: "0 12px",
  },
  bubble: {
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.4,
    maxWidth: "90%",
  },
  typingDots: {
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
    minHeight: 12,
  },
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
    borderRadius: 12,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "rgba(226,232,240,0.8)",
  },
  cardText: {
    fontSize: 13,
    lineHeight: 1.5,
  },
  cardActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  primaryBtn: {
    border: "none",
    background: "rgba(99,102,241,0.9)",
    color: "#0B1021",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid rgba(148,163,184,0.3)",
    background: "rgba(226,232,240,0.08)",
    color: "#E2E8F0",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  quickChipRow: {
    width: "100%",
    overflow: "hidden",
  },
  quickChipScroll: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "0 2px 6px",
  },
  quickChip: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(226,232,240,0.08)",
    color: "#E2E8F0",
    padding: "6px 10px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontSize: 12,
  },
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  actionsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.08)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "#E2E8F0",
    fontWeight: 600,
    cursor: "pointer",
  },
  chip: {
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.06)",
    borderRadius: 999,
    padding: "6px 10px",
    color: "#E2E8F0",
    fontSize: 12,
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px",
    borderTop: "1px solid rgba(148,163,184,0.12)",
    position: "relative",
    flexDirection: "column",
  },
  inputActionRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(226,232,240,0.05)",
    color: "#E2E8F0",
    outline: "none",
  },
  sendBtn: {
    border: "none",
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(99,102,241,0.9)",
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
  commandCode: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "rgba(226,232,240,0.8)",
  },
};
