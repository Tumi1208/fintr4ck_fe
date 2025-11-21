import { useEffect, useMemo, useState } from "react";
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
    participantCount: 820,
  },
  {
    _id: "fallback-2",
    title: "Tiết kiệm 100.000đ/ngày trong 30 ngày",
    description: "Mỗi ngày cất riêng 100k, sau 30 ngày bạn có 3 triệu.",
    type: "SAVE_FIXED",
    durationDays: 30,
    participantCount: 1260,
  },
  { _id: "fallback-3", title: "7 ngày không order đồ ăn", description: "Tự nấu cơm cả tuần, ví khoẻ và bụng ấm.", type: "NO_SPEND", durationDays: 7, participantCount: 540 },
  { _id: "fallback-4", title: "14 ngày không mua đồ online", description: "Dừng shopping online 14 ngày để phân biệt thật sự cần hay muốn.", type: "NO_SPEND", durationDays: 14, participantCount: 920 },
  { _id: "fallback-5", title: "21 ngày ghi chép chi tiêu", description: "Mỗi ngày dành 3 phút note lại mọi khoản chi.", type: "CUSTOM", durationDays: 21, participantCount: 610 },
  { _id: "fallback-6", title: "Mỗi ngày 50k tiền tiết kiệm", description: "Bỏ 50k vào hũ mỗi ngày trong 30 ngày.", type: "SAVE_FIXED", durationDays: 30, participantCount: 740 },
  { _id: "fallback-7", title: "Quỹ khẩn cấp 1 tháng lương", description: "Chốt mục tiêu tích luỹ 1 tháng lương trong 60 ngày.", type: "SAVE_GOAL", durationDays: 60, participantCount: 380 },
  { _id: "fallback-8", title: "1 tuần chỉ uống nước lọc", description: "Không cà phê, không trà sữa, chỉ nước lọc 7 ngày.", type: "HEALTH", durationDays: 7, participantCount: 420 },
  { _id: "fallback-9", title: "Không grab/giao đồ 10 ngày", description: "Đi bộ/xe đạp và tự nấu ăn 10 ngày.", type: "NO_SPEND", durationDays: 10, participantCount: 305 },
  { _id: "fallback-10", title: "Đảo nợ 0% lãi", description: "Lập kế hoạch chuyển nợ sang lãi suất 0% trong 30 ngày.", type: "DEBT", durationDays: 30, participantCount: 190 },
  { _id: "fallback-11", title: "Cắt 3 subscription không dùng", description: "Rà soát và huỷ 3 dịch vụ không dùng trong 14 ngày.", type: "NO_SPEND", durationDays: 14, participantCount: 510 },
  { _id: "fallback-12", title: "Thử sống tối giản 10 món", description: "Chỉ dùng 10 món đồ thiết yếu trong 7 ngày.", type: "MINIMAL", durationDays: 7, participantCount: 275 },
  { _id: "fallback-13", title: "Ăn sáng 20k", description: "Giữ ngân sách ăn sáng tối đa 20k trong 14 ngày.", type: "BUDGET", durationDays: 14, participantCount: 330 },
  { _id: "fallback-14", title: "30 ngày không mua thời trang", description: "Dừng mọi chi cho quần áo/giày dép trong 30 ngày.", type: "NO_SPEND", durationDays: 30, participantCount: 670 },
  { _id: "fallback-15", title: "Tuần lễ không cà phê", description: "Nói không với cà phê 7 ngày, thay bằng nước lọc/trà túi lọc.", type: "HEALTH", durationDays: 7, participantCount: 240 },
  { _id: "fallback-16", title: "Bữa trưa 35k", description: "Giữ chi phí bữa trưa tối đa 35k trong 14 ngày.", type: "BUDGET", durationDays: 14, participantCount: 360 },
  { _id: "fallback-17", title: "Không chạm thẻ tín dụng 14 ngày", description: "Chỉ dùng tiền mặt trong 14 ngày để kiểm soát chi.", type: "DEBT", durationDays: 14, participantCount: 410 },
  { _id: "fallback-18", title: "Tăng thu phụ 1 triệu", description: "Thử kiếm thêm 1 triệu trong 30 ngày từ công việc phụ.", type: "INCOME", durationDays: 30, participantCount: 295 },
  { _id: "fallback-19", title: "Đi bộ 6.000 bước/ngày", description: "Vừa khoẻ vừa tiết kiệm tiền đi lại trong 21 ngày.", type: "HEALTH", durationDays: 21, participantCount: 520 },
  { _id: "fallback-20", title: "Meal-prep cuối tuần", description: "Chuẩn bị đồ ăn cho 5 ngày chỉ trong 1 buổi cuối tuần.", type: "BUDGET", durationDays: 7, participantCount: 440 },
  { _id: "fallback-21", title: "Âm nhạc thay vì mua sắm", description: "Bất cứ khi nào muốn mua sắm, hãy nghe playlist 5 bài thay thế.", type: "NO_SPEND", durationDays: 10, participantCount: 210 },
  { _id: "fallback-22", title: "Đọc 2 cuốn về tài chính", description: "Hoàn thành 2 cuốn sách về tài chính cá nhân trong 30 ngày.", type: "LEARN", durationDays: 30, participantCount: 180 },
  { _id: "fallback-23", title: "30 ngày tiết kiệm 10% thu nhập", description: "Tách 10% thu nhập vào tài khoản tiết kiệm mỗi tuần.", type: "SAVE_PERCENT", durationDays: 30, participantCount: 510 },
  { _id: "fallback-24", title: "Viết nhật ký biết ơn", description: "Mỗi ngày viết 3 điều biết ơn để giảm chi tiêu cảm xúc.", type: "MINDFUL", durationDays: 21, participantCount: 200 },
  { _id: "fallback-25", title: "Không mua đồ tiện lợi", description: "Tránh cửa hàng tiện lợi 10 ngày, chỉ mua ở chợ/siêu thị.", type: "NO_SPEND", durationDays: 10, participantCount: 260 },
  { _id: "fallback-26", title: "Gọi điện thay vì tụ tập", description: "Khi nhớ bạn bè, hãy gọi điện thay vì cà phê ngoài.", type: "BUDGET", durationDays: 14, participantCount: 230 },
  { _id: "fallback-27", title: "Hạn mức giải trí 100k/tuần", description: "Khoá chi tiêu giải trí trong 100k mỗi tuần, kéo dài 4 tuần.", type: "BUDGET", durationDays: 28, participantCount: 370 },
  { _id: "fallback-28", title: "Tự pha cà phê tại nhà", description: "Pha cà phê tại nhà 10 ngày, ghi lại số tiền tiết kiệm.", type: "BUDGET", durationDays: 10, participantCount: 345 },
  { _id: "fallback-29", title: "Không scrolling 1 tiếng trước ngủ", description: "Giảm dopamine từ mạng xã hội, ngủ sớm để khoẻ & tiết kiệm.", type: "MINDFUL", durationDays: 14, participantCount: 415 },
  { _id: "fallback-30", title: "Bán 3 món không dùng", description: "Bán 3 món ít dùng để bổ sung quỹ tiết kiệm trong 14 ngày.", type: "INCOME", durationDays: 14, participantCount: 265 },
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
        const incoming = Array.isArray(data) ? data : [];
        // Nếu API chỉ có vài challenge, trộn thêm fallback để demo phong phú
        const existIds = new Set(incoming.map((c) => c._id));
        const merged = [...incoming];
        for (const fb of fallbackChallenges) {
          if (!existIds.has(fb._id)) merged.push(fb);
        }
        setItems(merged.slice(0, 32));
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

  const normalizedItems = useMemo(
    () =>
      items.map((c) => ({
        ...c,
        participantCount:
          c.participantCount ??
          c.participantsCount ??
          c.joinCount ??
          (Array.isArray(c.participants) ? c.participants.length : 0) ??
          Math.max(180, 40 * (c.durationDays || 7)), // fallback ước lượng để có dữ liệu cho leaderboard
      })),
    [items]
  );

  const topChallenges = useMemo(() => {
    const sorted = [...normalizedItems].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0));
    const top3 = sorted.filter((c) => (c.participantCount || 0) > 0).slice(0, 3);
    return top3;
  }, [normalizedItems]);

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

      {topChallenges.length > 0 && (
        <div style={styles.leaderboard}>
          <div style={styles.lbHeader}>
            <div>
              <div style={styles.lbTitle}>Bảng xếp hạng</div>
              <div style={styles.lbSubtitle}>Top 3 challenge nhiều người tham gia</div>
            </div>
          </div>
          <div style={styles.podiumWrap}>
            {[topChallenges[1], topChallenges[0], topChallenges[2]]
              .filter(Boolean)
              .map((c, orderIdx) => {
                const isCenter = orderIdx === 1;
                const tier = isCenter ? 1 : orderIdx === 0 ? 2 : 3;
                const height = isCenter ? 230 : orderIdx === 0 ? 150 : 130;
                return (
                  <div key={c._id} style={{ ...styles.podiumCol, height }}>
                    <div style={{ ...styles.podium, ...(isCenter ? styles.podiumCenter : orderIdx === 0 ? styles.podiumLeft : styles.podiumRight) }}>
                      <div
                        style={{
                          ...styles.podiumTop,
                          ...(tier === 1
                            ? styles.podiumTopGold
                            : tier === 2
                            ? styles.podiumTopSilver
                            : styles.podiumTopBronze),
                        }}
                      />
                      <div style={{ ...styles.podiumRank, ...(tier === 2 ? styles.podiumRankSilver : tier === 3 ? styles.podiumRankBronze : {}) }}>
                        {tier}
                      </div>
                      <div style={styles.podiumName}>{c.title}</div>
                      <div style={styles.podiumMeta}>
                        <span style={styles.lbCount}>{c.participantCount?.toLocaleString("en-US")} người</span>
                        <span style={styles.lbType}>{c.type}</span>
                      </div>
                      {joinedIds.has(c._id) ? (
                        <button style={styles.podiumBtn} onClick={() => navigate("/app/my-challenges")}>
                          Đã tham gia · Xem tiến độ
                        </button>
                      ) : (
                        <button
                          style={styles.podiumBtn}
                          onClick={() => handleJoin(c._id)}
                          disabled={joiningId === c._id}
                        >
                          {joiningId === c._id ? "Đang tham gia..." : "Tham gia ngay"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {normalizedItems.map((c) => (
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
  leaderboard: {
    background: "linear-gradient(140deg, rgba(124,58,237,0.12), rgba(14,165,233,0.1))",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
  },
  lbHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  lbTitle: { fontWeight: 800, color: "var(--text-strong)" },
  lbSubtitle: { color: "var(--text-muted)", fontSize: 13 },
  podiumWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    alignItems: "end",
    marginTop: 12,
  },
  podiumCol: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  podium: {
    position: "relative",
    width: "100%",
    borderRadius: 16,
    padding: "16px 14px 14px",
    background: "linear-gradient(180deg, #111827 0%, #0b1021 100%)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
    display: "grid",
    gap: 10,
    minHeight: 120,
  },
  podiumCenter: {
    background: "linear-gradient(180deg, #1f2937 0%, #0b1021 100%)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
    marginTop: -10,
  },
  podiumLeft: {
    marginTop: 24,
  },
  podiumRight: {
    marginTop: 34,
  },
  podiumRank: {
    alignSelf: "start",
    justifySelf: "flex-start",
    padding: "6px 12px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#0b1021",
    fontWeight: 900,
    fontSize: 16,
    boxShadow: "0 10px 24px rgba(245,158,11,0.35)",
  },
  podiumRankSilver: {
    background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
    boxShadow: "0 10px 24px rgba(148,163,184,0.35)",
  },
  podiumRankBronze: {
    background: "linear-gradient(135deg, #d97706, #b45309)",
    boxShadow: "0 10px 24px rgba(180,83,9,0.35)",
  },
  podiumTop: {
    position: "absolute",
    top: -10,
    left: -6,
    right: -6,
    height: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    boxShadow: "0 12px 24px rgba(0,0,0,0.26)",
  },
  podiumTopGold: {
    background: "linear-gradient(180deg, #facc15, #f59e0b)",
  },
  podiumTopSilver: {
    background: "linear-gradient(180deg, #e2e8f0, #cbd5e1)",
  },
  podiumTopBronze: {
    background: "linear-gradient(180deg, #fcd19c, #e69b50)",
  },
  podiumName: { fontWeight: 800, color: "var(--text-strong)", lineHeight: 1.4, fontSize: 15 },
  podiumMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  lbCount: { color: "#67e8f9", fontWeight: 700 },
  lbType: {
    padding: "4px 8px",
    borderRadius: 10,
    background: "rgba(124,58,237,0.14)",
    color: "#c4b5fd",
    fontWeight: 700,
    fontSize: 11,
    textTransform: "uppercase",
  },
  podiumBtn: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(124,58,237,0.45)",
    background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    color: "#0b1021",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 32px rgba(14,165,233,0.35)",
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
