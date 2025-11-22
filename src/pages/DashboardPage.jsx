// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGetSummary, apiCreateTransaction, apiGetTransactions } from "../api/transactions";
import { apiGetCategories } from "../api/categories";
import { apiGetExpenseBreakdown } from "../api/reports";
import { apiGetMe } from "../api/auth";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import PageTransition from "../components/PageTransition";
import ModalDialog from "../components/ModalDialog";
import { useDialog } from "../hooks/useDialog";
import { globalStyles } from "../utils/animations";
import { getBudgets, removeBudget, saveBudget } from "../utils/budgets";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DAY = 24 * 60 * 60 * 1000;
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getPresetRange(preset) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (preset === "lastMonth") {
    const start = startOfDay(new Date(y, m - 1, 1));
    const end = endOfDay(new Date(y, m, 0));
    return { start, end };
  }
  if (preset === "thisYear") {
    const start = startOfDay(new Date(y, 0, 1));
    const end = endOfDay(new Date(y, 11, 31));
    return { start, end };
  }
  if (preset === "last3Months") {
    const start = startOfDay(new Date(y, m - 2, 1));
    const end = endOfDay(new Date(y, m + 1, 0));
    return { start, end };
  }
  // default thisMonth
  const start = startOfDay(new Date(y, m, 1));
  const end = endOfDay(new Date(y, m + 1, 0));
  return { start, end };
}

function getPreviousRange(range) {
  if (!range?.start || !range?.end) return null;
  const start = startOfDay(range.start);
  const end = endOfDay(range.end);
  const span = end.getTime() - start.getTime() + DAY;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - span + DAY);
  return { start: startOfDay(prevStart), end: endOfDay(prevEnd) };
}

function filterTransactionsByRange(transactions, range) {
  if (!range?.start || !range?.end) return transactions;
  const start = startOfDay(range.start).getTime();
  const end = endOfDay(range.end).getTime();
  return transactions.filter((t) => {
    const d = new Date(t.date).getTime();
    if (Number.isNaN(d)) return false;
    return d >= start && d <= end;
  });
}

function summarize(transactions = []) {
  let income = 0;
  let expense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount || 0;
    else expense += t.amount || 0;
  });
  const net = income - expense;
  const savingRate = income ? ((income - expense) / income) * 100 : 0;
  return { income, expense, net, savingRate };
}

function aggregateStatsForRange(allTransactions, range) {
  const currentList = filterTransactionsByRange(allTransactions, range);
  const previousRange = getPreviousRange(range);
  const prevList = filterTransactionsByRange(allTransactions, previousRange);
  return {
    current: summarize(currentList),
    previous: summarize(prevList),
  };
}

