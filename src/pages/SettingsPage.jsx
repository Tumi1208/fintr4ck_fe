// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
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

const PREFS_KEY = "fintr4ck_prefs";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  // Profile
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

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

  // Danger zone
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerConfirm, setDangerConfirm] = useState("");

  // Preferences (local only)
  const [prefs, setPrefs] = useState({
    currency: "VND",
    defaultRange: "monthly",
    tips: true,
  });
  const [prefsMsg, setPrefsMsg] = useState("");
  const { dialog, showDialog, handleConfirm, handleCancel } = useDialog();

  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const data = await apiGetMe();
        setUser(data.user);
        setName(data.user.name || "");
      } catch (err) {
        console.error(err);
      }
      try {
        const rawPrefs = localStorage.getItem(PREFS_KEY);
        if (rawPrefs) setPrefs((p) => ({ ...p, ...JSON.parse(rawPrefs) }));
      } catch (err) {
        console.warn("Cannot load prefs", err);
      }
    }
    init();
  }, []);

  async function handleProfileSave() {
    try {
      setSavingProfile(true);
      setProfileMsg("");
      const data = await apiUpdateProfile({ name });
      setUser(data.user);
      setProfileMsg("Đã lưu thay đổi");
    } catch (err) {
      setProfileMsg(err.message || "Không thể lưu");
    } finally {
      setSavingProfile(false);
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

  function handlePrefsSave() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      setPrefsMsg("Đã lưu tuỳ chọn trên thiết bị này");
      setTimeout(() => setPrefsMsg(""), 2000);
    } catch (err) {
      setPrefsMsg("Không thể lưu tuỳ chọn");
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

  return (
    <PageTransition>
      <div style={styles.head}>
        <div>
          <p style={styles.kicker}>Hồ sơ</p>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.lead}>Quản lý thông tin cá nhân, bảo mật và tuỳ chọn hiển thị.</p>
        </div>
        {user && <Badge tone="info">ID: {user._id?.slice(-6) || "user"}</Badge>}
      </div>

      <Card animate custom={0} title="Profile Information" style={styles.card}>
        <p style={styles.description}>Cập nhật tên hiển thị. Email và mã tài khoản chỉ xem.</p>
        <div style={styles.profileSummary}>
          <div style={styles.avatar}>{(user?.name || "F")[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.summaryText}>{user?.name || "Chưa đặt tên"}</div>
            <div style={styles.summarySub}>{user?.email || "Đang tải email..."}</div>
            <div style={styles.summaryMeta}>
              <span>Account ID: {user?._id || "..."}</span>
              <span>{user?.createdAt ? `Created: ${new Date(user.createdAt).toLocaleDateString()}` : "Created: --"}</span>
              <span>Role: {user?.role || "user"}</span>
              <span>Phiên: đang đăng nhập</span>
            </div>
          </div>
        </div>

        <div style={styles.profileRow}>
          <div style={{ flex: 1 }}>
            <InputField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên hiển thị"
            />
          </div>

          <div style={{ flex: 1 }}>
            <InputField label="Email" value={user?.email || ""} disabled />
          </div>
        </div>

        {profileMsg && <div style={styles.infoText}>{profileMsg}</div>}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button onClick={handleProfileSave} disabled={savingProfile}>
            {savingProfile ? "..." : "Lưu thay đổi"}
          </Button>
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

      <Card animate custom={1} title="Bảo mật" style={styles.card}>
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

      <Card animate custom={2} title="Preferences" style={styles.card}>
        <p style={styles.description}>Tuỳ chỉnh hiển thị cục bộ (lưu trên trình duyệt của bạn).</p>
        <div style={styles.profileRow}>
          <div style={styles.field}>
            <label style={styles.label}>Tiền tệ mặc định</label>
            <select
              style={styles.select}
              value={prefs.currency}
              onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Khoảng thời gian mặc định</label>
            <select
              style={styles.select}
              value={prefs.defaultRange}
              onChange={(e) => setPrefs((p) => ({ ...p, defaultRange: e.target.value }))}
            >
              <option value="monthly">Theo tháng</option>
              <option value="weekly">Theo tuần</option>
              <option value="quarterly">Theo quý</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Gợi ý mẹo tài chính</label>
            <Button
              variant="ghost"
              onClick={() => setPrefs((p) => ({ ...p, tips: !p.tips }))}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {prefs.tips ? "Đang bật" : "Đang tắt"}
            </Button>
            <div style={styles.helper}>Hiển thị mẹo tài chính (ví dụ nhắc nhở chi tiêu) trong Dashboard/Transactions. Lưu cục bộ.</div>
          </div>
        </div>
        {prefsMsg && <div style={styles.infoText}>{prefsMsg}</div>}
        <Button onClick={handlePrefsSave}>Lưu tuỳ chọn</Button>
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
    </PageTransition>
  );
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
  profileSummary: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(226,232,240,0.05)",
    border: "1px solid rgba(148,163,184,0.12)",
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(14,165,233,0.9))",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#0b1021",
    fontSize: 18,
  },
  summaryText: { fontWeight: 800, color: "var(--text-strong)", fontSize: 16 },
  summarySub: { color: "var(--text-muted)", fontSize: 13 },
  summaryMeta: { color: "var(--text-muted)", fontSize: 12, display: "flex", gap: 12 },
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
  label: {
    display: "block",
    fontSize: 13,
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
  helper: { marginTop: 6, fontSize: 12, color: "var(--text-muted)" },
  infoText: {
    fontSize: 13,
    color: "#67e8f9",
    marginBottom: 8,
  },
};
