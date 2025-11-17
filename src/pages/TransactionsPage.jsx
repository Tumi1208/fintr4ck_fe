// src/pages/TransactionsPage.jsx
import { useEffect, useState } from "react";
import {
  apiGetTransactions,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
} from "../api/transactions";
import { apiGetCategories } from "../api/categories";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    categoryId: "",
    from: "",
    to: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    categoryId: "",
    note: "",
    amount: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [cats] = await Promise.all([apiGetCategories()]);
        setCategories(cats.categories || []);
        await fetchTransactions();
      } catch (err) {
        console.error(err);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== "all") params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.search) params.search = filters.search;

      const data = await apiGetTransactions(params);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditing(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      type: "expense",
      categoryId: "",
      note: "",
      amount: "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(tx) {
    setEditing(tx);
    setForm({
      date: new Date(tx.date).toISOString().slice(0, 10),
      type: tx.type,
      categoryId: tx.category?._id || "",
      note: tx.note || "",
      amount: tx.amount.toString(),
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setError("");

      if (!form.date || !form.amount) {
        setError("Ngày và số tiền là bắt buộc");
        return;
      }

      const payload = {
        type: form.type,
        date: form.date,
        note: form.note,
        amount: Number(form.amount),
        categoryId: form.categoryId || undefined,
      };

      if (editing) {
        await apiUpdateTransaction(editing._id, payload);
      } else {
        await apiCreateTransaction(payload);
      }

      setModalOpen(false);
      await fetchTransactions();
    } catch (err) {
      setError(err.message || "Không thể lưu giao dịch");
    }
  }

  async function handleDelete(tx) {
    if (!window.confirm("Bạn có chắc muốn xoá giao dịch này?")) return;
    try {
      await apiDeleteTransaction(tx._id);
      await fetchTransactions();
    } catch (err) {
      alert(err.message || "Không thể xoá");
    }
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Transaction History</h1>

      <div style={styles.card}>
        <div style={styles.filterRow}>
          <select
            style={styles.select}
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value }))
            }
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            style={styles.select}
            value={filters.categoryId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
          />

          <input
            style={styles.input}
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((f) => ({ ...f, to: e.target.value }))
            }
          />

          <input
            style={styles.input}
            placeholder="Search..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />

          <button style={styles.secondaryBtn} onClick={fetchTransactions}>
            Apply
          </button>

          <button style={styles.primaryBtn} onClick={openCreateModal}>
            Add New
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Note</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>
                    {new Date(t.date).toLocaleDateString("en-CA")}
                  </td>
                  <td>{t.category?.name || "-"}</td>
                  <td
                    style={{
                      color: t.type === "income" ? "#10B981" : "#EF4444",
                    }}
                  >
                    {t.type}
                  </td>
                  <td>{t.note || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {t.type === "expense" ? "-" : "+"}${" "}
                    {t.amount.toLocaleString("en-US")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      style={styles.iconBtn}
                      onClick={() => openEditModal(t)}
                    >
                      ✏️
                    </button>
                    <button
                      style={styles.iconBtn}
                      onClick={() => handleDelete(t)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                    Không có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>
              {editing ? "Update Transaction" : "Add New Transaction"}
            </h2>

            <form onSubmit={handleSave}>
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
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
              </div>

              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- None --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Amount</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Note</label>
                <input
                  style={styles.input}
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
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
                  {editing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    boxShadow:
      "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
  },
  filterRow: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  select: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 13,
  },
  input: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 13,
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    marginLeft: 4,
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
    width: 460,
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
  formRow: {
    display: "flex",
    gap: 12,
  },
  field: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginBottom: 8,
  },
};
