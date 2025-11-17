// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import {
  apiGetCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
} from "../api/categories";

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
      setCategories(data.categories || []);
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
      <h1 style={styles.pageTitle}>Manage Categories</h1>

      <div style={styles.headerRow}>
        <button style={styles.primaryBtn} onClick={openCreateModal}>
          Add New Category
        </button>
      </div>

      <div style={styles.gridTwo}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Income</h2>
          <div style={styles.catGrid}>
            {incomeCats.map((c) => (
              <CategoryCard
                key={c._id}
                category={c}
                onEdit={() => openEditModal(c)}
                onDelete={() => handleDelete(c)}
              />
            ))}

            {incomeCats.length === 0 && (
              <p style={styles.emptyText}>Chưa có danh mục thu nhập</p>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Expense</h2>
          <div style={styles.catGrid}>
            {expenseCats.map((c) => (
              <CategoryCard
                key={c._id}
                category={c}
                onEdit={() => openEditModal(c)}
                onDelete={() => handleDelete(c)}
              />
            ))}

            {expenseCats.length === 0 && (
              <p style={styles.emptyText}>Chưa có danh mục chi tiêu</p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>
              {editing ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSave}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Type</label>
                <select
                  style={styles.select}
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Icon (optional)</label>
                <input
                  style={styles.input}
                  placeholder="VD: 💰, 🍔, 🏠"
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value }))
                  }
                />
              </div>

              {error && <div style={styles.errorText}>{error}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  Save
                </button>
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
  pageTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: "#1E293B",
  },
  headerRow: {
    marginBottom: 16,
  },
  primaryBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #CBD5E1",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 13,
    cursor: "pointer",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    boxShadow:
      "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
  },
  cardTitle: {
    margin: 0,
    marginBottom: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  catCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    minHeight: 96,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  catName: {
    fontSize: 14,
    color: "#0F172A",
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
    color: "#64748B",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  modalCard: {
    width: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    boxShadow:
      "0 10px 15px -3px rgb(15 23 42 / 0.2), 0 4px 6px -4px rgb(15 23 42 / 0.15)",
  },
  modalTitle: {
    margin: 0,
    marginBottom: 16,
    fontSize: 18,
    color: "#1E293B",
  },
  field: {
    marginBottom: 12,
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 13,
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 13,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginBottom: 8,
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    marginLeft: 4,
  },
};
