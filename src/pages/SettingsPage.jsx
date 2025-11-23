// src/pages/SettingsPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMe } from "../api/auth";
import {
  apiUpdateProfile,
  apiChangePassword,
  apiDeleteMe,
} from "../api/users";
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Badge from "../components/ui/Badge";
import ModalDialog from "../components/ModalDialog";
import { useDialog } from "../hooks/useDialog";
import { apiGetTransactions } from "../api/transactions";

const DISPLAY_NAME_KEY = "fintr4ck_displayName";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  // Profile
  const [name, setName] = useState("");
  const [baseDisplayName, setBaseDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileMsgVisible, setProfileMsgVisible] = useState(false);

  // Password
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdStrength, setPwdStrength] = useState("weak");
  const [exportMsg, setExportMsg] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const profileMsgTimerRef = useRef(null);
  const profileFadeTimerRef = useRef(null);

  // Danger zone
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerConfirm, setDangerConfirm] = useState("");

  const { dialog, showDialog, handleConfirm, handleCancel } = useDialog();

  const navigate = useNavigate();
  const resolvedBaseName = (user?.displayName || user?.name || baseDisplayName || "").trim();
  const isDirty = name.trim() !== resolvedBaseName;

  useEffect(() => {
    async function init() {
      try {
        const data = await apiGetMe();
        const stored = safeGetDisplayName();
        const resolvedName = data.user?.displayName || data.user?.name || stored || "";
        setUser(data.user);
        setName(resolvedName);
        setBaseDisplayName(resolvedName);
      } catch (err) {
        console.error(err);
      }
    }
    init();

    return () => {
      clearTimeout(toastTimerRef.current);
      clearTimeout(profileMsgTimerRef.current);
      clearTimeout(profileFadeTimerRef.current);
    };
  }, []);

  async function handleProfileSave() {
    try {
      setSavingProfile(true);
      setProfileMsg("");
      const payload = { name, displayName: name };
      const data = await apiUpdateProfile(payload);
      const updatedUser = data.user || {};
      const resolvedName = updatedUser.displayName || updatedUser.name || name;
      const normalizedUser = { ...updatedUser, name: resolvedName, displayName: resolvedName };
      setUser(normalizedUser);
      setName(resolvedName);
      setBaseDisplayName(resolvedName);
      safeSetDisplayName(resolvedName);
      setProfileMsg("Đã lưu thay đổi");
      setProfileMsgVisible(true);
      clearTimeout(profileFadeTimerRef.current);
      clearTimeout(profileMsgTimerRef.current);
      profileFadeTimerRef.current = setTimeout(() => setProfileMsgVisible(false), 2300);
      profileMsgTimerRef.current = setTimeout(() => setProfileMsg(""), 2600);
      showToast("Đã lưu tên hiển thị ✓");
    } catch (err) {
      setProfileMsg(err.message || "Không thể lưu");
      setProfileMsgVisible(true);
      clearTimeout(profileFadeTimerRef.current);
      clearTimeout(profileMsgTimerRef.current);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleExport() {
    try {
      setExportLoading(true);
      setExportMsg("");
      const data = await apiGetTransactions();
      const list = Array.isArray(data) ? data : data.transactions || [];
      const csv = buildTransactionsCsv(list);
      triggerCsvDownload(csv, "fintr4ck-transactions.csv");
      setExportMsg("Đã tạo file CSV giao dịch.");
    } catch (err) {
      setExportMsg(err.message || "Không thể xuất dữ liệu");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      setPwdMsg("");

      if (!pwdForm.currentPassword || !pwdForm.newPassword) {
        setPwdMsg("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (pwdForm.newPassword !== pwdForm.confirmPassword) {
        setPwdMsg("Mật khẩu xác nhận không khớp");
        return;
      }

      if (pwdStrength === "weak") {
        setPwdMsg("Mật khẩu yếu, hãy thêm số, ký tự đặc biệt hoặc dài hơn 8 ký tự");
        return;
      }

      setPwdLoading(true);
      await apiChangePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      setPwdMsg("Đã đổi mật khẩu");
      setPwdForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPwdMsg(err.message || "Không thể đổi mật khẩu");
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await showDialog({
      title: "Xoá tài khoản?",
      message: "Bạn chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác.",
      confirmText: "Xoá",
      cancelText: "Để sau",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      setDangerLoading(true);
      await apiDeleteMe();
      localStorage.removeItem("fintr4ck_token");
      navigate("/login");
    } catch (err) {
      await showDialog({
        title: "Thông báo",
        message: err.message || "Không thể xoá tài khoản",
        confirmText: "Đóng",
        tone: "danger",
      });
    } finally {
      setDangerLoading(false);
    }
  }

  function showToast(message) {
    setToast({ id: Date.now(), message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  return (
    <PageTransition>
      <div style={styles.head}>
        <div>
          <p style={styles.kicker}>Tài khoản</p>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.lead}>Thông tin cơ bản và chỉnh sửa hồ sơ. Quản lý bảo mật tài khoản.</p>
        </div>
        {user && <Badge tone="info">ID: {user._id?.slice(-6) || "user"}</Badge>}
      </div>

      <Card animate custom={0} title="Tài khoản" style={styles.card}>
        <p style={styles.description}>Thông tin cơ bản và chỉnh sửa hồ sơ.</p>

        <div style={styles.accountRow}>
          <div style={styles.avatarCircle}>{(user?.name || user?.email || "F")[0]?.toUpperCase()}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={styles.accountName}>{user?.name || "Chưa đặt tên"}</div>
            <div style={styles.accountEmail}>{user?.email || "Đang tải email..."}</div>
            <div style={styles.accountChips}>
              <span style={styles.chip}>{user?.role ? `Role: ${user.role}` : "Role: user"}</span>
              <span style={styles.chip}>
                {user?.createdAt ? `Tạo: ${formatDate(user.createdAt)}` : "Tạo: --"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.profileRow}>
          <div style={styles.field}>
            <InputField
              label="Tên hiển thị"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên bạn muốn hiển thị"
            />
          </div>
          <div style={styles.field}>
            <InputField label="Email" value={user?.email || ""} disabled />
          </div>
        </div>

        <div
          style={{
            ...styles.infoText,
            opacity: profileMsgVisible && profileMsg ? 1 : 0,
            maxHeight: profileMsgVisible && profileMsg ? 40 : 0,
            transition: "opacity 0.3s ease, max-height 0.3s ease",
          }}
          aria-live="polite"
        >
          {profileMsg}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            onClick={handleProfileSave}
            disabled={savingProfile || !isDirty}
            title={!isDirty ? "Không có thay đổi để lưu" : ""}
            style={{
              opacity: savingProfile || !isDirty ? 0.6 : 1,
              cursor: savingProfile || !isDirty ? "not-allowed" : "pointer",
            }}
          >
            {savingProfile ? "..." : "Lưu thay đổi"}
          </Button>
        </div>

        <div style={{ marginTop: 10 }}>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("fintr4ck_token");
              navigate("/login");
            }}
          >
            Đăng xuất khỏi thiết bị này
          </Button>
        </div>
      </Card>

      <Card animate custom={1} title="Xuất dữ liệu" style={styles.card}>
        <p style={styles.description}>Tải về giao dịch để lưu trữ hoặc phân tích.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? "Đang tạo file..." : "Tải CSV giao dịch"}
          </Button>
          <span style={styles.helperText}>Bao gồm các giao dịch theo toàn bộ thời gian.</span>
        </div>
        {exportMsg && <div style={styles.infoText}>{exportMsg}</div>}
      </Card>

      <Card animate custom={2} title="Bảo mật" style={styles.card}>
        <p style={styles.description}>Đổi mật khẩu để bảo vệ tài khoản của bạn.</p>

        {!showPwdForm && (
          <Button variant="ghost" onClick={() => setShowPwdForm(true)}>
            Đổi mật khẩu
          </Button>
        )}

        {showPwdForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: 12 }}>
            <div style={styles.profileRow}>
              <div style={styles.field}>
                <InputField
                  label="Mật khẩu hiện tại"
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div style={styles.field}>
                <InputField
                  label="Mật khẩu mới"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPwdForm((f) => ({ ...f, newPassword: v }));
                    setPwdStrength(getStrength(v));
                  }}
                  hint={`Độ mạnh: ${pwdStrength}`}
                />
              </div>
              <div style={styles.field}>
                <InputField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {pwdMsg && <div style={styles.infoText}>{pwdMsg}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                variant="subtle"
                onClick={() => {
                  setShowPwdForm(false);
                  setPwdForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPwdMsg("");
                }}
              >
                Hủy
              </Button>
              <Button type="submit">{pwdLoading ? "Đang đổi..." : "Lưu"}</Button>
            </div>
          </form>
        )}
      </Card>

      <Card animate custom={3} title="Danger Zone" style={styles.card}>
        <p style={styles.description}>Xoá tài khoản và toàn bộ dữ liệu liên quan. Hãy cẩn thận.</p>

        <InputField
          label='Gõ "DELETE" để xác nhận'
          value={dangerConfirm}
          onChange={(e) => setDangerConfirm(e.target.value)}
          placeholder="DELETE"
        />

        <Button
          variant="danger"
          onClick={handleDeleteAccount}
          disabled={dangerLoading || dangerConfirm !== "DELETE"}
        >
          {dangerLoading ? "Đang xoá..." : "Xoá tài khoản"}
        </Button>
      </Card>

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

      {toast && (
        <div style={styles.toastStack}>
          <div style={{ ...styles.toast, opacity: toast ? 1 : 0, transform: toast ? "translateY(0)" : "translateY(8px)" }}>
            {toast.message}
          </div>
        </div>
      )}
    </PageTransition>
  );

  function showToast(message) {
    setToast({ id: Date.now(), message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "--";
  }
}

function safeGetDisplayName() {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || "";
  } catch {
    return "";
  }
}

