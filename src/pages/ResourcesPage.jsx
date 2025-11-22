// src/pages/ResourcesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";

export default function ResourcesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const resources = [
    {
      id: 1,
      type: "video",
      title: "Quy tắc 50/30/20: Bí mật quản lý tài chính",
      desc: "Phương pháp phân chia thu nhập kinh điển: 50% thiết yếu, 30% mong muốn, 20% tiết kiệm. Hướng dẫn thực hành chi tiết.",
      duration: 12,
      source: "Maggie Maggie",
      level: "Cơ bản",
      // Link Video thật từ kênh Maggie Maggie
      link: "https://www.youtube.com/watch?v=1v_B5TKH7qY", 
      // Thumbnail thật lấy trực tiếp từ ID video Youtube
      thumbnail: "https://img.youtube.com/vi/1v_B5TKH7qY/maxresdefault.jpg", 
    },
    {
      id: 2,
      type: "article",
      title: "Sai lầm khiến người trẻ quản lý tài chính kém",
      desc: "Phung phí chi tiêu, đầu tư ngoài khả năng là những rào cản lớn. Đọc ngay trên VnExpress để tránh mắc phải.",
      duration: 5,
      source: "VnExpress",
      level: "Cơ bản",
      // Link bài báo thật trên VnExpress
      link: "https://vnexpress.net/sai-lam-khien-nguoi-tre-quan-ly-tai-chinh-kem-hieu-qua-4580620.html", 
      // Ảnh minh họa thật (Unsplash) chủ đề 'money stress'
      thumbnail: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      type: "video",
      title: "Đầu tư với số vốn nhỏ (50 Triệu) cho người mới",
      desc: "Podcast chia sẻ cách bắt đầu đầu tư an toàn và hiệu quả cho người mới bắt đầu từ kênh Trọng Tài Chính.",
      duration: 18,
      source: "Trọng Tài Chính",
      level: "Trung cấp",
      // Link Video thật
      link: "https://www.youtube.com/watch?v=FBkzd9A7Sk0",
      // Thumbnail thật từ Youtube
      thumbnail: "https://img.youtube.com/vi/FBkzd9A7Sk0/maxresdefault.jpg",
    },
    {
      id: 4,
      type: "tool",
      title: "Công cụ tính lãi kép Online (VNSC)",
      desc: "Nhập số vốn, lãi suất và thời gian để thấy sức mạnh của lãi kép. Công cụ uy tín từ VNSC by Finhay.",
      duration: 2,
      source: "VNSC by Finhay",
      level: "Trung cấp",
      // Link Tool thật
      link: "https://www.vnsc.vn/cong-cu-tinh-lai-kep/",
      // Ảnh minh họa thật (Unsplash) chủ đề 'growth chart'
      thumbnail: "https://www.vnsc.vn/wp-content/uploads/2024/12/lai-kep-topcv.png",
    }
  ];

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(searchValue.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchValue]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      if (!searchTerm) return matchesType;
      const haystack = `${item.title} ${item.desc}`.toLowerCase();
      return matchesType && haystack.includes(searchTerm);
    });
  }, [resources, searchTerm, typeFilter]);

  const filters = [
    { label: "Tất cả", value: "all" },
    { label: "Video", value: "video" },
    { label: "Bài viết", value: "article" },
    { label: "Công cụ", value: "tool" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [typeFilter]);

  function getTagMeta(type) {
    if (type === "video") return { label: "Video hướng dẫn", icon: "play", tone: "brand" };
    if (type === "article") return { label: "Bài viết chọn lọc", icon: "article", tone: "amber" };
    return { label: "Công cụ tính toán", icon: "tool", tone: "green" };
  }

  return (
    <PageTransition>
      <div style={styles.titleRow}>
        <Icon name="book" tone="brand" size={26} />
        <h1 style={styles.pageTitle}>Góc Kiến Thức Tài Chính</h1>
      </div>
      <p style={styles.subTitle}>Tổng hợp nguồn uy tín giúp bạn nâng cao tư duy tài chính.</p>
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Icon name="search" size={18} tone="muted" background={false} />
          <input
            style={styles.searchInput}
            placeholder="Tìm video/bài viết/công cụ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div style={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              style={{
                ...styles.filterPill,
                ...(typeFilter === filter.value ? styles.filterPillActive : {}),
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        {filteredResources.map((item, idx) => (
          <Card key={item.id} style={styles.card} animate custom={idx}>
            <a href={item.link} target="_blank" rel="noreferrer" style={styles.anchor}>
              <div style={styles.thumbWrapper}>
                <img src={item.thumbnail} alt={item.title} style={styles.thumb} />
                {(() => {
                  const meta = getTagMeta(item.type);
                  return (
                    <span style={styles.tag}>
                      <Icon name={meta.icon} tone={meta.tone} size={16} />
                      <span>{meta.label}</span>
                    </span>
                  );
                })()}
                {item.type === "video" && (
                  <div style={styles.playIcon}>
                    <Icon name="play" tone="brand" size={30} background={false} />
                  </div>
                )}
              </div>
              <div style={styles.content}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <div style={styles.metaRow}>
                  {(() => {
                    const chips = [];
                    if (item.type === "video") chips.push(`Video • ${item.duration} phút`);
                    else if (item.type === "article") chips.push(`Bài viết • ${item.duration} phút đọc`);
                    else chips.push("Công cụ • thao tác nhanh");
                    if (item.source) chips.push(item.source);
                    if (item.level) chips.push(item.level);
                    return chips.map((chip, chipIdx) => (
                      <span key={chipIdx} style={styles.metaChip}>{chip}</span>
                    ));
                  })()}
                </div>
                <p style={styles.cardDesc}>{item.desc}</p>
                <span style={styles.linkText}>
                  Xem chi tiết
                  <Icon name="link" tone="brand" size={16} background={false} />
                </span>
              </div>
            </a>
          </Card>
        ))}
      </div>
    </PageTransition>
  );
}

