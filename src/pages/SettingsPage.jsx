// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMe } from "../api/auth";
import {
  apiUpdateProfile,
  apiChangePassword,
  apiDeleteMe,
} from "../api/users";

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

  // Danger zone
  const [dangerLoading, setDangerLoading] = useState(false);

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
    if (
      !window.confirm(
        "Bạn chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      setDangerLoading(true);
      await apiDeleteMe();
      localStorage.removeItem("fintr4ck_token");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Không thể xoá tài khoản");
    } finally {
      setDangerLoading(false);
    }
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Settings</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Profile Information</h2>
        <p style={styles.description}>
          Quản lý thông tin hồ sơ cá nhân của bạn.
        </p>

        <div style={styles.profileRow}>
          <div style={{ flex: 1 }}>
            <div style={styles.field}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={{ ...styles.input, backgroundColor: "#E5E7EB" }}
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>
        </div>

        {profileMsg && <div style={styles.infoText}>{profileMsg}</div>}

        <button
          style={styles.primaryBtn}
          onClick={handleProfileSave}
          disabled={savingProfile}
        >
          {savingProfile ? "Đang lưu..." : "Save Changes"}
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Security</h2>
        <p style={styles.description}>
          Đổi mật khẩu để bảo vệ tài khoản của bạn.
        </p>

        {!showPwdForm && (
          <button
            style={styles.secondaryBtn}
            onClick={() => setShowPwdForm(true)}
          >
            Change Password
          </button>
        )}

        {showPwdForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: 16 }}>
            <div style={styles.profileRow}>
              <div style={styles.field}>
                <label style={styles.label}>Current Password</label>
                <input
                  style={styles.input}
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
                <label style={styles.label}>New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  style={styles.input}
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
              <button
                type="button"
                style={styles.secondaryBtn}
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
                Cancel
              </button>
              <button type="submit" style={styles.primaryBtn}>
                {pwdLoading ? "Đang đổi..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Danger Zone</h2>
        <p style={styles.description}>
          Xoá tài khoản và toàn bộ dữ liệu liên quan. Hãy cẩn thận.
        </p>

        <button
          style={styles.dangerBtn}
          onClick={handleDeleteAccount}
          disabled={dangerLoading}
        >
          {dangerLoading ? "Đang xoá..." : "Delete Account"}
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    boxShadow:
      "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.1)",
    marginBottom: 20,
  },
  cardTitle: {
    margin: 0,
    marginBottom: 8,
    fontSize: 18,
    color: "#1E293B",
  },
  description: {
    margin: 0,
    marginBottom: 16,
    fontSize: 13,
    color: "#64748B",
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
    color: "#64748B",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },
  primaryBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid #CBD5E1",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 13,
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  infoText: {
    fontSize: 13,
    color: "#16A34A",
    marginBottom: 8,
  },
};