function buildDelta(current, previous, { invert = false } = {}) {
  const base = Math.abs(previous);
  let deltaPercent = 0;
  if (base === 0) {
    deltaPercent = current > 0 ? 100 : 0;
  } else {
    deltaPercent = ((current - previous) / base) * 100;
  }

  const isUp = deltaPercent >= 0;
  const isGood = invert ? !isUp : isUp;
  const icon = isUp ? "arrowUpRight" : "arrowDown";

  return { deltaPercent, isUp, isGood, icon };
}

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;
const formatPercent = (value) => `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;

function formatCategoryName(name = "") {
  const normalized = name
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
  const mapping = {
    shopping: "Shopping",
    food: "Food",
    transport: "Transport",
    entertainment: "Entertainment",
    "luong cung": "Lương cứng",
    "luong co dinh": "Lương cố định",
  };
  if (mapping[normalized]) return mapping[normalized];
  return name
    .toString()
    .split(/\s+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}

export default function DashboardPage() {
  const quotes = [
    { author: "Warren Buffett", text: "Đừng tiết kiệm sau khi tiêu, hãy tiêu sau khi tiết kiệm." },
    { author: "Benjamin Franklin", text: "Những khoản chi nhỏ mới khiến con tàu chìm." },
    { author: "Peter Drucker", text: "Điều không đo lường được, không thể quản lý được." },
    { author: "Charlie Munger", text: "Hãy sống dưới khả năng của bạn và đầu tư phần chênh lệch." },
    { author: "Suze Orman", text: "Mỗi đồng bạn không chi tiêu là một đồng bạn vừa kiếm thêm." },
    { author: "Howard Marks", text: "Rủi ro không nằm ở những gì bạn biết, mà ở những gì bạn nghĩ là chắc chắn." },
    { author: "Morgan Housel", text: "Tài sản thật là khả năng sống tốt hơn người khác mà không cần khoe." },
    { author: "Naval Ravikant", text: "Hãy kiếm tiền khi thức và cả khi ngủ, nếu không bạn sẽ làm việc cho đến chết." },
    { author: "JL Collins", text: "Đơn giản hóa và tự động hóa để tiền của bạn tự làm việc." },
    { author: "John Bogle", text: "Đừng tìm kim cương, hãy sở hữu cả mỏ kim cương." },
    { author: "Vicki Robin", text: "Mỗi khoản chi là thời gian cuộc đời bạn đang bán ra." },
    { author: "Lời nhắc", text: "Đặt cảnh báo khi chi vượt 3.000.000đ/tuần để giữ nhịp chi tiêu." },
    { author: "Lời nhắc", text: "Trước khi mua, hỏi: liệu tôi có thể tìm phiên bản rẻ hơn 20%?" },
    { author: "Lời nhắc", text: "Kiểm tra sao kê 5 phút mỗi ngày để phát hiện chi bất thường." },
    { author: "Lời nhắc", text: "Chốt ngân sách tuần vào chủ nhật, đi chợ theo danh sách." },
    { author: "Lời nhắc", text: "Lập quỹ khẩn cấp ít nhất 3-6 tháng chi phí." },
    { author: "Lời nhắc", text: "Ưu tiên trả nợ lãi cao nhất trước, phần còn lại tối thiểu." },
    { author: "Lời nhắc", text: "Tự động chuyển 10% thu nhập vào quỹ đầu tư ngay khi nhận lương." },
    { author: "Lời nhắc", text: "Tạm ngừng mua sắm 24h trước khi quyết định chi lớn." },
    { author: "Lời nhắc", text: "Đặt giới hạn chi tiêu không thông báo: 500k/ngày." },
    { author: "Lời nhắc", text: "Nhóm các khoản chi cố định và đàm phán lại mỗi 6 tháng." },
    { author: "Lời nhắc", text: "Tắt auto-renew với dịch vụ không dùng hàng tuần." },
    { author: "Lời nhắc", text: "Dành 15 phút mỗi tháng để xếp hạng top 3 khoản chi cần cắt." },
    { author: "Lời nhắc", text: "Thêm quy tắc: mua 1 món mới -> bán/cho đi 1 món cũ." },
    { author: "Lời nhắc", text: "Thu nhập bất chợt: tiết kiệm ít nhất 50%, vui 50%." },
    { author: "Lời nhắc", text: "Kiểm tra bảo hiểm và quỹ dự phòng trách nhiệm gia đình." },
    { author: "Lời nhắc", text: "Theo dõi 3 con số: thu nhập, tiết kiệm, tỷ lệ tiết kiệm (%)." },
    { author: "Lời nhắc", text: "Mỗi tuần thử 1 ngày không mua online." },
    { author: "Danh ngôn", text: "Sự giàu có là khả năng trải nghiệm đầy đủ cuộc sống. - Henry David Thoreau" },
    { author: "Danh ngôn", text: "Đừng đánh giá ngày bằng những gì bạn gặt, hãy đánh giá bằng những gì bạn gieo. - Robert Louis Stevenson" },
    { author: "Danh ngôn", text: "Sự kỷ luật là cầu nối giữa mục tiêu và thành tựu. - Jim Rohn" },
    { author: "Danh ngôn", text: "Bạn không cần giỏi hơn người khác, chỉ cần giỏi hơn chính mình ngày hôm qua. - Unknown" },
    { author: "Danh ngôn", text: "Tự do tài chính bắt đầu từ một thói quen nhỏ. - Unknown" },
    { author: "Danh ngôn", text: "Kẻ chiến thắng là người biết dừng đúng lúc. - Unknown" },
    { author: "Danh ngôn", text: "Thời gian trên thị trường quan trọng hơn thời điểm vào thị trường. - Unknown" },
    { author: "Danh ngôn", text: "Đừng để lạm phát ăn mất giấc mơ của bạn. - Unknown" },
    { author: "Danh ngôn", text: "Ghi chép chi tiêu là bản đồ dẫn đến tự do. - Unknown" },
    { author: "Danh ngôn", text: "Khi bạn ngủ, tiền phải thức. - Unknown" },
    { author: "Danh ngôn", text: "Không có kế hoạch, tiền sẽ có kế hoạch riêng. - Unknown" },
    { author: "Danh ngôn", text: "Mỗi lựa chọn tài chính là một lá phiếu cho tương lai bạn muốn. - Unknown" },
    { author: "Danh ngôn", text: "Tiền là công cụ, không phải mục tiêu. - Unknown" },
    { author: "Danh ngôn", text: "Hãy biến tiết kiệm thành phản xạ, không phải nỗ lực. - Unknown" },
  ];

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(() => getPresetRange("thisMonth"));
  const [presetKey, setPresetKey] = useState("thisMonth");
  const [quickForm, setQuickForm] = useState(() => {
    const now = new Date();
    return {
      type: "expense",
      categoryId: "",
      note: "",
      amount: "",
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
    };
  });
  const [quickError, setQuickError] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [isNarrow, setIsNarrow] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 1100 : true));
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ id: "", categoryId: "", limitAmount: "", monthKey: "" });
  const { dialog, showDialog, handleConfirm, handleCancel } = useDialog();
  const quickFormRef = useRef(null);

  async function fetchAllData() {
    try {
      const [me, sum, cats, bre, txs] = await Promise.all([
        apiGetMe(), apiGetSummary(), apiGetCategories(), apiGetExpenseBreakdown(), apiGetTransactions({ limit: 500 })
      ]);
      setUser(me.user);
      setSummary(sum);
      setCategories(Array.isArray(cats) ? cats : (cats.categories || []));
      setBreakdown(Array.isArray(bre) ? bre : (bre.breakdown || []));
      const list = Array.isArray(txs) ? txs : (txs.transactions || []);
      setTransactions(list);
      setBudgets(getBudgets());
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    setLoading(true);
    fetchAllData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsNarrow(window.innerWidth < 1100);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bộ lọc giao dịch theo khoảng thời gian (đặt sớm để dùng cho chart + widget)
  const filteredTransactions = useMemo(() => filterTransactionsByRange(transactions, dateRange), [transactions, dateRange]);
  const monthlyStats = useMemo(() => aggregateStatsForRange(transactions, dateRange), [transactions, dateRange]);
  const currentIncome = monthlyStats.current.income || 0;
  const currentExpense = monthlyStats.current.expense || 0;
  const recent = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const list = filteredTransactions.length ? filteredTransactions : breakdown;
    if (!list || list.length === 0) return null;
    const categoryTypeById = new Map(categories.map((c) => [c._id, c.type]));
    const categoryTypeByName = new Map(categories.map((c) => [c.name?.toLowerCase(), c.type]));
    const agg = new Map();
    list.forEach((t) => {
      const cid = t.category?._id || t.categoryId;
      const name = t.category?.name || t.name;
      if (!cid && !name) return;
      const key = cid || name;
      const prev = agg.get(key) || { name: name || "Khác", value: 0, type: "expense" };
      const type =
        categoryTypeById.get(cid) ||
        categoryTypeByName.get((name || "").toLowerCase()) ||
        t.type ||
        prev.type;
      agg.set(key, { name: name || prev.name, value: prev.value + (t.amount || 0), type });
    });
    const valuesArr = Array.from(agg.values());
    const total = valuesArr.reduce((sum, item) => sum + item.value, 0) || 1;
    const labels = valuesArr.map((b) => {
      const pct = ((b.value / total) * 100).toFixed(1);
      return `${b.name} · ${pct}%`;
    });
    const values = valuesArr.map((b) => b.value);
    const colors = Array.from(agg.values()).map((b) => (b.type === "income" ? "rgba(34,197,94,0.8)" : "rgba(248,113,113,0.8)"));
    return {
      labels,
      datasets: [
        {
          label: "Theo danh mục",
          data: values,
          backgroundColor: colors,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 22,
        },
      ],
    };
  }, [filteredTransactions, breakdown, categories]);

  async function handleQuickAdd(e) {
    e.preventDefault();
    try {
      setQuickError("");
      if (!quickForm.amount) return setQuickError("Vui lòng nhập số tiền!");
      if (!quickForm.date) return setQuickError("Vui lòng chọn ngày giao dịch!");
      const isoDateTime = new Date(`${quickForm.date}T${quickForm.time || "00:00"}`);
      if (Number.isNaN(isoDateTime.getTime())) return setQuickError("Ngày/giờ không hợp lệ");
      await apiCreateTransaction({
        ...quickForm, 
        amount: Number(quickForm.amount), 
        categoryId: quickForm.categoryId || undefined,
        date: isoDateTime.toISOString()
      });
      setQuickForm((prev) => ({
        ...prev,
        note: "",
        amount: "",
        date: prev.date || new Date().toISOString().slice(0, 10),
        time: prev.time || new Date().toTimeString().slice(0, 5),
      }));
      await fetchAllData();
    } catch (err) { setQuickError(err.message); }
  }

  function focusQuickForm() {
    if (quickFormRef.current) {
      quickFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = quickFormRef.current.querySelector("input, select, textarea");
      if (input) input.focus();
    }
  }

  function renderEmptyState(message = "Chưa có giao dịch trong khoảng này") {
    return (
      <div style={styles.emptyBox}>
        <div style={styles.emptyIcon}>
          <Icon name="inbox" tone="slate" size={20} />
        </div>
        <p style={styles.emptyText}>{message}</p>
        <Button variant="ghost" style={styles.emptyBtn} onClick={focusQuickForm}>
          Thêm giao dịch
        </Button>
      </div>
    );
  }

  function shuffleQuote() {
    setQuoteIndex((prev) => {
      const next = Math.floor(Math.random() * quotes.length);
      return next === prev ? (next + 1) % quotes.length : next;
    });
  }

  const balance = summary?.currentBalance ?? 0;
  const activeQuote = quotes[quoteIndex];
  const hasData = filteredTransactions.length > 0;
  const monthKey = useMemo(() => {
    const d = dateRange?.start ? new Date(dateRange.start) : new Date();
    return d.toISOString().slice(0, 7);
  }, [dateRange]);

  const budgetView = useMemo(() => {
    if (!budgets.length) return [];
    const currentStart = dateRange?.start ? startOfDay(dateRange.start) : new Date(monthKey + "-01T00:00:00");
    const currentEnd = dateRange?.end ? endOfDay(dateRange.end) : (() => { const d = new Date(monthKey + "-01T00:00:00"); d.setMonth(d.getMonth() + 1); return d; })();
    const expenseMap = new Map();
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) return;
      if (d < currentStart || d > currentEnd) return;
      const key = t.category?._id || t.categoryId;
      if (!key) return;
      expenseMap.set(key, (expenseMap.get(key) || 0) + t.amount);
    });
    const catName = (id) => categories.find((c) => c._id === id)?.name || id;
    return budgets
      .filter((b) => b.period === "monthly")
      .map((b) => {
        const spent = expenseMap.get(b.categoryId) || 0;
        const ratio = b.limitAmount > 0 ? Math.min(spent / b.limitAmount, 2) : 0;
        let tone = "#22c55e";
        if (ratio >= 1) tone = "#ef4444";
        else if (ratio >= 0.8) tone = "#f59e0b";
        const formattedName = formatCategoryName(catName(b.categoryId));
        return {
          ...b,
          name: formattedName,
          spent,
          ratio,
          tone,
          over: spent > b.limitAmount,
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [budgets, categories, monthKey, transactions]);

  const kpiCards = useMemo(() => {
    const { current, previous } = monthlyStats;
    return [
      {
        key: "expense",
        label: "Tổng chi kỳ hiện tại",
        value: current.expense,
        previous: previous.expense,
        accent: "linear-gradient(135deg, rgba(248,113,113,0.24), rgba(239,68,68,0.14))",
        textColor: "#fecdd3",
        invert: true,
      },
      {
        key: "income",
        label: "Tổng thu kỳ hiện tại",
        value: current.income,
        previous: previous.income,
        accent: "linear-gradient(135deg, rgba(34,197,94,0.24), rgba(74,222,128,0.16))",
        textColor: "#bbf7d0",
        invert: false,
      },
      {
        key: "net",
        label: "Dòng tiền ròng",
        value: current.net,
        previous: previous.net,
        accent: "linear-gradient(135deg, rgba(59,130,246,0.24), rgba(99,102,241,0.16))",
        textColor: "#c7d2fe",
        invert: false,
      },
      {
        key: "savingRate",
        label: "Tỷ lệ tiết kiệm",
        value: monthlyStats.current.savingRate,
        previous: monthlyStats.previous.savingRate,
        accent: "linear-gradient(135deg, rgba(234,179,8,0.24), rgba(251,191,36,0.12))",
        textColor: "#fef08a",
        invert: false,
        isPercent: true,
      },
    ];
  }, [monthlyStats]);

  function openBudgetModal(preset = {}) {
    setBudgetForm({
      id: preset.id || "",
      categoryId: preset.categoryId || "",
      limitAmount: preset.limitAmount != null ? String(preset.limitAmount) : "",
      monthKey: preset.monthKey || monthKey,
    });
    setBudgetModalOpen(true);
  }

  function closeBudgetModal() {
    setBudgetModalOpen(false);
    setBudgetForm({ id: "", categoryId: "", limitAmount: "", monthKey: "" });
  }

  function handleSaveBudget(e) {
    e.preventDefault();
    if (!budgetForm.categoryId || !budgetForm.limitAmount) return;
    const payload = saveBudget({
      id: budgetForm.id,
      categoryId: budgetForm.categoryId,
      limitAmount: Number(budgetForm.limitAmount),
      period: "monthly",
      monthKey: budgetForm.monthKey || monthKey,
    });
    setBudgets(getBudgets());
    setBudgetForm({ id: "", categoryId: "", limitAmount: "", monthKey: "" });
    setBudgetModalOpen(false);
    return payload;
  }

  function handleDeleteBudget(id) {
    if (!id) return;
    showDialog({
      title: "Xoá ngân sách?",
      message: "Bạn có chắc muốn xóa ngân sách này?",
      confirmText: "Xoá",
      cancelText: "Để sau",
      tone: "danger",
    }).then((confirmed) => {
      if (!confirmed) return;
      removeBudget(id);
      setBudgets(getBudgets());
    });
  }

  function renderTxnIcon(t) {
    const iconName = t.category?.icon;
    const tone = t.type === "income" ? "green" : "red";
    if (!iconName) {
      return <Icon name="article" tone={tone} size={18} />;
    }
    if (iconName.length === 1) {
      return <span style={styles.iconText}>{iconName.toUpperCase()}</span>;
    }
    return <Icon name={iconName} tone={tone} size={18} />;
  }

  return (
    <PageTransition style={styles.page}>
      <div style={styles.pageHead}>
        <div>
          <p style={styles.kicker}>Tổng quan tài chính</p>
          <h1 style={styles.heading}>
            Bảng điều khiển
            {user && <span style={styles.subHeading}>Xin chào, {user.name} 👋</span>}
          </h1>
          <p style={styles.lead}>
            Dòng tiền, danh mục và hoạt động mới nhất được cập nhật theo thời gian thực.
          </p>
        </div>
        <div style={styles.rangeWrap}>
          <div style={styles.rangeRow}>
              <SelectField
                value={presetKey}
                onChange={(key) => {
                  setPresetKey(key);
                  if (key !== "custom") setDateRange(getPresetRange(key));
                }}
                options={[
                  { value: "thisMonth", label: "Tháng này" },
                  { value: "lastMonth", label: "Tháng trước" },
                  { value: "last3Months", label: "3 tháng gần đây" },
                  { value: "thisYear", label: "Năm nay" },
                  { value: "custom", label: "Tùy chọn" },
                ]}
                placeholder="Chọn mốc thời gian"
                style={{ minWidth: 200 }}
                density="compact"
              />
            {presetKey === "custom" && (
              <>
                <input
                  type="date"
                  value={dateRange?.start ? new Date(dateRange.start).toISOString().slice(0, 10) : ""}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value) : null;
                    setPresetKey("custom");
                    setDateRange((prev) => ({ start: val, end: prev?.end || val || new Date() }));
                  }}
                  style={styles.rangeInput}
                />
                <input
                  type="date"
                  value={dateRange?.end ? new Date(dateRange.end).toISOString().slice(0, 10) : ""}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value) : null;
                    setPresetKey("custom");
                    setDateRange((prev) => ({ start: prev?.start || val || new Date(), end: val }));
                  }}
                  style={styles.rangeInput}
                />
              </>
            )}
          </div>
          <Badge tone="success">Tài khoản hoạt động</Badge>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div style={styles.kpiGrid}>
            {kpiCards.map((card, idx) => {
              const delta = buildDelta(card.value, card.previous, { invert: card.invert });
              return (
                <Card key={card.key} animate custom={idx} style={{ ...styles.card, ...styles.kpiCard, background: card.accent }}>
                  <div style={styles.kpiHeader}>
                    <span style={{ ...styles.kpiLabel, color: card.textColor }}>{card.label}</span>
                    <Badge tone={card.invert ? "danger" : "success"}>MoM</Badge>
                  </div>
                  <div style={styles.kpiValueRow}>
                    <div style={styles.kpiValue}>
                      {card.isPercent ? formatPercent(card.value) : formatCurrency(card.value)}
                    </div>
                    <span style={styles.kpiHint}>Kỳ hiện tại</span>
                  </div>
                  <div style={styles.kpiFooter}>
                    <span style={delta.isGood ? styles.changePositive : styles.changeNegative}>
                      <Icon name={delta.icon} tone={delta.isGood ? "green" : "red"} size={16} background={false} />
                      {formatPercent(delta.deltaPercent)}
                      <span style={styles.deltaLabel}> vs kỳ trước</span>
                    </span>
                    <span style={styles.kpiPrev}>
                      Kỳ trước: {card.isPercent ? formatPercent(card.previous) : formatCurrency(card.previous)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div style={{ ...styles.grid, gridTemplateColumns: isNarrow ? "1fr" : "repeat(2, minmax(0, 1fr))" }}>
            <Card animate custom={0} title="Tổng số dư" style={{ ...styles.card, ...styles.tallCard }}>
              <div style={styles.balanceRow}>
                <div>
                  <div style={styles.balanceValue}>${balance.toLocaleString("en-US")}</div>
                  <div style={styles.balanceHint}>Tổng cộng sau mọi giao dịch</div>
                </div>
                <div style={styles.badgeStack}>
                  <Badge tone="success">Thu nhập +${currentIncome.toLocaleString("en-US")}</Badge>
                  <Badge tone="danger">Chi tiêu -${currentExpense.toLocaleString("en-US")}</Badge>
                </div>
              </div>
              <div style={styles.quoteBox}>
                <div>
                  <div style={styles.quoteLabel}>{activeQuote.author}</div>
                  <div style={styles.quoteText}>“{activeQuote.text}”</div>
                </div>
              <button type="button" style={styles.quoteBtn} onClick={shuffleQuote}>
                <Icon name="spark" tone="blue" size={16} background={false} /> Quote khác
              </button>
            </div>
          </Card>

          <Card animate custom={1} title="Cơ cấu chi tiêu" style={{ ...styles.card, ...styles.tallCard }}>
            <div style={styles.chartToggle}>
              <span style={styles.toggleLabel}>Loại biểu đồ:</span>
              <div style={styles.toggleGroup}>
                {["bar", "doughnut"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      ...styles.toggleBtn,
                      ...(chartType === type ? styles.toggleBtnActive : {}),
                    }}
                    type="button"
                  >
                    {type === "bar" ? "Cột ngang" : "Doughnut"}
                  </button>
                ))}
              </div>
            </div>
            {hasData && chartData ? (
              <div style={chartType === "doughnut" ? styles.doughnutBox : styles.chartWrap}>
                {chartType === "bar" ? (
                  <Bar
                    data={chartData}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          titleColor: "#e2e8f0",
                          bodyColor: "#e2e8f0",
                          backgroundColor: "rgba(15,23,42,0.9)",
                          borderColor: "rgba(148,163,184,0.3)",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(148,163,184,0.2)" },
                          ticks: { color: "#e2e8f0" },
                        },
                        y: {
                          grid: { display: false },
                          ticks: { color: "#e2e8f0", font: { weight: "700" } },
                        },
                      },
                    }}
                  />
                ) : (
                  <Doughnut
                    data={chartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: "#e2e8f0", font: { weight: 600 } },
                          position: "bottom",
                        },
                        tooltip: {
                          titleColor: "#e2e8f0",
                          bodyColor: "#e2e8f0",
                          backgroundColor: "rgba(15,23,42,0.9)",
                          borderColor: "rgba(148,163,184,0.3)",
                          borderWidth: 1,
                        },
                      },
                      cutout: "60%",
                    }}
                  />
                )}
              </div>
            ) : (
              renderEmptyState()
            )}
          </Card>

            <Card animate custom={2} title="⚡ Ghi nhanh giao dịch" style={{ ...styles.card, ...styles.wideCard }}>
              <div ref={quickFormRef}>
              <form onSubmit={handleQuickAdd} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              <div style={styles.formRow}>
                <SelectField
                  value={quickForm.type}
                  onChange={(val) => setQuickForm({ ...quickForm, type: val })}
                  options={[
                    { value: "expense", label: "Chi tiêu" },
                    { value: "income", label: "Thu nhập" },
                  ]}
                  placeholder="Loại giao dịch"
                  style={{ minWidth: 160 }}
                  density="compact"
                />
                <SelectField
                  value={quickForm.categoryId}
                  onChange={(val) => setQuickForm({ ...quickForm, categoryId: val })}
                  options={[
                    { value: "", label: "Chọn danh mục" },
                    ...categories.map((c) => ({ value: c._id, label: c.name || "Danh mục" })),
                  ]}
                  placeholder="Chọn danh mục"
                  style={{ minWidth: 220 }}
                  maxHeight={220}
                  density="compact"
                />
              </div>

              <InputField
                placeholder="Ghi chú"
                value={quickForm.note}
                onChange={(e) => setQuickForm({ ...quickForm, note: e.target.value })}
              />
              <InputField
                type="number"
                placeholder="Số tiền"
                value={quickForm.amount}
                onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
              />
              <div style={styles.formRow}>
                <InputField
                  type="date"
                  style={{ minWidth: 180, flex: 1 }}
                  value={quickForm.date}
                  onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
                />
                <InputField
                  type="time"
                  style={{ minWidth: 140, flex: 1 }}
                  value={quickForm.time}
                  onChange={(e) => setQuickForm({ ...quickForm, time: e.target.value })}
                />
              </div>
              {quickError && <p style={{ color: "#fca5a5", fontSize: 13 }}>{quickError}</p>}
              <Button type="submit" fullWidth>
                Thêm ngay
              </Button>
            </form>
            </div>
          </Card>

          <Card animate custom={3} title="Ngân sách theo danh mục" style={{ ...styles.card, ...styles.wideCard }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Theo dõi chi tiêu trên hạn mức</span>
              <Button onClick={() => openBudgetModal()} style={{ padding: "8px 10px", fontSize: 13 }}>
                Đặt ngân sách
              </Button>
            </div>
            {!hasData ? (
              renderEmptyState()
            ) : budgetView.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Chưa đặt ngân sách cho danh mục.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {budgetView.map((b) => (
                  <div key={b.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{b.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>
                          {formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}
                        </div>
                        <button style={styles.textBtn} onClick={() => openBudgetModal(b)}>Sửa</button>
                        <button style={{ ...styles.textBtn, color: "#f87171" }} onClick={() => handleDeleteBudget(b.id)}>Xóa</button>
                      </div>
                    </div>
                    <div style={styles.progressRow}>
                      <div style={styles.progressBarOuter}>
                        <div style={{ ...styles.progressBarInner, width: `${Math.min(b.ratio * 100, 200)}%`, background: b.tone }} />
                      </div>
                      <span style={styles.progressPercent}>{(b.ratio * 100).toFixed(0)}%</span>
                    </div>
                    {b.over && <Badge tone="danger">Vượt mức</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div style={isNarrow ? undefined : { gridColumn: "1 / -1" }}>
            <Card animate custom={4} title="Giao dịch gần đây" style={{ ...styles.card, ...styles.wideCard }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
                {recent.map((t) => {
                  const isIncome = t.type === "income";
                  return (
                    <div key={t._id} style={styles.transactionRow}>
                      <div style={styles.iconBox}>
                        {renderTxnIcon(t)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>
                            {t.category?.name || "Uncategorized"}
                          </div>
                          <span style={styles.categoryChip}>{t.category?.name || "Chưa phân loại"}</span>
                        </div>
                        <div style={{ fontSize: 12, color: styles.lead.color }}>
                          {new Date(t.date).toLocaleDateString()} • {t.note}
                        </div>
                      </div>
                      <div style={{ ...styles.amountWrap, color: isIncome ? "#4ade80" : "#f87171" }}>
                        <Icon name={isIncome ? "arrowUpRight" : "arrowDown"} tone={isIncome ? "green" : "red"} size={16} background={false} />
                        {isIncome ? "+" : "-"}${t.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
                {recent.length === 0 && renderEmptyState("Chưa có giao dịch gần đây")}
              </div>
            </Card>
          </div>
        </div>
        </>
      )}
      {budgetModalOpen && (
        <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: "var(--text-strong)" }}>
            {budgetForm.id ? "Chỉnh sửa ngân sách" : "Đặt ngân sách"}
          </h3>
          <button style={styles.modalClose} onClick={closeBudgetModal}>
            <Icon name="close" tone="slate" size={16} background={false} />
          </button>
        </div>
        <form onSubmit={handleSaveBudget} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SelectField
                value={budgetForm.categoryId}
                onChange={(val) => setBudgetForm((prev) => ({ ...prev, categoryId: val }))}
                options={[
                  { value: "", label: "Chọn danh mục" },
                  ...categories.map((c) => ({ value: c._id, label: c.name || "Danh mục" })),
                ]}
                placeholder="Chọn danh mục"
                maxHeight={240}
              />
              <InputField
                type="number"
                placeholder="Hạn mức (VND)"
                value={budgetForm.limitAmount}
                onChange={(e) => setBudgetForm((prev) => ({ ...prev, limitAmount: e.target.value }))}
              />
              <Button type="submit">Lưu ngân sách</Button>
            </form>
          </div>
        </div>
      )}

      <ModalDialog
        open={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        confirmText={dialog?.confirmText}
        cancelText={dialog?.cancelText}
        tone={dialog?.tone}
        onConfirm={handleConfirm}
        onCancel={dialog?.cancelText ? handleCancel : handleConfirm}
      />
    </PageTransition>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "4px 6px 12px",
    background:
      "radial-gradient(circle at 18% 12%, rgba(59,130,246,0.08), transparent 32%), radial-gradient(circle at 88% 8%, rgba(236,72,153,0.06), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
    backgroundColor: "rgba(12,18,34,0.86)",
    borderRadius: 18,
  },
  pageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.05)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heading: { margin: "8px 0 6px", color: "var(--text-strong)", fontSize: 28, letterSpacing: -0.4 },
  subHeading: { display: "inline-block", marginLeft: 10, color: "var(--text-muted)", fontSize: 16, fontWeight: 500 },
  lead: { margin: 0, color: "#e2e8f0", fontSize: 14 },
  rangeWrap: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  rangeRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  rangeInput: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-strong)",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginBottom: 6,
  },
  kpiCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.32)",
    minHeight: 150,
  },
  kpiHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  kpiLabel: { fontWeight: 700, fontSize: 13, letterSpacing: 0.2 },
  kpiValueRow: { display: "flex", alignItems: "baseline", gap: 8 },
  kpiValue: { fontSize: 28, fontWeight: 800, color: "#fff" },
  kpiHint: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  kpiFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10, flexWrap: "wrap" },
  kpiPrev: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  changePositive: { color: "#4ade80", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 },
  changeNegative: { color: "#f87171", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 },
  changeNeutral: { color: "var(--text-muted)", fontWeight: 700, fontSize: 13 },
  deltaLabel: { color: "rgba(255,255,255,0.68)", fontWeight: 500, fontSize: 12, marginLeft: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    alignItems: "stretch",
  },
  card: { height: "100%" },
  tallCard: { minHeight: 320 },
  wideCard: { minHeight: 260 },
  balanceRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  balanceValue: { fontSize: 38, fontWeight: 800, background: globalStyles.gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 },
  balanceHint: { color: "var(--text-muted)", fontSize: 13 },
  badgeStack: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" },
  quoteBox: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
    border: "1px solid rgba(148,163,184,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  quoteLabel: { color: "var(--text-muted)", fontSize: 12, marginBottom: 4 },
  quoteText: { color: "var(--text-strong)", fontWeight: 700, fontSize: 14, fontStyle: "italic", lineHeight: 1.4 },
  quoteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(226,232,240,0.06)",
    color: "var(--text-strong)",
    cursor: "pointer",
    fontWeight: 700,
  },
  chartWrap: { display: "flex", alignItems: "center", gap: 12, paddingRight: 8 },
  doughnutBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 0",
    height: 240,
    maxWidth: 260,
    margin: "0 auto",
  },
  chartToggle: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 },
  toggleLabel: { color: "var(--text-muted)", fontSize: 12, fontWeight: 600 },
  toggleGroup: { display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 12, border: "1px solid rgba(148,163,184,0.15)" },
  toggleBtn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontWeight: 700,
  },
  toggleBtnActive: {
    background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(34,197,94,0.22))",
    color: "var(--text-strong)",
  },
  formRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  transactionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  amountWrap: { display: "flex", alignItems: "center", gap: 6, fontWeight: 800 },
  categoryChip: {
    padding: "4px 8px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    color: "var(--text-muted)",
    fontSize: 11,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  progressBarOuter: {
    position: "relative",
    width: "100%",
    height: 16,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  progressBarInner: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    transition: "width 0.3s ease",
  },
  progressRow: { display: "flex", alignItems: "center", gap: 10 },
  progressPercent: { minWidth: 42, textAlign: "right", fontSize: 12, color: "var(--text-strong)", fontWeight: 700 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    zIndex: 20,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "var(--bg-card)",
    borderRadius: 16,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  modalClose: {
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  textBtn: {
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    padding: "4px 6px",
    borderRadius: 8,
  },
  emptyBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    border: "1px dashed rgba(255,255,255,0.12)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.02)",
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    color: "var(--text-muted)",
  },
  emptyText: { margin: 0, color: "var(--text-muted)", fontSize: 13 },
  emptyBtn: { padding: "10px 12px", fontSize: 13 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(226,232,240,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  iconText: { color: "var(--text-strong)", fontWeight: 800, fontSize: 16 },
};
