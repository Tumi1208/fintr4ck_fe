import { useMemo } from "react";

function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ChallengeCalendar({ startDate, completedDays = 0, durationDays = 0 }) {
  const { weeks, monthLabel } = useMemo(() => {
    if (!startDate) return { weeks: [], monthLabel: "" };
    const start = normalize(startDate);
    const today = normalize(new Date());
    const completedEnd = new Date(start);
    completedEnd.setDate(start.getDate() + Math.max(completedDays - 1, 0));
    const durationEnd = new Date(start);
    durationEnd.setDate(start.getDate() + Math.max(durationDays - 1, 0));

    // chọn tháng hiển thị: tháng của ngày hôm nay nếu nằm trong challenge, ngược lại tháng của start
    const target = today >= start && today <= durationEnd ? today : start;
    const firstOfMonth = normalize(new Date(target.getFullYear(), target.getMonth(), 1));
    const startWeekDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cur = new Date(target.getFullYear(), target.getMonth(), d);
      const inChallenge = cur >= start && cur <= durationEnd;
      const checked = cur >= start && cur <= completedEnd;
      const isToday = cur.getTime() === today.getTime();
      cells.push({ date: cur, inChallenge, checked, isToday });
    }
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    const monthLabel = `${target.toLocaleString("default", { month: "long" })} ${target.getFullYear()}`;
    return { weeks, monthLabel };
  }, [startDate, completedDays, durationDays]);

  if (!startDate) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Lịch check-in</span>
        <span style={styles.month}>{monthLabel}</span>
      </div>
      <div style={styles.weekHeader}>
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div key={d} style={styles.weekDay}>
            {d}
          </div>
        ))}
      </div>
      <div style={styles.grid}>
        {weeks.map((week, wi) =>
          week.map((cell, ci) => {
            if (!cell) return <div key={`${wi}-${ci}`} style={styles.cellEmpty} />;
            const bg = cell.checked
              ? "rgba(16,185,129,0.8)"
              : cell.inChallenge
              ? "rgba(148,163,184,0.25)"
              : "transparent";
            const border = cell.isToday ? "2px solid #fbbf24" : "1px solid rgba(148,163,184,0.2)";
            return (
              <div
                key={`${wi}-${ci}`}
                style={{
                  ...styles.cell,
                  background: bg,
                  border,
                  boxShadow: cell.checked ? "0 0 8px rgba(16,185,129,0.35)" : "none",
                  color: cell.checked ? "#0b1021" : "#e2e8f0",
                }}
              >
                {cell.date.getDate()}
              </div>
            );
          }),
        )}
      </div>
      <div style={styles.legend}>
        <Legend color="rgba(16,185,129,0.8)" label="Đã check-in" />
        <Legend color="rgba(148,163,184,0.25)" label="Trong phạm vi challenge" />
        <Legend border="2px solid #fbbf24" label="Hôm nay" />
      </div>
    </div>
  );
}

function Legend({ color, border, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 4,
          background: color || "transparent",
          border: border || "1px solid rgba(148,163,184,0.4)",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

const styles = {
  wrapper: {
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: 12,
    padding: 12,
    background: "rgba(226,232,240,0.02)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { color: "var(--text-strong)", fontWeight: 800 },
  month: { color: "var(--text-muted)", fontSize: 12 },
  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    marginBottom: 6,
    color: "var(--text-muted)",
    fontSize: 12,
  },
  weekDay: {
    textAlign: "center",
    padding: "6px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
  },
  cell: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: 13,
    transition: "transform 0.1s ease",
  },
  cellEmpty: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 10,
    background: "rgba(226,232,240,0.05)",
    border: "1px dashed rgba(148,163,184,0.1)",
  },
  legend: {
    marginTop: 10,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};

// Cách sử dụng:
// <ChallengeCalendar startDate={userChallenge.startDate} completedDays={userChallenge.completedDays} durationDays={userChallenge.challenge.durationDays} />
