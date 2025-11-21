// src/pages/TemplatesPage.jsx
import React, { useState } from "react";
import { apiCreateCategory } from "../api/categories"; // Tận dụng API cũ
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function TemplatesPage() {
  const [loading, setLoading] = useState(false);

  // Dữ liệu mẫu (Hardcode)
  const templates = [
    {
      id: "student",
      title: "Gói Sinh Viên",
      badgeIcon: "book",
      badgeTone: "brand",
      desc: "Các danh mục cơ bản cho đời sống sinh viên đi học xa nhà.",
      color: "#E0F2FE", // Xanh dương nhạt
      btnColor: "#0284C7",
      categories: [
        { name: "Trợ cấp gia đình", type: "income", icon: "wallet", tone: "green" },
        { name: "Học bổng", type: "income", icon: "award", tone: "amber" },
        { name: "Học phí", type: "expense", icon: "book", tone: "blue" },
        { name: "Tiền trọ", type: "expense", icon: "home", tone: "blue" },
        { name: "Ăn uống", type: "expense", icon: "bag", tone: "amber" },
        { name: "Sách vở & Photo", type: "expense", icon: "article", tone: "slate" },
        { name: "Đi lại/Xăng xe", type: "expense", icon: "spark", tone: "brand" },
      ]
    },
    {
      id: "worker",
      title: "Người Đi Làm",
      badgeIcon: "wallet",
      badgeTone: "green",
      desc: "Quản lý lương thưởng và các chi phí sinh hoạt, xã giao.",
      color: "#DCFCE7", // Xanh lá nhạt
      btnColor: "#16A34A",
      categories: [
        { name: "Lương cứng", type: "income", icon: "wallet", tone: "green" },
        { name: "Thưởng/Hoa hồng", type: "income", icon: "award", tone: "amber" },
        { name: "Đầu tư sinh lời", type: "income", icon: "chart", tone: "brand" },
        { name: "Tiền nhà/Điện nước", type: "expense", icon: "home", tone: "blue" },
        { name: "Siêu thị/Chợ", type: "expense", icon: "bag", tone: "amber" },
        { name: "Cafe/Gặp gỡ", type: "expense", icon: "spark", tone: "blue" },
        { name: "Shopping", type: "expense", icon: "bag", tone: "red" },
      ]
    },
    {
      id: "freelancer",
      title: "Freelancer",
      badgeIcon: "spark",
      badgeTone: "brand",
      desc: "Dành cho người làm tự do, thu nhập không cố định.",
      color: "#F3E8FF", // Tím nhạt
      btnColor: "#9333EA",
      categories: [
        { name: "Thù lao dự án", type: "income", icon: "award", tone: "brand" },
        { name: "Affiliate", type: "income", icon: "link", tone: "blue" },
        { name: "Thuê phần mềm", type: "expense", icon: "tool", tone: "brand" },
        { name: "Thiết bị/Gear", type: "expense", icon: "tool", tone: "amber" },
        { name: "Quảng cáo/Ads", type: "expense", icon: "chart", tone: "red" },
        { name: "Thuế/Bảo hiểm", type: "expense", icon: "article", tone: "slate" },
      ]
    }
  ];

  // Hàm xử lý "Batch Create" (Tạo hàng loạt)
  async function handleApply(template) {
    if (!window.confirm(`Bạn có chắc muốn thêm ${template.categories.length} danh mục của gói "${template.title}"?`)) return;
    
    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Dùng Promise.all để chạy song song cho nhanh
      // Catch lỗi riêng lẻ để nếu 1 cái trùng tên thì mấy cái kia vẫn chạy tiếp
      const promises = template.categories.map(cat => 
        apiCreateCategory(cat)
          .then(() => { successCount++; })
          .catch(() => { failCount++; }) // Thường lỗi do trùng tên
      );

      await Promise.all(promises);

      alert(`Đã thêm xong!\n- Thành công: ${successCount}\n- Bỏ qua (đã có): ${failCount}`);

    } catch (err) {
      alert("Có lỗi xảy ra: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={styles.head}>
        <div>
          <p style={styles.kicker}>Templates</p>
          <h1 style={styles.title}>Khởi tạo nhanh danh mục</h1>
          <p style={styles.lead}>Chọn gói phù hợp để thêm hàng loạt danh mục đã thiết kế sẵn.</p>
        </div>
        {loading && (
          <span style={{ color: "#bfdbfe", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name="spark" tone="brand" size={16} background={false} /> Đang khởi tạo...
          </span>
        )}
      </div>

      <div style={styles.grid}>
        {templates.map((tpl) => (
          <Card key={tpl.id} style={{ ...styles.card, borderColor: tpl.btnColor }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleRow}>
                <span style={styles.titleBadge}>
                  <Icon name={tpl.badgeIcon || "spark"} tone={tpl.badgeTone || "brand"} size={22} />
                </span>
                <h3 style={styles.cardTitle}>{tpl.title}</h3>
              </div>
              <p style={styles.cardDesc}>{tpl.desc}</p>
            </div>

            <div style={styles.previewList}>
              {tpl.categories.map((c, idx) => (
                <span key={idx} style={styles.tag}>
                  <span style={styles.tagIcon}>
                    <Icon
                      name={c.icon || (c.type === "income" ? "wallet" : "bag")}
                      tone={c.tone || (c.type === "income" ? "green" : "amber")}
                      size={18}
                    />
                  </span>
                  {c.name}
                </span>
              ))}
            </div>

            <Button
              style={{ borderColor: "transparent", backgroundColor: tpl.btnColor, color: "#0b1021" }}
              onClick={() => handleApply(tpl)}
              disabled={loading}
              fullWidth
            >
              {loading ? (
                "Đang thêm..."
              ) : (
                <>
                  <Icon name="arrowUpRight" tone="brand" size={16} background={false} />
                  Áp dụng gói này
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

const styles = {
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: { fontSize: 26, color: "var(--text-strong)", margin: "8px 0 4px", fontWeight: 800 },
  lead: { fontSize: 14, color: "var(--text-muted)", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: { marginBottom: 16 },
  cardTitleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  titleBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: "var(--text-strong)", margin: 0 },
  cardDesc: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 },
  previewList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(226,232,240,0.08)",
    padding: "6px 10px",
    borderRadius: 10,
    fontSize: 12,
    color: "var(--text-strong)",
    fontWeight: 600,
    border: "1px solid rgba(148,163,184,0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  tagIcon: { display: "grid", placeItems: "center" },
};
