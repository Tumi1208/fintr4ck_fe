// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import {
  apiGetCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
} from "../api/categories";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import InputField from "../components/ui/InputField";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");

  return (
    <div>
      <div style={styles.pageHead}>
        <div>
          <p style={styles.kicker}>Danh mục</p>
          <h1 style={styles.title}>Categories</h1>
          <p style={styles.lead}>Tổ chức thu/chi rõ ràng để báo cáo mượt mà.</p>
        </div>
        <Button onClick={openCreateModal}>Thêm danh mục</Button>
      </div>

      <div style={styles.gridTwo}>
        <Card title="Income categories" style={styles.card}>
          <div style={styles.catGrid}>
            {incomeCats.map((c) => (
              <CategoryCard
                key={c._id}
                category={c}
                onEdit={() => openEditModal(c)}
                onDelete={() => handleDelete(c)}
              />
            ))}
            {incomeCats.length === 0 && <p style={styles.emptyText}>Chưa có danh mục thu nhập</p>}
          </div>
        </Card>

        <Card title="Expense categories" style={styles.card}>
          <div style={styles.catGrid}>
            {expenseCats.map((c) => (
              <CategoryCard
                key={c._id}
                category={c}
                onEdit={() => openEditModal(c)}
                onDelete={() => handleDelete(c)}
              />
            ))}
            {expenseCats.length === 0 && <p style={styles.emptyText}>Chưa có danh mục chi tiêu</p>}
          </div>
        </Card>
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
                placeholder="VD: 💰, 🍔, 🏠"
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
    </div>
  );
}

function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div style={styles.catCard}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={styles.catIcon}>
          {category.icon || (category.type === "income" ? "💰" : "💸")}
        </div>
        <div>
          <div style={styles.catName}>{category.name}</div>
          <div
            style={{
              ...styles.tag,
              backgroundColor:
                category.type === "income" ? "#DCFCE7" : "#FEE2E2",
              color: category.type === "income" ? "#16A34A" : "#DC2626",
            }}
          >
            {category.type}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", textAlign: "right" }}>
        <button style={styles.iconBtn} onClick={onEdit}>
          ✏️
        </button>
        <button style={styles.iconBtn} onClick={onDelete}>
          🗑️
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: { margin: "8px 0 4px", color: "var(--text-strong)", fontSize: 26, letterSpacing: -0.3 },
  lead: { margin: 0, color: "var(--text-muted)" },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    minHeight: 280,
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  catCard: {
    backgroundColor: "rgba(226,232,240,0.06)",
    borderRadius: 16,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    minHeight: 96,
    border: "1px solid rgba(148,163,184,0.15)",
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(14,165,233,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  catName: {
    fontSize: 14,
    color: "var(--text-strong)",
    fontWeight: 600,
  },
  tag: {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
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
    backgroundColor: "rgba(15,23,42,0.9)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 22px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "var(--text-strong)",
  },
  modalTitle: {
    margin: 0,
    marginBottom: 16,
    fontSize: 18,
    color: "var(--text-strong)",
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
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    marginLeft: 4,
    color: "var(--text-muted)",
  },
};
