import { useEffect, useState } from "react";
import { authApiHelpers } from "../api/auth";
import StreakBadge from "../components/StreakBadge";
import PageTransition from "../components/PageTransition";
import ModalDialog from "../components/ModalDialog";
import { useDialog } from "../hooks/useDialog";

const { API_BASE, getAuthHeaders } = authApiHelpers;
const DEMO_STORAGE_KEY = "fintr_demo_my_challenges";

const MOTIVATION_MESSAGES = [
  "Tuyệt vời! Bạn vừa tiến gần hơn tới mục tiêu tài chính của mình.",
  "Giữ vững phong độ nhé, tiền tiết kiệm đang lớn dần lên!",
  "Mỗi ngày kỷ luật một chút, tương lai của bạn sẽ khác hẳn.",
  "Bạn đã thắng chính mình hôm nay. Tiếp tục thôi!",
  "Ví tiền tương lai gửi lời cảm ơn bạn đó.",
  "Hôm nay không bỏ cuộc, ngày mai bớt lo lắng.",
  "Đường dài cần kiên nhẫn – bạn đang làm rất tốt.",
  "Một ngày không tiêu linh tinh = một bước gần hơn với tự do tài chính.",
  "Nhỏ nhưng đều, sức mạnh của thói quen đang đứng về phía bạn.",
  "Tiền không tự nhiên mất đi, nó chỉ chảy về phía người kỷ luật – như bạn hôm nay.",
];

function getRandomMotivationMessage() {
  const idx = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
  return MOTIVATION_MESSAGES[idx];
}

function getMotivationMessageForStreak(streak) {
  if (streak >= 30) return "Huyền thoại streak! Tài chính tương lai của bạn sẽ cực kỳ vững.";
  if (streak === 20) return "20 ngày! Sức mạnh kỷ luật của bạn thật đáng nể.";
  if (streak === 10) return "10 ngày bền bỉ – bạn đang trên đà rất tốt!";
  if (streak === 5) return "5 ngày liên tiếp! Thói quen tốt đang dần hình thành.";
  if (streak === 1) return "Ngày đầu tiên luôn là khó nhất, bạn đã làm được!";
  return getRandomMotivationMessage();
}

function isSameLocalDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function computeCheckedInToday(userChallenge) {
  if (typeof userChallenge.checkedInToday === "boolean") return userChallenge.checkedInToday;
  if (!userChallenge.lastCheckInDate) return false;
  const last = new Date(userChallenge.lastCheckInDate);
  return isSameLocalDay(last, new Date());
}

function progressPercent(item) {
  const duration = item.challenge?.durationDays || 1;
  const completed = item.completedDays ?? item.currentStreak ?? 0;
  return Math.min(100, Math.round((completed / duration) * 100));
}

function summarizeChallenges(list) {
  const participatingCount = list.filter((i) => i.status === "ACTIVE").length;
  const bestStreak = list.reduce((max, i) => Math.max(max, i.currentStreak || 0), 0);
  // No per-day history available; approximate month check-ins by total completed days.
  const totalCheckInsThisMonth = list.reduce((sum, i) => sum + (i.completedDays ?? i.currentStreak ?? 0), 0);
  let nearest = null;
  list.forEach((i) => {
    const pct = progressPercent(i);
    if (!nearest || pct > nearest.progress) nearest = { name: i.challenge?.title || "Thử thách", progress: pct };
  });
  return { participatingCount, bestStreak, totalCheckInsThisMonth, nearest };
}

const SORT_PRESETS = [
  { value: "progress", label: "Gần hoàn thành nhất" },
  { value: "streak", label: "Chuỗi ngày cao nhất" },
  { value: "joined", label: "Mới tham gia" },
  { value: "remaining", label: "Còn ít ngày nhất" },
];

function remainingDays(item) {
  const total = item.challenge?.durationDays;
  if (!total || Number.isNaN(Number(total))) return Infinity;
  const completed = item.completedDays ?? item.currentStreak ?? 0;
  return Math.max(0, total - completed);
}

