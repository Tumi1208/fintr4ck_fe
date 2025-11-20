import { useEffect, useState } from "react";
import { authApiHelpers } from "../api/auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

export default function MyChallengesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/challenges/my-challenges`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCheckIn(id) {
    try {
      setCheckingId(id);
      const res = await fetch(`${API_BASE}/challenges/my-challenges/${id}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể check-in");
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckingId("");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Challenge</p>
          <h1 style={styles.title}>Challenge của tôi</h1>
          <p style={styles.lead}>Theo dõi tiến độ và check-in hằng ngày.</p>
        </div>
      </div>

      {loading && <div style={styles.info}>Đang tải...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.list}>
        {items.map((item) => {
          const duration = item.challenge?.durationDays || 1;
          const progress = Math.min(100, Math.round(((item.completedDays || 0) / duration) * 100));
          return (
            <div key={item._id} style={styles.card}>
              <div style={styles.cardRow}>
                <div>
                  <div style={styles.cardTitle}>{item.challenge?.title || "Challenge"}</div>
                  <div style={styles.muted}>
                    {item.completedDays || 0}/{duration} ngày • Streak: {item.currentStreak} (max {item.longestStreak})
                  </div>
                </div>
                <span style={{ ...styles.badge, background: badgeBg(item.status) }}>{item.status}</span>
              </div>

              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.muted}>Hoàn thành: {progress}%</div>

              {item.status === "ACTIVE" && (
                <button
                  style={styles.checkBtn}
                  onClick={() => handleCheckIn(item._id)}
                  disabled={checkingId === item._id}
                >
                  {checkingId === item._id ? "Đang check-in..." : "Check-in hôm nay"}
                </button>
              )}
            </div>
          );
        })}

        {!loading && items.length === 0 && <div style={styles.info}>Bạn chưa tham gia challenge nào.</div>}
      </div>
    </div>
  );
}

function badgeBg(status) {
  if (status === "COMPLETED") return "rgba(34,197,94,0.2)";
  if (status === "FAILED") return "rgba(239,68,68,0.2)";
  return "rgba(99,102,241,0.2)";
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
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
  cardRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontWeight: 800, color: "var(--text-strong)", marginBottom: 4 },
  muted: { color: "var(--text-muted)", fontSize: 13 },
  badge: {
    padding: "6px 10px",
    borderRadius: 10,
    color: "var(--text-strong)",
    fontWeight: 700,
    fontSize: 12,
    border: "1px solid rgba(148,163,184,0.2)",
  },
  progressBar: {
    width: "100%",
    height: 8,
    background: "rgba(148,163,184,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.9))",
  },
  checkBtn: {
    marginTop: 6,
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
