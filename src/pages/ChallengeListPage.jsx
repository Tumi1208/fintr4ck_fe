import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApiHelpers } from "../api/auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

const fallbackChallenges = [
  {
    _id: "fallback-1",
    title: "30 ngày không mua trà sữa",
    description: "Bỏ qua trà sữa 30 ngày để thấy ví nhẹ hơn và mục tiêu gần hơn.",
    type: "NO_SPEND",
    durationDays: 30,
  },
  {
    _id: "fallback-2",
    title: "Tiết kiệm 100.000đ/ngày trong 30 ngày",
    description: "Mỗi ngày cất riêng 100k, sau 30 ngày bạn có 3 triệu.",
    type: "SAVE_FIXED",
    durationDays: 30,
  },
];

export default function ChallengeListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [joinedIds, setJoinedIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/challenges`, {
          headers: { ...getAuthHeaders() },
        });
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(text?.slice(0, 80) || "Phản hồi không phải JSON");
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không thể tải challenge");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setItems(fallbackChallenges); // hiển thị mẫu nếu API chưa sẵn sàng
      } finally {
        setLoading(false);
      }
    }
    async function loadJoined() {
      try {
        const res = await fetch(`${API_BASE}/challenges/my-challenges`, {
          headers: { ...getAuthHeaders() },
        });
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setJoinedIds(new Set(data.map((uc) => uc.challenge?._id || uc.challenge)));
        }
      } catch (err) {
        // ignore
      }
    }
    load();
    loadJoined();
  }, []);

  async function handleJoin(id) {
    try {
      if (id.startsWith("fallback-")) {
        alert("Đây là challenge demo. Vui lòng seed dữ liệu và thử lại.");
        return;
      }
      setJoiningId(id);
      const res = await fetch(`${API_BASE}/challenges/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : {};
      if (!res.ok) throw new Error(data.message || "Không thể tham gia challenge (API có thể chưa bật)");
      alert("Tham gia challenge thành công! Chuyển tới trang tiến độ của bạn.");
      navigate("/app/my-challenges");
    } catch (err) {
      alert(err.message);
    } finally {
      setJoiningId("");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Challenge</p>
          <h1 style={styles.title}>Thử thách tài chính</h1>
          <p style={styles.lead}>Chọn một challenge để rèn luyện kỷ luật chi tiêu.</p>
        </div>
      </div>

      {loading && <div style={styles.info}>Đang tải danh sách...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {items.map((c) => (
          <div key={c._id} style={styles.card}>
            <div style={styles.cardHead}>
              <span style={styles.badge}>{c.type}</span>
              <span style={styles.duration}>{c.durationDays} ngày</span>
            </div>
            <h3 style={styles.cardTitle}>{c.title}</h3>
            <p style={styles.cardDesc}>{c.description}</p>
            {joinedIds.has(c._id) ? (
              <button style={styles.joinBtn} onClick={() => navigate("/app/my-challenges")}>
                Đã tham gia · Xem tiến độ
              </button>
            ) : (
              <button
                style={styles.joinBtn}
                onClick={() => handleJoin(c._id)}
                disabled={joiningId === c._id}
              >
                {joiningId === c._id ? "Đang tham gia..." : "Tham gia"}
              </button>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && <div style={styles.info}>Chưa có challenge.</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: { margin: "8px 0 4px", color: "var(--text-strong)", fontSize: 26 },
  lead: { margin: 0, color: "var(--text-muted)" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 12,
  },
  card: {
    background: "rgba(226,232,240,0.04)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardHead: { display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" },
  badge: {
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(99,102,241,0.18)",
    color: "#c7d2fe",
    fontWeight: 700,
    fontSize: 12,
  },
  duration: { color: "var(--text-muted)", fontSize: 12 },
  cardTitle: { margin: 0, color: "var(--text-strong)", fontSize: 16 },
  cardDesc: { margin: 0, color: "var(--text-muted)", fontSize: 13 },
  joinBtn: {
    marginTop: "auto",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(99,102,241,0.9)",
    color: "#0b1021",
    fontWeight: 800,
    cursor: "pointer",
  },
  info: { color: "var(--text-muted)", fontSize: 14 },
  error: { color: "#fca5a5", fontSize: 14 },
};
