import { useEffect, useState } from "react";
import { authApiHelpers } from "../api/auth";

const { API_BASE, getAuthHeaders } = authApiHelpers;

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState("");

  async function fetchChallenges() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/challenges`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách challenge");
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function handleJoin(id) {
    try {
      setJoiningId(id);
      const res = await fetch(`${API_BASE}/challenges/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tham gia challenge");
      alert("Tham gia challenge thành công!");
      fetchChallenges();
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
          <h1 style={styles.title}>Thử thách tiết kiệm</h1>
          <p style={styles.lead}>Chọn challenge phù hợp và tham gia để theo dõi streak mỗi ngày.</p>
        </div>
      </div>

      {loading && <div style={styles.info}>Đang tải danh sách...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {challenges.map((item) => (
          <div key={item._id} style={styles.card}>
            <div style={styles.cardHead}>
              <span style={styles.badge}>{item.type}</span>
              <span style={styles.duration}>{item.durationDays} ngày</span>
            </div>
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.cardDesc}>{item.description}</p>
            <button
              style={styles.joinBtn}
              onClick={() => handleJoin(item._id)}
              disabled={joiningId === item._id}
            >
              {joiningId === item._id ? "Đang tham gia..." : "Tham gia"}
            </button>
          </div>
        ))}
        {!loading && challenges.length === 0 && <div style={styles.info}>Chưa có challenge.</div>}
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
