// src/pages/TemplatesPage.jsx
import React, { useState } from "react";
import { apiCreateCategory } from "../api/categories"; // Tận dụng API cũ
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function TemplatesPage() {
  const [loading, setLoading] = useState(false);

  // Dữ liệu mẫu (Hardcode)
  const templates = [
    {
      id: "student",
      title: "Gói Sinh Viên 🎓",
      desc: "Các danh mục cơ bản cho đời sống sinh viên đi học xa nhà.",
      color: "#E0F2FE", // Xanh dương nhạt
      btnColor: "#0284C7",
      categories: [
        { name: "Trợ cấp gia đình", type: "income", icon: "👪" },
        { name: "Học bổng", type: "income", icon: "🏆" },
        { name: "Học phí", type: "expense", icon: "📚" },
        { name: "Tiền trọ", type: "expense", icon: "🏠" },
        { name: "Ăn uống", type: "expense", icon: "🍜" },
        { name: "Sách vở & Photo", type: "expense", icon: "🖨️" },
        { name: "Đi lại/Xăng xe", type: "expense", icon: "🛵" },
      ]
    },
    {
      id: "worker",
      title: "Người Đi Làm 💼",
      desc: "Quản lý lương thưởng và các chi phí sinh hoạt, xã giao.",
      color: "#DCFCE7", // Xanh lá nhạt
      btnColor: "#16A34A",
      categories: [
        { name: "Lương cứng", type: "income", icon: "💰" },
        { name: "Thưởng/Hoa hồng", type: "income", icon: "🎁" },
        { name: "Đầu tư sinh lời", type: "income", icon: "📈" },
        { name: "Tiền nhà/Điện nước", type: "expense", icon: "💡" },
        { name: "Siêu thị/Chợ", type: "expense", icon: "🛒" },
        { name: "Cafe/Gặp gỡ", type: "expense", icon: "☕" },
        { name: "Shopping", type: "expense", icon: "👗" },
      ]
    },
    {
      id: "freelancer",
      title: "Freelancer 💻",
      desc: "Dành cho người làm tự do, thu nhập không cố định.",
      color: "#F3E8FF", // Tím nhạt
      btnColor: "#9333EA",
      categories: [
        { name: "Thù lao dự án", type: "income", icon: "💎" },
        { name: "Affiliate", type: "income", icon: "🔗" },
        { name: "Thuê phần mềm", type: "expense", icon: "☁️" },
        { name: "Thiết bị/Gear", type: "expense", icon: "📷" },
        { name: "Quảng cáo/Ads", type: "expense", icon: "📢" },
        { name: "Thuế/Bảo hiểm", type: "expense", icon: "📝" },
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

      alert(`✅ Đã thêm xong!\n- Thành công: ${successCount}\n- Bỏ qua (đã có): ${failCount}`);

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
        {loading && <span style={{ color: "#bfdbfe", fontWeight: 700 }}>⏳ Đang khởi tạo...</span>}
      </div>

      <div style={styles.grid}>
        {templates.map((tpl) => (
          <Card key={tpl.id} style={{ ...styles.card, borderColor: tpl.btnColor }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{tpl.title}</h3>
              <p style={styles.cardDesc}>{tpl.desc}</p>
            </div>

            <div style={styles.previewList}>
              {tpl.categories.map((c, idx) => (
                <span key={idx} style={styles.tag}>
                  {c.icon} {c.name}
                </span>
              ))}
            </div>

            <Button
              style={{ borderColor: "transparent", backgroundColor: tpl.btnColor, color: "#0b1021" }}
              onClick={() => handleApply(tpl)}
              disabled={loading}
              fullWidth
            >
              {loading ? "Đang thêm..." : "Áp dụng gói này ✨"}
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
  cardTitle: { fontSize: 18, fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 },
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
  },
};
