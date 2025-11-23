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

function buildBotReply(text) {
  const intent = detectIntent(text).name;

  switch (intent) {
    case "add_expense":
      return {
        text:
          "Để thêm khoản chi: vào Transactions, chọn loại Chi, nhập số tiền, danh mục và ghi chú rồi lưu. Bạn cũng có thể bấm Quick add ngay trên Dashboard.",
      };
    case "add_income":
      return {
        text: "Bạn mở Transactions, chuyển sang tab Thu, nhập số tiền, danh mục thu và lưu để ghi nhận thu nhập mới.",
      };
    case "report":
      return {
        text:
          "Báo cáo nằm ở Dashboard/Reports. Bạn có thể xem biểu đồ breakdown, lọc theo thời gian và danh mục để theo dõi xu hướng chi tiêu.",
      };
    case "create_category":
      return {
        text:
          "Vào mục Categories, bấm “Thêm danh mục”, chọn loại (Thu/Chi), đặt tên và icon rồi lưu. Danh mục mới sẽ xuất hiện khi thêm giao dịch.",
      };
    case "join_challenge":
      return {
        text:
          "Bạn mở tab Challenges, chọn thử thách muốn tham gia và bấm Join. Hệ thống sẽ theo dõi tiến độ và nhắc bạn qua bảng điều khiển.",
      };
    case "help":
      return {
        text:
          "Mình có thể hỗ trợ cách thêm giao dịch, tạo danh mục, xem báo cáo hoặc tham gia thử thách. Hỏi mình bất cứ lúc nào nhé!",
      };
    default:
      return {
        text: "Mình chưa hiểu rõ yêu cầu. Bạn có thể chọn nhanh một trong các chủ đề dưới đây để tiếp tục nhé:",
        chips: fallbackChips,
      };
  }
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [isAnimatingClose, setIsAnimatingClose] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi là FIntrAI. Bạn có thể hỏi về giao dịch, danh mục, báo cáo hoặc bảo mật." },
  ]);
  const listRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
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
    const botReply = buildBotReply(content.trim());
    const botMsg = { from: "bot", text: botReply.text, chips: botReply.chips };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div style={styles.shell}>
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
            <input
              style={styles.input}
              placeholder="Đặt câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" style={styles.sendBtn}>
              Gửi
            </button>
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
  },
  input: {
    flex: 1,
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
  },
};