const styles = {
  titleRow: { display: "flex", alignItems: "center", gap: 10 },
  pageTitle: { fontSize: 26, color: "var(--text-strong)", marginBottom: 4, fontWeight: 800 },
  subTitle: { fontSize: 14, color: "var(--text-muted)", marginBottom: 18 },
  controls: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 18,
  },
  searchBox: {
    flex: "1 1 260px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  searchInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text-strong)",
    fontSize: 14,
  },
  filters: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterPill: {
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "var(--text-muted)",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all 0.2s ease",
  },
  filterPillActive: {
    background: "linear-gradient(120deg, #5eead4, #38bdf8)",
    color: "#0b1222",
    borderColor: "transparent",
    boxShadow: "0 10px 30px rgba(56,189,248,0.25)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    overflow: "hidden",
    cursor: "pointer",
    height: "100%",
    minHeight: 380,
    display: "flex",
    flexDirection: "column",
  },
  anchor: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flex: 1,
  },
  thumbWrapper: {
    height: 180,
    position: "relative",
    backgroundColor: "var(--bg-primary)",
    overflow: "hidden",
    borderRadius: 16,
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "saturate(1.05)",
  },
  tag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(5,8,20,0.65)",
    backdropFilter: "blur(8px)",
    padding: "4px 10px 4px 6px",
    borderRadius: 16,
    fontSize: 11,
    color: "#F8FAFC",
    fontWeight: 600,
    boxShadow: "0 10px 30px rgba(0,0,0,0.26)",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid rgba(255,255,255,0.18)",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 62,
    height: 62,
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.78))",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.26)",
  },
  content: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    margin: "0 0 8px 0",
    color: "var(--text-strong)",
    fontWeight: 700,
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  metaChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.2,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardDesc: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 16,
    flex: 1,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  linkText: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#67e8f9",
    fontWeight: 600,
    fontSize: 14,
    marginTop: "auto",
  }
};
