// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import {
  apiGetCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
} from "../api/categories";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Icon from "../components/ui/Icon";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    icon: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await apiGetCategories();
      // data chính là mảng danh sách, lấy trực tiếp luôn
      setCategories(Array.isArray(data) ? data : []); 
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  }

  function openCreateModal() {
    setEditing(null);
    setForm({
      name: "",
      type: "expense",
      icon: "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(cat) {
    setEditing(cat);
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setError("");
      if (!form.name) {
        setError("Tên danh mục là bắt buộc");
        return;
      }

      if (editing) {
        await apiUpdateCategory(editing._id, form);
      } else {
        await apiCreateCategory(form);
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setError(err.message || "Không thể lưu danh mục");
    }
  }

  async function handleDelete(cat) {
    if (
      !window.confirm(
        `Xoá danh mục "${cat.name}"? Các giao dịch sẽ mất thông tin danh mục này.`
      )
    )
      return;

    try {
      await apiDeleteCategory(cat._id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Không thể xoá danh mục");
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const hasSelection = selectedIds.length > 0;

  async function handleDeleteSelected() {
    if (!hasSelection) return;
    if (!window.confirm(`Xoá ${selectedIds.length} danh mục đã chọn?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => apiDeleteCategory(id).catch(() => null)));
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Không thể xoá danh mục đã chọn");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (categories.length === 0) return;
    if (
      !window.confirm(
        "Bạn chắc chắn xoá toàn bộ danh mục? Các giao dịch sẽ bị mất liên kết danh mục."
      )
    )
      return;
    setBulkLoading(true);
    try {
      await Promise.all(categories.map((c) => apiDeleteCategory(c._id).catch(() => null)));
      await fetchCategories();
    } catch (err) {
      alert(err.message || "Không thể xoá toàn bộ danh mục");
    } finally {
      setBulkLoading(false);
    }
  }

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");
  const stats = [
    { label: "Tổng danh mục", value: categories.length, hint: "Thu & chi đang sử dụng" },
    { label: "Thu nhập", value: incomeCats.length, hint: "Kênh kiếm tiền của bạn" },
    { label: "Chi tiêu", value: expenseCats.length, hint: "Nhóm chi chính" },
    { label: "Đã chọn", value: selectedIds.length, hint: "Sẵn sàng xoá/biến đổi" },
  ];

  return (
    <PageTransition style={styles.pageShell}>
      <div style={styles.bgBlurOne} />
      <div style={styles.bgBlurTwo} />
      <div style={styles.gridLines} />

      <div style={styles.content}>
        <div style={styles.pageHead}>
          <div>
            <p style={styles.kicker}>Danh mục</p>
            <h1 style={styles.title}>Categories</h1>
            <p style={styles.lead}>Tổ chức thu/chi rõ ràng để báo cáo mượt mà.</p>
          </div>
          <div style={styles.headActions}>
            <Button variant="subtle" onClick={handleDeleteSelected} disabled={!hasSelection || bulkLoading}>
              <Icon name="trash" tone="red" size={16} background={false} /> Xoá đã chọn
            </Button>
            <Button variant="ghost" onClick={handleDeleteAll} disabled={categories.length === 0 || bulkLoading}>
              <Icon name="trash" tone="red" size={16} /> Xoá toàn bộ
            </Button>
            <Button onClick={openCreateModal}>
              <Icon name="plus" tone="slate" size={16} background={false} /> Thêm danh mục
            </Button>
          </div>
        </div>

        <div style={styles.statsRow}>
          {stats.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statHint}>{s.hint}</div>
            </div>
          ))}
        </div>

        <div style={styles.gridTwo}>
          <Card animate custom={0} title="Income categories" style={{ ...styles.card, ...styles.cardNeon }}>
            <div style={styles.catGrid}>
              {incomeCats.map((c) => (
                <CategoryCard
                  key={c._id}
                  category={c}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDelete(c)}
                  selected={selectedIds.includes(c._id)}
                  onToggleSelect={() => toggleSelect(c._id)}
                />
              ))}
              {incomeCats.length === 0 && <p style={styles.emptyText}>Chưa có danh mục thu nhập</p>}
            </div>
          </Card>

          <Card animate custom={1} title="Expense categories" style={{ ...styles.card, ...styles.cardNeonWarm }}>
            <div style={styles.catGrid}>
              {expenseCats.map((c) => (
                <CategoryCard
                  key={c._id}
                  category={c}
                  onEdit={() => openEditModal(c)}
                  onDelete={() => handleDelete(c)}
                  selected={selectedIds.includes(c._id)}
                  onToggleSelect={() => toggleSelect(c._id)}
                />
              ))}
              {expenseCats.length === 0 && <p style={styles.emptyText}>Chưa có danh mục chi tiêu</p>}
            </div>
          </Card>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>{editing ? "Sửa danh mục" : "Tạo danh mục"}</h2>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <InputField
                label="Tên"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />

              <label style={styles.label}>Loại</label>
              <select
                style={styles.select}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <InputField
                label="Icon (tùy chọn)"
                placeholder="VD: ký hiệu riêng như $, A..."
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              />

              {error && <div style={styles.errorText}>{error}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button variant="subtle" onClick={() => setModalOpen(false)} type="button">
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

function CategoryCard({ category, onEdit, onDelete, selected, onToggleSelect }) {
  return (
    <div style={{ ...styles.catCard, ...(selected ? styles.catCardSelected : {}) }}>
      <div style={styles.catCardTop}>
        <button style={{ ...styles.check, ...(selected ? styles.checkActive : {}) }} onClick={onToggleSelect} aria-label="Chọn danh mục">
          {selected && <Icon name="check" tone="green" size={14} background={false} />}
        </button>
        <div style={{ ...styles.catIcon, ...(category.type === "income" ? styles.catIconPositive : styles.catIconNegative) }}>
          {renderCategoryIcon(category)}
        </div>
        <div>
          <div style={styles.catName}>{category.name}</div>
          <div
            style={{
              ...styles.tag,
              ...(category.type === "income" ? styles.tagIncome : styles.tagExpense),
            }}
          >
            {category.type === "income" ? "Thu nhập" : "Chi tiêu"}
          </div>
        </div>
      </div>

      <div style={styles.cardActions}>
        <button style={styles.iconBtn} onClick={onEdit} aria-label="Sửa danh mục">
          <Icon name="edit" tone="blue" size={18} background={false} />
        </button>
        <button style={{ ...styles.iconBtn, ...styles.iconBtnDanger }} onClick={onDelete} aria-label="Xoá danh mục">
          <Icon name="trash" tone="red" size={18} background={false} />
        </button>
      </div>
    </div>
  );
}

const builtInIconNames = new Set([
  "wallet",
  "award",
  "chart",
  "bag",
  "spark",
  "home",
  "article",
  "tool",
  "link",
  "arrowUpRight",
  "arrowDown",
]);

function renderCategoryIcon(category) {
  const tone = category.type === "income" ? "green" : "amber";
  const iconVal = category.icon && category.icon.trim();

  if (iconVal && builtInIconNames.has(iconVal)) {
    return <Icon name={iconVal} tone={tone} size={20} background={false} />;
  }

  if (iconVal) {
    // Nếu người dùng nhập ký hiệu riêng, giữ nguyên để không phá dữ liệu cũ
    return <span style={styles.customIcon}>{iconVal}</span>;
  }

  return <Icon name={category.type === "income" ? "arrowUpRight" : "arrowDown"} tone={tone} size={20} background={false} />;
}

const styles = {
  pageShell: {
    position: "relative",
    minHeight: "100%",
    padding: "12px 12px 24px",
    overflow: "hidden",
  },
  content: { position: "relative", zIndex: 1 },
  bgBlurOne: {
    position: "absolute",
    inset: "-120px -140px auto auto",
    height: 260,
    width: 320,
    background: "radial-gradient(circle, rgba(34,197,94,0.18), transparent 60%)",
    filter: "blur(60px)",
    opacity: 0.9,
  },
  bgBlurTwo: {
    position: "absolute",
    inset: "auto auto -140px -160px",
    height: 280,
    width: 360,
    background: "radial-gradient(circle, rgba(14,165,233,0.18), transparent 55%)",
    filter: "blur(60px)",
    opacity: 0.9,
  },
  gridLines: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    maskImage: "radial-gradient(circle at center, black 55%, transparent 75%)",
    opacity: 0.35,
  },
  pageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  kicker: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  title: { margin: "8px 0 4px", color: "var(--text-strong)", fontSize: 28, letterSpacing: -0.4 },
  lead: { margin: 0, color: "var(--text-muted)", maxWidth: 520 },
  headActions: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
  },
  statLabel: { color: "var(--text-muted)", fontSize: 12, marginBottom: 4 },
  statValue: { color: "var(--text-strong)", fontSize: 22, fontWeight: 800, letterSpacing: -0.3 },
  statHint: { color: "var(--text-muted)", fontSize: 12 },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    minHeight: 280,
  },
  cardNeon: {
    background: "linear-gradient(180deg, rgba(15,23,42,0.55), rgba(15,23,42,0.85))",
    border: "1px solid rgba(74,222,128,0.25)",
    boxShadow: "0 20px 60px rgba(22,163,74,0.15)",
  },
  cardNeonWarm: {
    background: "linear-gradient(180deg, rgba(15,23,42,0.55), rgba(15,23,42,0.85))",
    border: "1px solid rgba(248,113,113,0.2)",
    boxShadow: "0 20px 60px rgba(248,113,113,0.12)",
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  catCard: {
    background: "linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    borderRadius: 16,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    minHeight: 96,
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease",
  },
  catCardSelected: {
    border: "1px solid rgba(34,197,94,0.55)",
    boxShadow: "0 18px 44px rgba(34,197,94,0.2)",
    transform: "translateY(-2px)",
  },
  catCardTop: { display: "flex", alignItems: "center", marginBottom: 8, gap: 8 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.3)",
    background: "rgba(226,232,240,0.04)",
    display: "grid",
    placeItems: "center",
    marginRight: 8,
    cursor: "pointer",
    color: "var(--text-muted)",
  },
  checkActive: {
    border: "1px solid rgba(34,197,94,0.6)",
    background: "rgba(34,197,94,0.16)",
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.28)",
    display: "grid",
    placeItems: "center",
    marginRight: 4,
    boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
  },
  catIconPositive: {
    background: "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(59,130,246,0.14))",
  },
  catIconNegative: {
    background: "linear-gradient(135deg, rgba(248,113,113,0.2), rgba(234,179,8,0.18))",
  },
  customIcon: { fontSize: 16, color: "var(--text-strong)", fontWeight: 700 },
  catName: {
    fontSize: 14,
    color: "var(--text-strong)",
    fontWeight: 700,
    letterSpacing: -0.2,
  },
  tag: {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid transparent",
  },
  tagIncome: {
    backgroundColor: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    borderColor: "rgba(34,197,94,0.35)",
  },
  tagExpense: {
    backgroundColor: "rgba(248,113,113,0.14)",
    color: "#f87171",
    borderColor: "rgba(248,113,113,0.35)",
  },
  emptyText: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  modalCard: {
    width: 380,
    background: "linear-gradient(160deg, rgba(15,23,42,0.94), rgba(15,23,42,0.82))",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 22px 60px rgba(0,0,0,0.55)",
    border: "1px solid rgba(148,163,184,0.3)",
    color: "var(--text-strong)",
  },
  modalTitle: {
    margin: 0,
    marginBottom: 18,
    fontSize: 20,
    color: "var(--text-strong)",
    letterSpacing: -0.2,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "var(--text-muted)",
    marginBottom: 4,
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(148,163,184,0.25)",
    backgroundColor: "rgba(226,232,240,0.06)",
    color: "var(--text-strong)",
  },
  errorText: {
    fontSize: 13,
    color: "#fca5a5",
    marginBottom: 4,
  },
  iconBtn: {
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.06)",
    cursor: "pointer",
    fontSize: 16,
    marginLeft: 6,
    color: "var(--text-strong)",
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  iconBtnDanger: {
    borderColor: "rgba(248,113,113,0.35)",
  },
  cardActions: { marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 6 },
};
