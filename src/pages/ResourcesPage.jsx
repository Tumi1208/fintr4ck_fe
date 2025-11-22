// src/pages/ResourcesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import { resourcesSeed } from "../data/resourcesSeed";

const FALLBACK_THUMB = "https://placehold.co/640x360/0b1222/94a3b8?text=Fintr4ck";

export default function ResourcesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [savedResourceIds, setSavedResourceIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("fintr4ck_saved_resources");
      return stored ? JSON.parse(stored).map(String) : [];
    } catch {
      return [];
    }
  });

  const resources = useMemo(
    () =>
      resourcesSeed.map((item) => {
        const normalizedThumb =
          item.thumbnail ||
          "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop";
        return {
          ...item,
          desc: item.description || item.desc || "",
          link: item.url || item.link,
          duration: item.duration ?? item.readTime ?? null,
          thumbnail: normalizedThumb,
        };
      }),
    []
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(searchValue.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchValue]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const isSaved = savedResourceIds.includes(String(item.id));
      if (typeFilter === "saved" && !isSaved) return false;
      const matchesType = typeFilter === "all" || typeFilter === "saved" || item.type === typeFilter;
      if (!searchTerm) return matchesType;
      const haystack = `${item.title} ${item.desc}`.toLowerCase();
      return matchesType && haystack.includes(searchTerm);
    });
  }, [resources, searchTerm, typeFilter, savedResourceIds]);

  const filters = [
    { label: "Tất cả", value: "all" },
    { label: "Video", value: "video" },
    { label: "Bài viết", value: "article" },
    { label: "Công cụ", value: "tool" },
    { label: "Đã lưu", value: "saved" },
  ];

  const featuredResource = useMemo(() => {
    return resources.find((r) => r.isFeatured) || resources[0];
  }, [resources]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [typeFilter]);

  useEffect(() => {
    try {
      window.localStorage.setItem("fintr4ck_saved_resources", JSON.stringify(savedResourceIds));
    } catch {
      // ignore write errors
    }
  }, [savedResourceIds]);

  const toggleBookmark = (id) => {
    const normalizedId = String(id);
    setSavedResourceIds((prev) => {
      if (prev.includes(normalizedId)) return prev.filter((x) => x !== normalizedId);
      return [...prev, normalizedId];
    });
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_THUMB;
  };

  function getTagMeta(type) {
    if (type === "video") return { label: "Video hướng dẫn", icon: "play", tone: "brand" };
    if (type === "article") return { label: "Bài viết chọn lọc", icon: "article", tone: "amber" };
    return { label: "Công cụ tính toán", icon: "tool", tone: "green" };
  }

  const resetFilters = () => {
    setSearchValue("");
    setSearchTerm("");
    setTypeFilter("all");
  };

  const SkeletonCard = () => (
    <div style={styles.skeletonCard}>
      <div style={styles.skeletonThumb} />
      <div style={styles.skeletonLineWide} />
      <div style={styles.skeletonLine} />
      <div style={styles.skeletonChipRow}>
        <div style={styles.skeletonChip} />
        <div style={styles.skeletonChip} />
      </div>
      <div style={styles.skeletonLine} />
      <div style={styles.skeletonButton} />
    </div>
  );

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

      {featuredResource && (
        <div style={styles.spotlightGrid}>
          <Card
            style={styles.spotlightCard}
            animate
            whileHover={styles.cardHover}
            onClick={() => window.open(featuredResource.link, "_blank", "noopener,noreferrer")}
          >
            <div style={styles.spotlightContent}>
              <div style={styles.spotlightBadge}>Nội dung nổi bật</div>
              <h2 style={styles.spotlightTitle}>{featuredResource.title}</h2>
              <p style={styles.spotlightDesc}>{featuredResource.desc}</p>
              <div style={styles.spotlightChips}>
                <span style={styles.metaChip}>
                  {featuredResource.type === "video" ? "Video" : featuredResource.type === "article" ? "Bài viết" : "Công cụ"}
                  {featuredResource.duration ? ` • ${featuredResource.duration} phút` : ""}
                </span>
                {featuredResource.source && <span style={styles.metaChip}>{featuredResource.source}</span>}
                {featuredResource.level && <span style={styles.metaChip}>{featuredResource.level}</span>}
              </div>
              <div style={styles.spotlightActions}>
                <button style={styles.primaryBtn} type="button">
                  Xem ngay
                </button>
                <button
                  style={{ ...styles.secondaryBtn, ...(savedResourceIds.includes(featuredResource.id) ? styles.secondaryBtnActive : {}) }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(featuredResource.id);
                  }}
                >
                  <Icon
                    name="bookmark"
                    size={16}
                    tone={savedResourceIds.includes(featuredResource.id) ? "amber" : "slate"}
                    background={false}
                  />
                  {savedResourceIds.includes(featuredResource.id) ? "Bỏ lưu" : "Lưu"}
                </button>
              </div>
            </div>
            <div style={styles.spotlightThumbWrap}>
              <img
                src={featuredResource.thumbnail}
                alt={featuredResource.title}
                style={styles.spotlightThumb}
                onError={handleImageError}
              />
            </div>
          </Card>
        </div>
      )}

      {loading ? (
        <div style={styles.grid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div style={styles.emptyState}>
          <Icon name="search" size={28} tone="slate" background={false} />
          <h3 style={styles.emptyTitle}>Không tìm thấy nội dung phù hợp</h3>
          <p style={styles.emptyDesc}>Thử điều chỉnh bộ lọc hoặc từ khóa để xem các nội dung khác.</p>
          <div style={styles.emptyActions}>
            <button type="button" style={styles.secondaryBtn} onClick={resetFilters}>
              Xoá bộ lọc
            </button>
          </div>
        </div>
      ) : (
      <div style={styles.grid}>
        {filteredResources.map((item, idx) => (
          <Card
            key={item.id}
            style={styles.card}
            animate
            custom={idx}
            whileHover={styles.cardHover}
            onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
            role="link"
            tabIndex={0}
          >
            <div style={styles.thumbWrapper}>
              <img src={item.thumbnail} alt={item.title} style={styles.thumb} onError={handleImageError} />
              <button
                type="button"
                aria-label={savedResourceIds.includes(item.id) ? "Bỏ lưu" : "Lưu"}
                title={savedResourceIds.includes(item.id) ? "Bỏ lưu" : "Lưu"}
                style={{
                  ...styles.bookmarkBtn,
                  ...(savedResourceIds.includes(item.id) ? styles.bookmarkBtnActive : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(item.id);
                }}
              >
                <Icon
                  name="bookmark"
                  size={18}
                  tone={savedResourceIds.includes(item.id) ? "amber" : "slate"}
                  background={false}
                />
              </button>
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
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={styles.linkText}
                onClick={(e) => e.stopPropagation()}
              >
                Xem chi tiết
                <Icon name="link" tone="brand" size={16} background={false} />
              </a>
            </div>
          </Card>
        ))}
      </div>
      )}
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
  spotlightGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    marginBottom: 18,
  },
  spotlightCard: {
    gridColumn: "1 / -1",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    alignItems: "stretch",
    minHeight: 220,
    cursor: "pointer",
  },
  spotlightContent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 10,
  },
  spotlightThumbWrap: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 220,
  },
  spotlightThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "saturate(1.05)",
  },
  spotlightBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(94,234,212,0.12)",
    color: "#67e8f9",
    fontWeight: 700,
    fontSize: 12,
    width: "fit-content",
  },
  spotlightTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.4,
    color: "var(--text-strong)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  spotlightDesc: {
    margin: "2px 0 4px",
    fontSize: 14,
    color: "var(--text-muted)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  spotlightChips: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  spotlightActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  primaryBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid transparent",
    background: "linear-gradient(120deg, #5eead4, #38bdf8)",
    color: "#0b1222",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "var(--text-strong)",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  secondaryBtnActive: {
    borderColor: "rgba(250,204,21,0.36)",
    backgroundColor: "rgba(250,204,21,0.12)",
  },
  card: {
    overflow: "hidden",
    cursor: "pointer",
    height: "100%",
    minHeight: 380,
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  },
  cardHover: { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.25)", borderColor: "rgba(94,234,212,0.35)" },
  thumbWrapper: {
    height: 180,
    position: "relative",
    backgroundColor: "var(--bg-primary)",
    overflow: "hidden",
    borderRadius: 16,
  },
  bookmarkBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(5,8,20,0.45)",
    backdropFilter: "blur(8px)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  bookmarkBtnActive: {
    backgroundColor: "rgba(250,204,21,0.14)",
    borderColor: "rgba(250,204,21,0.36)",
    boxShadow: "0 8px 20px rgba(250,204,21,0.25)",
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
    textDecoration: "none",
  },
  emptyState: {
    border: "1px dashed rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  emptyTitle: { margin: 0, fontSize: 18, color: "var(--text-strong)", fontWeight: 700, textAlign: "center" },
  emptyDesc: { margin: 0, fontSize: 14, color: "var(--text-muted)", textAlign: "center" },
  emptyActions: { marginTop: 4 },
  skeletonCard: {
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  skeletonThumb: { height: 140, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  skeletonLineWide: { height: 14, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", width: "80%" },
  skeletonLine: { height: 12, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", width: "100%" },
  skeletonChipRow: { display: "flex", gap: 8 },
  skeletonChip: { height: 10, width: 70, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  skeletonButton: { height: 14, width: 90, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 6 },
};
