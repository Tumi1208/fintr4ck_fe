import { useEffect, useRef, useState } from "react";

const faqPairs = [
  {
    keywords: ["bắt đầu", "đăng ký", "signup", "register"],
    answer:
      "Bạn có thể đăng ký miễn phí, sau đó vào Dashboard để nhập vài giao dịch đầu tiên. Bấm “Đăng ký” ở góc phải trên trang chủ.",
  },
  {
    keywords: ["giao dịch", "transaction", "thêm chi", "thêm thu"],
    answer:
      "Vào mục Transactions, chọn loại Thu/Chi, danh mục, số tiền và ghi chú. Bạn cũng có thể dùng nút Quick add trên Dashboard.",
  },
  {
    keywords: ["danh mục", "category", "biểu tượng"],
    answer: "Mục Categories cho phép tạo danh mục thu/chi với icon. Nhấn “Thêm danh mục”, chọn loại và lưu.",
  },
  {
    keywords: ["báo cáo", "report", "chart", "biểu đồ"],
    answer:
      "Biểu đồ breakdown chi tiêu nằm trên Dashboard. Hệ thống tự tổng hợp theo danh mục và thời gian giao dịch.",
  },
  {
    keywords: ["mẫu", "template"],
    answer:
      "Trang Templates cung cấp bộ danh mục gợi ý (sinh viên, đi làm, freelancer). Chọn gói và bấm “Áp dụng gói”.",
  },
  {
    keywords: ["bảo mật", "đổi mật khẩu", "password"],
    answer:
      "Vào Settings > Bảo mật để đổi mật khẩu. Nhập mật khẩu hiện tại, mật khẩu mới và lưu lại.",
  },
];

const quickSuggestions = [
  "Làm thế nào để thêm giao dịch?",
  "Tôi có thể đổi mật khẩu ở đâu?",
  "Cách thêm danh mục chi tiêu?",
  "Dashboard hiển thị những gì?",
  "Có gói danh mục mẫu không?",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi là FIntrAI. Bạn có thể hỏi về giao dịch, danh mục, báo cáo hoặc bảo mật." },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  function pickAnswer(text) {
    const lower = text.toLowerCase();
    for (const pair of faqPairs) {
      if (pair.keywords.some((k) => lower.includes(k))) return pair.answer;
    }
    return "Tôi chưa có thông tin chi tiết cho câu hỏi này. Bạn có thể hỏi về: giao dịch, danh mục, báo cáo, template, bảo mật.";
  }

  function sendMessage(content) {
    if (!content.trim()) return;
    const userMsg = { from: "user", text: content.trim() };
    const botMsg = { from: "bot", text: pickAnswer(content.trim()) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div style={styles.shell}>
      {!open && (
        <button style={styles.fab} onClick={() => setOpen(true)} aria-label="Mở chatbot">
          <img src="/logo.svg" alt="FIntrAI" style={{ width: 18, height: 18 }} />
          <span>FIntrAI</span>
        </button>
      )}

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <div style={styles.title}>FIntrAI Assistant</div>
              <div style={styles.subtitle}>Hỏi nhanh về cách dùng sản phẩm</div>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng chatbot">
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
                {m.text}
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
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 18,
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
    color: "#E2E8F0",
    display: "flex",
    flexDirection: "column",
    gap: 10,
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
