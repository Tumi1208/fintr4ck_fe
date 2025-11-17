// src/pages/TemplatesPage.jsx
import React, { useState } from "react";
import { apiCreateCategory } from "../api/categories"; // Tận dụng API cũ

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
    <div style={{ padding: "24px 40px" }}>
      <h1 style={styles.pageTitle}>Mẫu Danh Mục (Templates) 📋</h1>
      <p style={styles.subTitle}>Chọn một gói phù hợp để khởi tạo nhanh các danh mục thu chi.</p>
      
      {loading && <p style={{color: '#2563EB', fontWeight: 'bold'}}>⏳ Đang khởi tạo dữ liệu...</p>}

      <div style={styles.grid}>
        {templates.map((tpl) => (
          <div key={tpl.id} style={{ ...styles.card, backgroundColor: tpl.color }}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{tpl.title}</h3>
                <p style={styles.cardDesc}>{tpl.desc}</p>
            </div>
            
            {/* Preview danh sách */}
            <div style={styles.previewList}>
                {tpl.categories.map((c, idx) => (
                    <span key={idx} style={styles.tag}>
                        {c.icon} {c.name}
                    </span>
                ))}
            </div>

            <button 
                style={{...styles.btn, backgroundColor: tpl.btnColor}} 
                onClick={() => handleApply(tpl)}
                disabled={loading}
            >
                {loading ? "Đang thêm..." : "Áp dụng gói này ✨"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 28, color: "#1E293B", marginBottom: 8, fontWeight: 800 },
  subTitle: { fontSize: 15, color: "#64748B", marginBottom: 32 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
  },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 8 },
  cardDesc: { fontSize: 14, color: "#475569", lineHeight: 1.5 },
  previewList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: 600,
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    border: "none",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    transition: "opacity 0.2s",
  }
};