function safeSetDisplayName(value) {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, value);
  } catch {
    // ignore
  }
}

function buildTransactionsCsv(list = []) {
  const headers = ["id", "date", "type", "category", "amount", "note"];
  const rows = list.map((t) => {
    const categoryName = t.category?.name || t.category?.label || t.categoryName || "";
    const date = t.date ? new Date(t.date).toISOString() : "";
    const type = t.type || "";
    const amount = typeof t.amount === "number" ? t.amount : t.amount || "";
    const note = t.note || "";
    const id = t._id || t.id || "";
    return [id, date, type, categoryName, amount, note].map(csvEscape).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerCsvDownload(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score >= 3) return "strong";
  if (score >= 2) return "medium";
  return "weak";
}

const styles = {
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  pageTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: "var(--text-strong)",
  },
  lead: {
    margin: "6px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.4,
    maxWidth: 720,
  },
  card: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#0b1021",
    fontSize: 20,
    boxShadow: "0 14px 32px rgba(14,165,233,0.32)",
  },
  accountRow: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    padding: "10px 0 14px",
    borderBottom: "1px solid rgba(148,163,184,0.16)",
    marginBottom: 12,
  },
  accountName: { fontWeight: 800, color: "var(--text-strong)", fontSize: 16 },
  accountEmail: { color: "var(--text-muted)", fontSize: 13 },
  accountChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 600,
  },
  cardTitle: {
    margin: 0,
    marginBottom: 8,
    fontSize: 18,
    color: "var(--text-strong)",
  },
  description: {
    margin: 0,
    marginBottom: 16,
    fontSize: 13,
    color: "var(--text-muted)",
  },
  profileRow: {
    display: "flex",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  field: {
    flex: 1,
    minWidth: 180,
    marginBottom: 8,
  },
  helperText: { color: "var(--text-muted)", fontSize: 13 },
  infoText: {
    fontSize: 13,
    color: "#67e8f9",
    marginBottom: 8,
  },
  toastStack: {
    position: "fixed",
    right: 18,
    bottom: 18,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 1200,
  },
  toast: {
    minWidth: 220,
    maxWidth: 320,
    padding: "12px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.92))",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "#e2e8f0",
    fontWeight: 700,
    boxShadow: "0 18px 40px rgba(0,0,0,0.35), 0 0 0 6px rgba(124,58,237,0.08)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
  },
};
