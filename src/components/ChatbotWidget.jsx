import { useEffect, useRef, useState } from "react";
import { detectIntent } from "../bot/intentEngine";

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
      };
    case "create_category":
      return {
        intent,
        text:
          "Vào mục Categories, bấm “Thêm danh mục”, chọn loại (Thu/Chi), đặt tên và icon rồi lưu. Danh mục mới sẽ xuất hiện khi thêm giao dịch.",
      };
    case "join_challenge":
      return {
        intent,
        text:
          "Bạn mở tab Challenges, chọn thử thách muốn tham gia và bấm Join. Hệ thống sẽ theo dõi tiến độ và nhắc bạn qua bảng điều khiển.",
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
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi là FIntrAI. Bạn có thể hỏi về giao dịch, danh mục, báo cáo hoặc bảo mật." },
  ]);
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

  function handleOpen() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsAnimatingClose(false);
    setOpen(true);
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
      const botReply = buildBotReply(content.trim());
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { from: "bot", text: botReply.text, chips: botReply.chips, id: typingId } : m
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