function joinedTimestamp(item) {
  const joined = item.joinedAt || item.createdAt;
  const t = joined ? new Date(joined).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

function sortItems(list, preset) {
  const arr = [...list];
  arr.sort((a, b) => {
    if (preset === "streak") return (b.currentStreak || 0) - (a.currentStreak || 0);
    if (preset === "joined") return joinedTimestamp(b) - joinedTimestamp(a);
    if (preset === "remaining") return remainingDays(a) - remainingDays(b) || progressPercent(b) - progressPercent(a);
    // default progress desc
    return progressPercent(b) - progressPercent(a) || (b.currentStreak || 0) - (a.currentStreak || 0);
  });
  return arr;
}

export default function MyChallengesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState("");
  const [leavingId, setLeavingId] = useState("");
  const [sortPreset, setSortPreset] = useState("progress");
  const [toasts, setToasts] = useState([]);
  const { dialog, showDialog, handleConfirm, handleCancel } = useDialog();

  const loadDemoJoins = () => {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const removeDemoJoin = (id) => {
    try {
      const filtered = loadDemoJoins().filter((d) => d._id !== id);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  const updateDemoJoin = (id, updater) => {
    try {
      const current = loadDemoJoins();
      const next = current.map((d) => (d._id === id ? updater({ ...d }) : d));
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
      return next.find((d) => d._id === id);
    } catch {
      return null;
    }
  };

  const mergeWithDemo = (apiItems = []) => {
    const demoItems = loadDemoJoins();
    if (!demoItems.length) return apiItems;
    const existIds = new Set(apiItems.map((i) => i._id || i.challenge?._id));
    const merged = [...apiItems];
    demoItems.forEach((d) => {
      if (!existIds.has(d._id)) merged.push(d);
    });
    return merged;
  };

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/challenges/my-challenges`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách");
      const baseItems = Array.isArray(data) ? data : [];
      setItems(mergeWithDemo(baseItems));
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
      const prevItem = items.find((i) => i._id === id);
      if (prevItem?.isDemo) {
        const already = computeCheckedInToday(prevItem);
        if (already) {
          await showDialog({
            title: "Đã check-in hôm nay",
            message: "Bạn đã check-in cho challenge này hôm nay rồi.",
            confirmText: "Đóng",
          });
          return;
        }
        const updated = updateDemoJoin(id, (draft) => {
          const now = new Date().toISOString();
          const prevStreak = draft.currentStreak || 0;
          draft.currentStreak = prevStreak + 1;
          draft.completedDays = (draft.completedDays || 0) + 1;
          draft.lastCheckInDate = now;
          return draft;
        });
        if (updated) {
          setItems((prev) => prev.map((i) => (i._id === id ? { ...i, ...updated } : i)));
          await showDialog({
            title: "Check-in thành công",
            message: "Bạn đã check-in challenge demo. Tiếp tục giữ vững nhé!",
            confirmText: "OK",
            tone: "success",
          });
        }
        return;
      }
      const res = await fetch(`${API_BASE}/challenges/my-challenges/${id}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể check-in");
      const prevProgress = prevItem ? progressPercent(prevItem) : 0;
      const newProgress = progressPercent({ ...prevItem, ...data });
      const streak = data.currentStreak || 0;
      await showDialog({
        title: "Check-in thành công",
        message: getMotivationMessageForStreak(streak),
        confirmText: "OK",
        tone: "success",
      });
      setItems((prev) =>
        prev.map((i) =>
          i._id === id
            ? {
                ...i,
                ...data,
                // Preserve existing challenge fields (title, type...) while merging updated data
                challenge: { ...i.challenge, ...(data.challenge || {}) },
              }
            : i,
        ),
      );
      const milestonesHit = [
        { percent: 25, label: "Bronze Spark" },
        { percent: 50, label: "Silver Flow" },
        { percent: 75, label: "Gold Peak" },
      ].filter((m) => prevProgress < m.percent && newProgress >= m.percent);
      if (milestonesHit.length > 0) {
        const top = milestonesHit[milestonesHit.length - 1];
        addToast(`Bạn vừa đạt ${top.label} 🎉`);
      }
    } catch (err) {
      await showDialog({ title: "Thông báo", message: err.message, confirmText: "Đóng", tone: "danger" });
    } finally {
      setCheckingId("");
    }
  }

  async function handleLeave(id) {
    try {
      setLeavingId(id);
      const target = items.find((i) => i._id === id);
      if (target?.isDemo) {
        removeDemoJoin(id);
        setItems((prev) => prev.filter((i) => i._id !== id));
        return;
      }
      const res = await fetch(`${API_BASE}/challenges/my-challenges/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Không thể huỷ tham gia");
      loadData();
    } catch (err) {
      await showDialog({ title: "Thông báo", message: err.message, confirmText: "Đóng", tone: "danger" });
    } finally {
      setLeavingId("");
    }
  }

  function addToast(message) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  return (
    <PageTransition style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Thử thách</p>
          <h1 style={styles.title}>Thử thách của tôi</h1>
          <p style={styles.lead}>Xem tiến độ, check-in và huỷ tham gia nếu cần.</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.sortBar}>
            <div style={styles.sortTitle}>Sắp xếp</div>
            <div style={styles.sortChips}>
              {SORT_PRESETS.map((opt) => {
                const active = sortPreset === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSortPreset(opt.value)}
                    style={{
                      ...styles.sortChip,
                      ...(active ? styles.sortChipActive : {}),
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <OverviewStrip items={items} />

      {loading && <div style={styles.info}>Đang tải...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableCard}>
        {toasts.length > 0 && (
          <div style={styles.toastStack}>
            {toasts.map((t) => (
              <div key={t.id} style={styles.toast}>
                {t.message}
              </div>
            ))}
          </div>
        )}
        <div style={styles.tableWrapper}>
          <div style={styles.tableHead}>
            <div style={styles.colWide}>Thử thách</div>
            <div style={styles.colStreak}>Chuỗi ngày</div>
            <div style={styles.colStatus}>Trạng thái</div>
            <div style={styles.colActions}>Hành động</div>
          </div>

        {sortItems(items, sortPreset).map((item) => {
          const duration = item.challenge?.durationDays || 1;
          const completed = item.completedDays ?? item.currentStreak ?? 0;
          const progress = progressPercent(item);
          const milestones = [
            { key: "bronze", label: "Bronze Spark", percent: 25 },
            { key: "silver", label: "Silver Flow", percent: 50 },
            { key: "gold", label: "Gold Peak", percent: 75 },
            { key: "finish", label: "Hoàn thành", percent: 100 },
          ];
          const reachedMilestone = milestones.reduce(
            (curr, m) => (progress >= m.percent ? m : curr),
            { key: "start", label: "Bắt đầu", percent: 0 },
          );
          const tiers = [{ key: "start", label: "Bắt đầu", percent: 0 }, ...milestones];
          const checkedInToday = computeCheckedInToday(item);
          return (
            <div key={item._id} style={styles.tableRow}>
              <div style={styles.colWide}>
                <div style={styles.titleRow}>
                  <div style={styles.cardTitle}>{item.challenge?.title || "Thử thách"}</div>
                  {item.status === "ACTIVE" && (
                    <span
                      style={{
                        ...styles.checkBadge,
                        ...(checkedInToday ? styles.checkBadgeDone : styles.checkBadgePending),
                      }}
                    >
                      {checkedInToday ? "Đã check-in ✓" : "Chưa check-in"}
                    </span>
                  )}
                </div>
                <div style={styles.mutedSmall}>
                  {completed}/{duration} ngày · Chuỗi ngày: {item.currentStreak}
                </div>

                <div style={styles.roadmapContainer}>
                  <div style={styles.roadmapHeader}>
                    <span style={styles.timelineTitle}>Lộ trình thành tích</span>
                    <span style={styles.timelineMeta}>{progress}% hoàn thành</span>
                  </div>
                  <div style={styles.roadmapTrack} aria-hidden>
                    <div style={{ ...styles.roadmapProgress, width: `${progress}%` }} />
                    {tiers.map((m) => (
                      <div
                        key={m.key}
                        style={{
                          ...styles.roadmapDot,
                          left: `${m.percent}%`,
                          background: progress >= m.percent ? "#22c55e" : "#0ea5e9",
                        }}
                      />
                    ))}
                    <div style={styles.labelsRow}>
                      {tiers.map((m) => (
                        <div key={m.key} style={{ ...styles.labelFloating, left: `${m.percent}%` }}>
                          <div
                            style={{
                              ...styles.labelPill,
                              background: progress >= m.percent ? "rgba(34,197,94,0.18)" : "rgba(79,70,229,0.18)",
                              color: progress >= m.percent ? "#bbf7d0" : "#c7d2fe",
                            }}
                          >
                            {progress >= m.percent ? `${m.label} ✓` : m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span style={styles.srOnly}>Bạn đang ở {progress}% lộ trình</span>
                </div>
              </div>

              <div style={styles.colStreak}>
                {item.currentStreak > 0 ? (
                  <StreakBadge streak={item.currentStreak} />
                ) : (
                  <span style={styles.mutedSmall}>Chưa có chuỗi</span>
                )}
              </div>

              <div style={styles.colStatus}>
                <span style={{ ...styles.badge, background: badgeBg(item.status) }}>{statusLabel(item.status)}</span>
              </div>

              <div style={styles.colActions}>
                {item.status === "ACTIVE" && (
                  <button
                    style={{
                      ...styles.checkBtn,
                      ...(checkedInToday ? styles.checkBtnDone : styles.checkBtnPrimary),
                      opacity: checkingId === item._id ? 0.8 : 1,
                    }}
                    onClick={() => !checkedInToday && handleCheckIn(item._id)}
                    disabled={checkingId === item._id || checkedInToday}
                  >
                    {checkingId === item._id
                      ? "Đang check-in..."
                      : checkedInToday
                      ? "Đã check-in ✓"
                      : "Check-in hôm nay"}
                  </button>
                )}
                <button
                  style={{ ...styles.leaveBtn, opacity: leavingId === item._id ? 0.7 : 1 }}
                  onClick={async () => {
                    const confirmed = await showDialog({
                      title: "Huỷ sẽ reset chuỗi ngày",
                      message: "Bạn chắc chắn huỷ?",
                      confirmText: "Huỷ",
                      cancelText: "Để sau",
                      tone: "danger",
                    });
                    if (confirmed) handleLeave(item._id);
                  }}
                  disabled={leavingId === item._id}
                >
                  {leavingId === item._id ? "Đang huỷ..." : "Huỷ tham gia"}
                </button>
              </div>
            </div>
          );
        })}
        </div>
        {!loading && items.length === 0 && <div style={styles.info}>Bạn chưa tham gia challenge nào.</div>}
      </div>
      <ModalDialog
        open={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        confirmText={dialog?.confirmText}
        cancelText={dialog?.cancelText}
        tone={dialog?.tone}
        onConfirm={handleConfirm}
        onCancel={dialog?.cancelText ? handleCancel : handleConfirm}
      />
    </PageTransition>
  );
}

function OverviewStrip({ items }) {
  const { participatingCount, bestStreak, totalCheckInsThisMonth, nearest } = summarizeChallenges(items || []);

  return (
    <div style={styles.overviewRow}>
      <div style={styles.overviewCard}>
        <div style={styles.overviewLabel}>Đang tham gia</div>
        <div style={styles.overviewValue}>{participatingCount}</div>
      </div>
      <div style={styles.overviewCard}>
        <div style={styles.overviewLabel}>Chuỗi ngày dài nhất</div>
        <div style={styles.overviewValue}>{bestStreak} ngày</div>
      </div>
      <div style={styles.overviewCard}>
        <div style={styles.overviewLabel}>Check-in tháng này</div>
        <div style={styles.overviewValue}>{totalCheckInsThisMonth}</div>
      </div>
      <div style={styles.overviewCard}>
        <div style={styles.overviewLabel}>Gần hoàn thành</div>
        <div style={styles.overviewValue}>
          {nearest ? `${nearest.name} (${nearest.progress}%)` : "Chưa có"}
        </div>
      </div>
    </div>
  );
}

function badgeBg(status) {
  if (status === "COMPLETED") return "rgba(34,197,94,0.2)";
  if (status === "FAILED") return "rgba(239,68,68,0.2)";
  return "rgba(99,102,241,0.2)";
}

function statusLabel(status) {
  if (status === "ACTIVE") return "Đang diễn ra";
  if (status === "COMPLETED") return "Hoàn thành";
  if (status === "FAILED") return "Thất bại";
  return status || "Khác";
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
  cardTitle: { fontWeight: 800, color: "var(--text-strong)", marginBottom: 4 },
  muted: { color: "var(--text-muted)", fontSize: 13 },
  mutedSmall: { color: "var(--text-muted)", fontSize: 12 },
  badge: {
    padding: "6px 10px",
    borderRadius: 10,
    color: "var(--text-strong)",
    fontWeight: 700,
    fontSize: 12,
    border: "1px solid rgba(148,163,184,0.2)",
  },
  roadmapContainer: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(148,163,184,0.08)",
    position: "relative",
  },
  roadmapHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" },
  timelineTitle: { fontSize: 13, fontWeight: 800, color: "var(--text-strong)" },
  timelineMeta: { fontSize: 12, fontWeight: 700, color: "#a5b4fc" },
  checkBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
  },
  checkBtnPrimary: {
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(99,102,241,0.9)",
    color: "#0b1021",
  },
  checkBtnDone: {
    border: "1px solid rgba(34,197,94,0.4)",
    background: "rgba(34,197,94,0.15)",
    color: "#bbf7d0",
    cursor: "not-allowed",
  },
  leaveBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.1)",
    color: "#fecdd3",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
  roadmapTrack: { position: "relative", marginTop: 8, marginBottom: 16, height: 14, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "visible", border: "1px solid rgba(0,0,0,0.35)", zIndex: 2 },
  roadmapProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(90deg, rgba(99,102,241,0.9), rgba(16,185,129,0.9))",
    borderRadius: 999,
    boxShadow: "0 0 14px rgba(14,165,233,0.45)",
  },
  roadmapDot: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: "50%",
    transform: "translateX(-50%)",
    border: "2px solid rgba(12,15,28,0.8)",
    background: "#0ea5e9",
    zIndex: 2,
  },
  roadmapLabel: {
    display: "none",
  },
  pointer: {
    position: "absolute",
    top: -30,
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  pointerArrow: { fontSize: 16, color: "#fbbf24", lineHeight: 1, textShadow: "0 0 8px rgba(251,191,36,0.35)" },
  pointerText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#fef3c7",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(12,15,28,0.92)",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
  },
  info: { color: "var(--text-muted)", fontSize: 14 },
  error: { color: "#fca5a5", fontSize: 14 },
  labelsRow: {
    position: "absolute",
    top: 26,
    left: 0,
    right: 0,
    height: 28,
    pointerEvents: "none",
  },
  labelFloating: {
    position: "absolute",
    transform: "translateX(-50%)",
    fontSize: 12,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  labelPill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.16)",
    backdropFilter: "blur(10px)",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
  tableCard: {
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: 16,
    background: "rgba(226,232,240,0.04)",
    padding: 12,
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "2fr 1.6fr 1fr 1.6fr",
    gap: 10,
    padding: "10px 12px",
    fontWeight: 700,
    color: "var(--text-strong)",
    background: "rgba(148,163,184,0.08)",
    borderRadius: 12,
    minWidth: 760,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1.6fr 1fr 1.6fr",
    gap: 10,
    padding: "14px 12px",
    alignItems: "flex-start",
    rowGap: 8,
    borderRadius: 12,
    background: "rgba(226,232,240,0.02)",
    border: "1px solid rgba(148,163,184,0.08)",
    minWidth: 760,
  },
  colWide: { display: "flex", flexDirection: "column", gap: 4 },
  colStreak: { display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 },
  colStatus: { display: "flex", justifyContent: "center", alignItems: "center" },
  colActions: { display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", justifyContent: "center" },
  dropletLayer: { display: "none" },
  droplet: { display: "none" },
  dropletTitle: { display: "none" },
  dropletSub: { display: "none" },
  titleRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  checkBadge: {
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid transparent",
  },
  checkBadgePending: {
    background: "rgba(79,70,229,0.12)",
    color: "#c7d2fe",
    borderColor: "rgba(148,163,184,0.2)",
  },
  checkBadgeDone: {
    background: "rgba(34,197,94,0.12)",
    color: "#bbf7d0",
    borderColor: "rgba(34,197,94,0.4)",
  },
  overviewRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    margin: "4px 0 10px",
  },
  overviewCard: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(148,163,184,0.1)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  },
  overviewLabel: { color: "var(--text-muted)", fontSize: 12, marginBottom: 2, fontWeight: 700 },
  overviewValue: { color: "var(--text-strong)", fontSize: 16, fontWeight: 800 },
  headerActions: { display: "flex", alignItems: "flex-end", justifyContent: "flex-end" },
  sortBar: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(12,15,28,0.9), rgba(24,31,56,0.9))",
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  sortTitle: { color: "var(--text-muted)", fontSize: 12, fontWeight: 700, letterSpacing: 0.2 },
  sortChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  sortChip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-muted)",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sortChipActive: {
    background: "linear-gradient(90deg, rgba(99,102,241,0.85), rgba(16,185,129,0.8))",
    color: "#0b1021",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
  },
  toastStack: {
    position: "fixed",
    right: 16,
    top: 80,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 50,
  },
  toast: {
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.5)",
    color: "#bbf7d0",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
};
