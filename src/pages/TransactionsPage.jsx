// src/pages/TransactionsPage.jsx
import { useCallback, useEffect, useState } from "react";
import {
  apiGetTransactions,
  apiDeleteTransaction,
  apiDeleteAllTransactions,
  apiBulkDeleteTransactions,
  apiUpdateTransaction,
} from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Icon from "../components/ui/Icon";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categorySaving, setCategorySaving] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // State riêng cho ô tìm kiếm để xử lý độ trễ (Debounce)
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [filters, setFilters] = useState({
    type: "all",
    categoryId: "",
  });

  // 1. Lấy danh mục (Chạy 1 lần đầu)
  useEffect(() => {
    apiGetCategories().then((res) => {
      setCategories(Array.isArray(res) ? res : (res.categories || []));
    });
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const cleanFilters = {};
      
      if (filters.type !== "all") cleanFilters.type = filters.type;
      if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
      
      // Gửi searchTerm xuống backend để nó tự lo liệu (tìm trong note, amount, date...)
      if (searchTerm) cleanFilters.search = searchTerm;

      const data = await apiGetTransactions(cleanFilters);
      // Đảm bảo luôn nhận về mảng
      const list = Array.isArray(data) ? data : (data.transactions || []);
      setTransactions(list);
      setSelectedIds((prev) => prev.filter((id) => list.some((t) => t._id === id)));
    } catch (err) {
      console.error("Lỗi tải transaction:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  // 2. Logic tìm kiếm thông minh (Debounce)
  // Khi người dùng gõ, chờ 500ms rồi mới gọi API fetchTransactions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500); // Độ trễ 0.5s giúp không gọi API liên tục

    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    try {
      await apiDeleteTransaction(id);
      fetchTransactions(); // Tải lại sau khi xóa
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Xoá ${selectedIds.length} giao dịch đã chọn?`)) return;
    try {
      setBulkLoading(true);
      await apiBulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      alert("Lỗi khi xoá giao dịch đã chọn: " + err.message);
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm("Bạn chắc chắn muốn xoá TOÀN BỘ giao dịch? Thao tác này không thể hoàn tác.")) return;
    try {
      setBulkLoading(true);
      await apiDeleteAllTransactions();
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      alert("Lỗi khi xoá tất cả giao dịch: " + err.message);
    } finally {
      setBulkLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t._id));
    }
  }

  async function handleCategoryChange(id, categoryId) {
    setCategorySaving((prev) => ({ ...prev, [id]: true }));
    try {
      await apiUpdateTransaction(id, { categoryId: categoryId || null });
      setEditingCategoryId(null);
      fetchTransactions();
    } catch (err) {
      alert("Cập nhật danh mục thất bại: " + err.message);
    } finally {
      setCategorySaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  return (
    <PageTransition>
      <div style={styles.pageHead}>
        <div>
          <p style={styles.kicker}>Nhật ký giao dịch</p>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.lead}>Tìm kiếm, lọc và thao tác nhanh trên tất cả giao dịch.</p>
        </div>
        <Badge tone="info">{transactions.length} kết quả</Badge>
      </div>

      <Card animate custom={0} style={{ marginBottom: 18 }}>
        <div style={styles.filterBar}>
          <select
            style={styles.select}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">Tất cả</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>

          <select
            style={styles.select}
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }}>
            <InputField
              placeholder="Tìm ngày, danh mục, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              rightSlot={
                searchTerm ? (
                  <Icon name="close" tone="slate" size={14} background={false} />
                ) : (
                  <Icon name="search" tone="slate" size={14} background={false} />
                )
              }
              onRightSlotClick={searchTerm ? () => setSearchTerm("") : undefined}
            />
          </div>

          <Button variant="ghost" style={{ padding: "12px 14px" }} onClick={fetchTransactions} title="Tải lại">
            <Icon name="refresh" tone="blue" size={18} background={false} />
          </Button>
        </div>
      </Card>

      <Card animate custom={1} style={{ position: "relative" }}>
        <div style={styles.tableHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", fontSize: 14 }}>
            <Badge tone="info">{transactions.length} giao dịch</Badge>
            <span style={{ color: "var(--text-muted)" }}>Danh sách sau lọc</span>
          </div>
          {transactions.length > 0 && (
            <Button
              variant="danger"
              style={{ padding: "10px 14px", opacity: bulkLoading ? 0.6 : 1 }}
              onClick={handleDeleteAll}
              disabled={bulkLoading}
            >
              <Icon name="trash" tone="red" size={16} background={false} />
              Xoá tất cả
            </Button>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div style={styles.bulkToolbar}>
            <div style={styles.bulkInfo}>
              <Icon name="check" tone="blue" size={16} background={false} />
              <span>
                Đã chọn <strong>{selectedIds.length}</strong> giao dịch
              </span>
            </div>
            <div style={styles.bulkActions}>
              <Button
                variant="ghost"
                style={{ padding: "10px 14px", opacity: bulkLoading ? 0.6 : 1 }}
                onClick={toggleSelectAll}
                disabled={bulkLoading}
              >
                <Icon name={allSelected ? "close" : "check"} tone="slate" size={16} background={false} />
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
              <Button
                variant="ghost"
                style={{ padding: "10px 14px", opacity: bulkLoading ? 0.6 : 1 }}
                onClick={() => setSelectedIds([])}
                disabled={bulkLoading}
              >
                <Icon name="close" tone="slate" size={16} background={false} />
                Bỏ chọn
              </Button>
              <Button
                variant="danger"
                style={{ padding: "10px 14px", opacity: bulkLoading ? 0.6 : 1 }}
                onClick={handleDeleteSelected}
                disabled={bulkLoading}
              >
                <Icon name="trash" tone="red" size={16} background={false} />
                Xoá
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Đang tìm kiếm...</p>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ marginBottom: 10 }}>
              <Icon name="inbox" tone="slate" size={44} />
            </div>
            Không tìm thấy giao dịch nào phù hợp.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th style={{ textAlign: "left", paddingLeft: 18 }}>Ngày</th>
                <th style={{ textAlign: "left" }}>Danh mục</th>
                <th style={{ textAlign: "left" }}>Loại</th>
                <th style={{ textAlign: "left" }}>Ghi chú</th>
                <th style={{ textAlign: "right" }}>Số tiền</th>
                <th style={{ textAlign: "center", paddingRight: 18 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t._id}
                  style={styles.tr}
                  onMouseEnter={() => setEditingCategoryId(t._id)}
                  onMouseLeave={() => setEditingCategoryId((prev) => (prev === t._id ? null : prev))}
                >
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={selectedIds.includes(t._id)} onChange={() => toggleSelect(t._id)} />
                  </td>
                  <td style={{ paddingLeft: 18, color: "var(--text-strong)" }}>
                    {new Date(t.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {editingCategoryId === t._id ? (
                      <div style={styles.catSelectWrap}>
                        <div style={styles.catSelectDisplay}>
                          <span style={styles.catBadgeIcon}>{renderTxnCategoryIcon(t.category)}</span>
                          <span style={styles.catLabel}>{renderCategoryLabel(t.category)}</span>
                          {categorySaving[t._id] && <span style={styles.saveHint}>Đang lưu...</span>}
                          <span style={styles.caret}>▾</span>
                        </div>
                        <select
                          style={styles.catSelectNative}
                          value={t.category?._id || ""}
                          onChange={(e) => handleCategoryChange(t._id, e.target.value)}
                          disabled={categorySaving[t._id]}
                          onBlur={() => setEditingCategoryId(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setEditingCategoryId(null);
                          }}
                        >
                          <option value="">Không phân loại</option>
                          {categories
                            .filter((c) => c.type === t.type)
                            .map((c) => (
                              <option key={c._id} value={c._id}>
                                {renderCategoryLabel(c)}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        type="button"
                        style={styles.categoryChip}
                        onClick={() => setEditingCategoryId(t._id)}
                        title="Chỉnh sửa danh mục"
                      >
                        <span style={styles.catBadgeIcon}>{renderTxnCategoryIcon(t.category)}</span>
                        <span style={styles.catLabel}>{renderCategoryLabel(t.category)}</span>
                        <Icon name="edit" tone="slate" size={14} background={false} />
                      </button>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        ...styles.tag,
                        backgroundColor:
                          t.type === "income" ? "rgba(34,197,94,0.16)" : "rgba(248,113,113,0.16)",
                        color: t.type === "income" ? "#bbf7d0" : "#fecdd3",
                        borderColor: t.type === "income" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                      }}
                    >
                      {t.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{t.note}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color: t.type === "income" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString("en-US")}
                  </td>
                  <td style={{ textAlign: "center", paddingRight: 18 }}>
                    <Button variant="danger" style={{ padding: "8px 12px" }} onClick={() => handleDelete(t._id)}>
                      <Icon name="trash" tone="red" size={18} background={false} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageTransition>
  );
}

const builtInCategoryIcons = new Set([
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
  "check",
  "play",
  "arrowLeft",
  "refresh",
  "search",
  "close",
  "inbox",
  "book",
  "edit",
  "trash",
  "dashboard",
  "receipt",
  "puzzle",
  "flag",
  "checkBadge",
  "clipboard",
  "gear",
]);

function renderTxnCategoryIcon(category) {
  const tone = category ? (category.type === "income" ? "green" : "amber") : "slate";
  const iconVal = category?.icon && category.icon.trim();

  if (iconVal && builtInCategoryIcons.has(iconVal)) {
    return <Icon name={iconVal} tone={tone} size={18} background={false} />;
  }

  if (iconVal) {
    return <span style={styles.customCatIcon}>{iconVal}</span>;
  }

  return <Icon name={category && category.type === "income" ? "arrowUpRight" : "arrowDown"} tone={tone} size={18} background={false} />;
}

function renderCategoryLabel(category) {
  if (!category) return "Không phân loại";
  const iconVal = category.icon && category.icon.trim();
  return `${iconVal ? `${iconVal} · ` : ""}${category.name}`;
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
  filterBar: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, alignItems: "center" },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.05)",
    color: "var(--text-strong)",
    fontSize: 14,
    outline: "none",
  },
  catSelectWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 220,
  },
  catSelectDisplay: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 16,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "var(--text-strong)",
    fontSize: 14,
    width: "100%",
    cursor: "pointer",
  },
  catLabel: { flex: 1 },
  catSelectNative: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  saveHint: { color: "#fbbf24", fontSize: 12, fontWeight: 700 },
  caret: { color: "var(--text-muted)", fontSize: 12, marginLeft: 6 },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "var(--text-strong)",
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: "1px solid rgba(148,163,184,0.12)",
  },
  bulkToolbar: {
    position: "sticky",
    top: 10,
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 16px",
    marginBottom: 12,
    borderRadius: 999,
    background: "rgba(15,23,42,0.88)",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },
  bulkInfo: { display: "flex", alignItems: "center", gap: 10, color: "var(--text-strong)", fontWeight: 700 },
  bulkActions: { display: "flex", alignItems: "center", gap: 10 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14, color: "var(--text-strong)" },
  tr: { borderBottom: "1px solid rgba(148,163,184,0.12)", height: 60 },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid transparent",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  catBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    backgroundColor: "rgba(226,232,240,0.06)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(148,163,184,0.18)",
    fontSize: 13,
    color: "var(--text-strong)",
    fontWeight: 600,
  },
  catBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(140deg, rgba(124,58,237,0.16), rgba(14,165,233,0.12))",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
  },
  customCatIcon: { fontSize: 13, fontWeight: 700 },
};
