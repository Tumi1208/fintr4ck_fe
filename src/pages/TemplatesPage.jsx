// src/pages/TemplatesPage.jsx
import React, { useEffect, useState } from "react";
import { apiCreateCategory } from "../api/categories"; // Tận dụng API cũ
import PageTransition from "../components/PageTransition";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import ModalDialog from "../components/ModalDialog";
import { useDialog } from "../hooks/useDialog";

export default function TemplatesPage() {
  const [loading, setLoading] = useState(false);
  const { dialog, showDialog, handleConfirm, handleCancel } = useDialog();

  useEffect(() => {
    const styleId = "tpl-best-choice-style";
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.innerHTML = `
      @keyframes tplBorderShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  // Dữ liệu mẫu (Hardcode)
  const templates = [
    {
      id: "student",
      title: "Gói Sinh Viên",
      badgeIcon: "book",
      badgeTone: "brand",
      desc: "Các danh mục cơ bản cho đời sống sinh viên đi học xa nhà.",
      btnColor: "#0284C7",
      surface: "linear-gradient(160deg, rgba(56,189,248,0.14), rgba(15,23,42,0.7))",
      categories: [
        { name: "Trợ cấp gia đình", type: "income", icon: "wallet", tone: "green" },
        { name: "Học bổng", type: "income", icon: "award", tone: "amber" },
        { name: "Học phí", type: "expense", icon: "book", tone: "blue" },
        { name: "Tiền trọ", type: "expense", icon: "home", tone: "blue" },
        { name: "Ăn uống", type: "expense", icon: "bag", tone: "amber" },
        { name: "Sách vở & Photo", type: "expense", icon: "article", tone: "slate" },
        { name: "Đi lại/Xăng xe", type: "expense", icon: "spark", tone: "brand" },
        { name: "Hoạt động CLB", type: "expense", icon: "spark", tone: "red" },
      ],
    },
    {
      id: "worker",
      title: "Người Đi Làm",
      badgeIcon: "wallet",
      badgeTone: "green",
      desc: "Quản lý lương thưởng và các chi phí sinh hoạt, xã giao.",
      btnColor: "#16A34A",
      surface: "linear-gradient(150deg, rgba(22,163,74,0.18), rgba(15,23,42,0.7))",
      bestChoice: true,
      categories: [
        { name: "Lương cứng", type: "income", icon: "wallet", tone: "green" },
        { name: "Thưởng/Hoa hồng", type: "income", icon: "award", tone: "amber" },
        { name: "Đầu tư sinh lời", type: "income", icon: "chart", tone: "brand" },
        { name: "Tiền nhà/Điện nước", type: "expense", icon: "home", tone: "blue" },
        { name: "Siêu thị/Chợ", type: "expense", icon: "bag", tone: "amber" },
        { name: "Cafe/Gặp gỡ", type: "expense", icon: "spark", tone: "blue" },
        { name: "Shopping", type: "expense", icon: "bag", tone: "red" },
        { name: "Đầu tư bản thân", type: "expense", icon: "book", tone: "brand" },
      ],
    },
    {
      id: "freelancer",
      title: "Freelancer",
      badgeIcon: "spark",
      badgeTone: "brand",
      desc: "Dành cho người làm tự do, thu nhập không cố định.",
      btnColor: "#9333EA",
      surface: "linear-gradient(155deg, rgba(147,51,234,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Thù lao dự án", type: "income", icon: "award", tone: "brand" },
        { name: "Affiliate", type: "income", icon: "link", tone: "blue" },
        { name: "Thuê phần mềm", type: "expense", icon: "tool", tone: "brand" },
        { name: "Thiết bị/Gear", type: "expense", icon: "tool", tone: "amber" },
        { name: "Quảng cáo/Ads", type: "expense", icon: "chart", tone: "red" },
        { name: "Thuế/Bảo hiểm", type: "expense", icon: "article", tone: "slate" },
        { name: "Không gian làm việc", type: "expense", icon: "home", tone: "blue" },
      ],
    },
    {
      id: "young-family",
      title: "Gia đình trẻ",
      badgeIcon: "home",
      badgeTone: "amber",
      desc: "Gói cân bằng cho cặp đôi mới lập gia đình, tối ưu chi phí cố định.",
      btnColor: "#f59e0b",
      surface: "linear-gradient(160deg, rgba(245,158,11,0.16), rgba(15,23,42,0.7))",
      bestChoice: true,
      categories: [
        { name: "Lương gia đình", type: "income", icon: "wallet", tone: "green" },
        { name: "Cổ tức/Đầu tư", type: "income", icon: "chart", tone: "brand" },
        { name: "Tiền nhà/Thế chấp", type: "expense", icon: "home", tone: "blue" },
        { name: "Chợ/Siêu thị", type: "expense", icon: "bag", tone: "amber" },
        { name: "Điện nước/Internet", type: "expense", icon: "spark", tone: "blue" },
        { name: "Hẹn hò/Đi chơi", type: "expense", icon: "spark", tone: "red" },
        { name: "Quỹ khẩn cấp", type: "expense", icon: "article", tone: "slate" },
      ],
    },
    {
      id: "digital-nomad",
      title: "Digital Nomad",
      badgeIcon: "spark",
      badgeTone: "blue",
      desc: "Làm việc từ xa, di chuyển thường xuyên, tối ưu chi phí lưu trú và di chuyển.",
      btnColor: "#0ea5e9",
      surface: "linear-gradient(150deg, rgba(14,165,233,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương remote", type: "income", icon: "wallet", tone: "green" },
        { name: "Dự án freelance", type: "income", icon: "award", tone: "brand" },
        { name: "Homestay/Khách sạn", type: "expense", icon: "home", tone: "blue" },
        { name: "Cafe/Coworking", type: "expense", icon: "spark", tone: "amber" },
        { name: "Di chuyển/Grab", type: "expense", icon: "spark", tone: "blue" },
        { name: "Visa/giấy tờ", type: "expense", icon: "puzzle", tone: "slate" },
        { name: "Bảo hiểm du lịch", type: "expense", icon: "article", tone: "red" },
      ],
    },
    {
      id: "minimalist",
      title: "Tối giản",
      badgeIcon: "flag",
      badgeTone: "slate",
      desc: "Ít danh mục, dễ kiểm soát; phù hợp ai muốn gọn nhẹ và kỷ luật.",
      btnColor: "#94a3b8",
      surface: "linear-gradient(150deg, rgba(148,163,184,0.16), rgba(15,23,42,0.7))",
      categories: [
        { name: "Thu nhập chính", type: "income", icon: "wallet", tone: "green" },
        { name: "Lãi tiết kiệm", type: "income", icon: "chart", tone: "blue" },
        { name: "Nhà/Điện nước", type: "expense", icon: "home", tone: "blue" },
        { name: "Nhu yếu phẩm", type: "expense", icon: "bag", tone: "amber" },
        { name: "Di chuyển", type: "expense", icon: "spark", tone: "brand" },
        { name: "Quỹ dự phòng", type: "expense", icon: "article", tone: "slate" },
        { name: "Giải trí hạn mức", type: "expense", icon: "flag", tone: "red" },
      ],
    },
    {
      id: "investor-starter",
      title: "Nhà đầu tư F0",
      badgeIcon: "chart",
      badgeTone: "brand",
      desc: "Bộ danh mục giúp theo dõi dòng tiền đầu tư cơ bản, ít rủi ro.",
      btnColor: "#2563eb",
      surface: "linear-gradient(155deg, rgba(37,99,235,0.16), rgba(15,23,42,0.68))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Cổ tức/ETF", type: "income", icon: "chart", tone: "brand" },
        { name: "Mua cổ phiếu/Quỹ", type: "expense", icon: "chart", tone: "brand" },
        { name: "Bảo hiểm/Quỹ hưu", type: "expense", icon: "article", tone: "slate" },
        { name: "Khóa học đầu tư", type: "expense", icon: "book", tone: "amber" },
        { name: "Thuế/Phí giao dịch", type: "expense", icon: "receipt", tone: "red" },
        { name: "Quỹ dự phòng", type: "expense", icon: "flag", tone: "blue" },
      ],
    },
    {
      id: "investor-growth",
      title: "Tăng tốc đầu tư",
      badgeIcon: "dashboard",
      badgeTone: "green",
      desc: "Đo lường tỉ suất sinh lời, phí và tái đầu tư cho nhà đầu tư chủ động.",
      btnColor: "#10b981",
      surface: "linear-gradient(150deg, rgba(16,185,129,0.18), rgba(15,23,42,0.7))",
      categories: [
        { name: "Lợi nhuận giao dịch", type: "income", icon: "chart", tone: "brand" },
        { name: "Cho thuê tài sản", type: "income", icon: "home", tone: "green" },
        { name: "Cổ tức tái đầu tư", type: "income", icon: "receipt", tone: "blue" },
        { name: "Phí giao dịch", type: "expense", icon: "receipt", tone: "red" },
        { name: "Đòn bẩy/Lãi vay", type: "expense", icon: "wallet", tone: "amber" },
        { name: "Danh mục mạo hiểm", type: "expense", icon: "spark", tone: "brand" },
        { name: "Đa dạng hóa/ETF", type: "expense", icon: "puzzle", tone: "blue" },
      ],
    },
    {
      id: "side-hustle",
      title: "Side Hustle bán thời gian",
      badgeIcon: "spark",
      badgeTone: "amber",
      desc: "Tăng thu nhập nhờ công việc tay trái: bán hàng, tư vấn, gia sư.",
      btnColor: "#f97316",
      surface: "linear-gradient(155deg, rgba(249,115,22,0.16), rgba(15,23,42,0.7))",
      categories: [
        { name: "Bán hàng online", type: "income", icon: "bag", tone: "green" },
        { name: "Gia sư/Consulting", type: "income", icon: "award", tone: "brand" },
        { name: "Affiliate/Ref", type: "income", icon: "link", tone: "blue" },
        { name: "Nhập hàng/Nguyên liệu", type: "expense", icon: "bag", tone: "amber" },
        { name: "Marketing/Ads", type: "expense", icon: "chart", tone: "red" },
        { name: "Vận chuyển/Logistics", type: "expense", icon: "spark", tone: "blue" },
        { name: "Công cụ/Phần mềm", type: "expense", icon: "tool", tone: "brand" },
      ],
    },
    {
      id: "creator",
      title: "Creator/Streamer",
      badgeIcon: "play",
      badgeTone: "brand",
      desc: "Dành cho Youtuber/Streamer theo dõi doanh thu nội dung và chi phí sản xuất.",
      btnColor: "#8b5cf6",
      surface: "linear-gradient(150deg, rgba(139,92,246,0.18), rgba(15,23,42,0.72))",
      categories: [
        { name: "Adsense/Đối tác", type: "income", icon: "award", tone: "brand" },
        { name: "Brand Deal/Sponsorship", type: "income", icon: "link", tone: "amber" },
        { name: "Thành viên/Sub", type: "income", icon: "wallet", tone: "green" },
        { name: "Thiết bị quay/Stream", type: "expense", icon: "tool", tone: "amber" },
        { name: "Phần mềm dựng", type: "expense", icon: "tool", tone: "brand" },
        { name: "Thuê studio", type: "expense", icon: "home", tone: "blue" },
        { name: "Quảng bá/Ads", type: "expense", icon: "chart", tone: "red" },
      ],
    },
    {
      id: "startup",
      title: "Startup nhỏ",
      badgeIcon: "puzzle",
      badgeTone: "brand",
      desc: "Khởi nghiệp tinh gọn: kiểm soát burn rate và dòng tiền thử nghiệm.",
      btnColor: "#06b6d4",
      surface: "linear-gradient(155deg, rgba(6,182,212,0.16), rgba(15,23,42,0.7))",
      categories: [
        { name: "Góp vốn", type: "income", icon: "wallet", tone: "green" },
        { name: "Doanh thu", type: "income", icon: "receipt", tone: "blue" },
        { name: "Grant/Funding", type: "income", icon: "award", tone: "brand" },
        { name: "Lương đội ngũ", type: "expense", icon: "wallet", tone: "amber" },
        { name: "Hạ tầng/Cloud", type: "expense", icon: "gear", tone: "blue" },
        { name: "Marketing/Growth", type: "expense", icon: "chart", tone: "red" },
        { name: "Pháp lý/Thuế", type: "expense", icon: "article", tone: "slate" },
        { name: "Văn phòng/Coworking", type: "expense", icon: "home", tone: "blue" },
      ],
    },
    {
      id: "homeowner",
      title: "Chủ nhà",
      badgeIcon: "home",
      badgeTone: "blue",
      desc: "Quản lý chi phí nhà cửa, sửa chữa, và nguồn thu cho thuê nếu có.",
      btnColor: "#0284c7",
      surface: "linear-gradient(150deg, rgba(2,132,199,0.15), rgba(15,23,42,0.7))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Cho thuê phòng", type: "income", icon: "home", tone: "blue" },
        { name: "Vay thế chấp", type: "expense", icon: "receipt", tone: "red" },
        { name: "Bảo trì/Sửa chữa", type: "expense", icon: "tool", tone: "amber" },
        { name: "Nội thất/Đồ gia dụng", type: "expense", icon: "bag", tone: "amber" },
        { name: "Phí dịch vụ/Quản lý", type: "expense", icon: "article", tone: "slate" },
        { name: "Quỹ sửa chữa", type: "expense", icon: "flag", tone: "brand" },
      ],
    },
    {
      id: "wedding-prep",
      title: "Chuẩn bị cưới",
      badgeIcon: "checkBadge",
      badgeTone: "amber",
      desc: "Theo dõi ngân sách cưới, tránh phát sinh ngoài dự kiến.",
      btnColor: "#fbbf24",
      surface: "linear-gradient(150deg, rgba(251,191,36,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Tiết kiệm cưới", type: "income", icon: "wallet", tone: "green" },
        { name: "Hỗ trợ gia đình", type: "income", icon: "award", tone: "amber" },
        { name: "Đặt cọc địa điểm", type: "expense", icon: "home", tone: "blue" },
        { name: "Trang phục & Trang sức", type: "expense", icon: "bag", tone: "amber" },
        { name: "Chụp ảnh/Video", type: "expense", icon: "play", tone: "brand" },
        { name: "Thiệp/Trang trí", type: "expense", icon: "article", tone: "slate" },
        { name: "Honeymoon/Trăng mật", type: "expense", icon: "spark", tone: "red" },
      ],
    },
    {
      id: "debt-crusher",
      title: "Thoát nợ nhanh",
      badgeIcon: "flag",
      badgeTone: "red",
      desc: "Ưu tiên trả nợ, giữ mức sinh hoạt tối thiểu và tránh phí phạt.",
      btnColor: "#ef4444",
      surface: "linear-gradient(155deg, rgba(239,68,68,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Thu nhập thêm", type: "income", icon: "award", tone: "brand" },
        { name: "Trả gốc", type: "expense", icon: "receipt", tone: "red" },
        { name: "Trả lãi", type: "expense", icon: "receipt", tone: "amber" },
        { name: "Sinh hoạt tối thiểu", type: "expense", icon: "bag", tone: "slate" },
        { name: "Quỹ khẩn cấp nhỏ", type: "expense", icon: "flag", tone: "blue" },
        { name: "Phí phạt", type: "expense", icon: "article", tone: "red" },
      ],
    },
    {
      id: "baby-prep",
      title: "Chuẩn bị em bé",
      badgeIcon: "clipboard",
      badgeTone: "amber",
      desc: "Những khoản cần có khi chuẩn bị chào đón thành viên mới.",
      btnColor: "#f59e0b",
      surface: "linear-gradient(160deg, rgba(245,158,11,0.15), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương gia đình", type: "income", icon: "wallet", tone: "green" },
        { name: "Quỹ dành cho bé", type: "income", icon: "chart", tone: "brand" },
        { name: "Khám thai/Bác sĩ", type: "expense", icon: "article", tone: "blue" },
        { name: "Đồ sơ sinh", type: "expense", icon: "bag", tone: "amber" },
        { name: "Sữa/Tã", type: "expense", icon: "bag", tone: "red" },
        { name: "Bảo hiểm mẹ & bé", type: "expense", icon: "article", tone: "slate" },
        { name: "Học phí mầm non", type: "expense", icon: "book", tone: "brand" },
      ],
    },
    {
      id: "health-fitness",
      title: "Sức khỏe & Fitness",
      badgeIcon: "dashboard",
      badgeTone: "green",
      desc: "Tập luyện kỷ luật, theo dõi chi phí gym, thực phẩm và chăm sóc.",
      btnColor: "#22c55e",
      surface: "linear-gradient(150deg, rgba(34,197,94,0.16), rgba(15,23,42,0.7))",
      bestChoice: true,
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Gym/Thành viên", type: "expense", icon: "dashboard", tone: "brand" },
        { name: "Yoga/Thiền", type: "expense", icon: "flag", tone: "amber" },
        { name: "Dinh dưỡng/Meal prep", type: "expense", icon: "bag", tone: "amber" },
        { name: "Khám định kỳ", type: "expense", icon: "article", tone: "blue" },
        { name: "Thực phẩm bổ sung", type: "expense", icon: "receipt", tone: "slate" },
      ],
    },
    {
      id: "foodie-coffee",
      title: "Foodie & Coffeeholic",
      badgeIcon: "spark",
      badgeTone: "amber",
      desc: "Quản chi tiêu ăn uống/cafe để vẫn vui mà không quá tay.",
      btnColor: "#eab308",
      surface: "linear-gradient(150deg, rgba(234,179,8,0.18), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Cafe đặc sản", type: "expense", icon: "spark", tone: "amber" },
        { name: "Ăn ngoài", type: "expense", icon: "bag", tone: "red" },
        { name: "Nguyên liệu nấu ăn", type: "expense", icon: "bag", tone: "blue" },
        { name: "Bánh ngọt/Tráng miệng", type: "expense", icon: "receipt", tone: "brand" },
        { name: "Review trải nghiệm", type: "expense", icon: "play", tone: "brand" },
      ],
    },
    {
      id: "car-owner",
      title: "Chủ xe/Ô tô",
      badgeIcon: "spark",
      badgeTone: "blue",
      desc: "Danh mục riêng cho người sở hữu ô tô, không lẫn với chi tiêu khác.",
      btnColor: "#0ea5e9",
      surface: "linear-gradient(155deg, rgba(14,165,233,0.14), rgba(15,23,42,0.7))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Khoản phụ/Side income", type: "income", icon: "award", tone: "brand" },
        { name: "Xăng/Điện", type: "expense", icon: "spark", tone: "amber" },
        { name: "Bảo dưỡng", type: "expense", icon: "tool", tone: "blue" },
        { name: "Bảo hiểm xe", type: "expense", icon: "article", tone: "slate" },
        { name: "Phí gửi xe", type: "expense", icon: "receipt", tone: "red" },
        { name: "Đăng kiểm/Phí đường", type: "expense", icon: "flag", tone: "brand" },
      ],
    },
    {
      id: "retiree",
      title: "Hưu trí an nhàn",
      badgeIcon: "check",
      badgeTone: "green",
      desc: "Dành cho ba mẹ/ông bà: ưu tiên y tế, gia đình và hoạt động nhẹ nhàng.",
      btnColor: "#16a34a",
      surface: "linear-gradient(150deg, rgba(22,163,74,0.18), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương hưu", type: "income", icon: "wallet", tone: "green" },
        { name: "Lãi tiết kiệm", type: "income", icon: "chart", tone: "brand" },
        { name: "Cho thuê tài sản", type: "income", icon: "home", tone: "blue" },
        { name: "Sinh hoạt gia đình", type: "expense", icon: "bag", tone: "amber" },
        { name: "Y tế/Thuốc men", type: "expense", icon: "article", tone: "blue" },
        { name: "Quà tặng con cháu", type: "expense", icon: "award", tone: "red" },
        { name: "Du lịch/Thăm con cháu", type: "expense", icon: "spark", tone: "brand" },
      ],
    },
    {
      id: "travel-saver",
      title: "Travel Saver",
      badgeIcon: "flag",
      badgeTone: "blue",
      desc: "Tiết kiệm cho chuyến đi mơ ước mà không ảnh hưởng chi phí cố định.",
      btnColor: "#38bdf8",
      surface: "linear-gradient(150deg, rgba(56,189,248,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Thu nhập chính", type: "income", icon: "wallet", tone: "green" },
        { name: "Bonus/13th month", type: "income", icon: "award", tone: "amber" },
        { name: "Quỹ chuyến đi", type: "expense", icon: "flag", tone: "brand" },
        { name: "Vé máy bay/Đi lại", type: "expense", icon: "spark", tone: "blue" },
        { name: "Lưu trú", type: "expense", icon: "home", tone: "blue" },
        { name: "Ăn uống du lịch", type: "expense", icon: "bag", tone: "amber" },
        { name: "Mua sắm/Quà", type: "expense", icon: "bag", tone: "red" },
        { name: "SIM/Internet", type: "expense", icon: "link", tone: "slate" },
      ],
    },
    {
      id: "charity-first",
      title: "Thiện nguyện",
      badgeIcon: "check",
      badgeTone: "red",
      desc: "Thiết kế ngân sách cho các khoản đóng góp, ủng hộ định kỳ.",
      btnColor: "#ef4444",
      surface: "linear-gradient(155deg, rgba(239,68,68,0.14), rgba(15,23,42,0.7))",
      categories: [
        { name: "Thu nhập chính", type: "income", icon: "wallet", tone: "green" },
        { name: "Quỹ thiện nguyện", type: "income", icon: "chart", tone: "brand" },
        { name: "Ủng hộ định kỳ", type: "expense", icon: "article", tone: "amber" },
        { name: "Cứu trợ khẩn cấp", type: "expense", icon: "flag", tone: "red" },
        { name: "Quỹ giáo dục", type: "expense", icon: "book", tone: "blue" },
        { name: "Chi phí di chuyển thiện nguyện", type: "expense", icon: "spark", tone: "blue" },
        { name: "Quà tặng/Hiện vật", type: "expense", icon: "bag", tone: "amber" },
      ],
    },
    {
      id: "pet-parent",
      title: "Sen nuôi boss",
      badgeIcon: "puzzle",
      badgeTone: "amber",
      desc: "Nuôi thú cưng khoa học, theo dõi chi phí ăn uống, thú y, huấn luyện.",
      btnColor: "#fca5a5",
      surface: "linear-gradient(160deg, rgba(252,165,165,0.16), rgba(15,23,42,0.72))",
      categories: [
        { name: "Lương", type: "income", icon: "wallet", tone: "green" },
        { name: "Quỹ thú cưng", type: "income", icon: "chart", tone: "brand" },
        { name: "Thức ăn", type: "expense", icon: "bag", tone: "amber" },
        { name: "Khám/tiêm phòng", type: "expense", icon: "article", tone: "blue" },
        { name: "Spa/Cắt tỉa", type: "expense", icon: "tool", tone: "blue" },
        { name: "Đồ chơi/Phụ kiện", type: "expense", icon: "bag", tone: "red" },
        { name: "Huấn luyện/Pet sitter", type: "expense", icon: "clipboard", tone: "slate" },
      ],
    },
  ];

  // Hàm xử lý "Batch Create" (Tạo hàng loạt)
  async function handleApply(template) {
    const confirmed = await showDialog({
      title: "Áp dụng gói danh mục?",
      message: `Bạn có chắc muốn thêm ${template.categories.length} danh mục của gói "${template.title}"?`,
      confirmText: "Thêm",
      cancelText: "Để sau",
      tone: "danger",
    });
    if (!confirmed) return;

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

      await showDialog({
        title: "Hoàn tất",
        message: `Đã thêm xong!\n- Thành công: ${successCount}\n- Bỏ qua (đã có): ${failCount}`,
        confirmText: "OK",
        tone: "success",
      });

    } catch (err) {
      await showDialog({
        title: "Thông báo",
        message: "Có lỗi xảy ra: " + err.message,
        confirmText: "Đóng",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div style={styles.head}>
        <div>
          <p style={styles.kicker}>Templates</p>
          <h1 style={styles.title}>Khởi tạo nhanh danh mục</h1>
          <p style={styles.lead}>Chọn gói phù hợp để thêm hàng loạt danh mục đã thiết kế sẵn.</p>
        </div>
        {loading && (
          <span style={{ color: "#bfdbfe", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name="spark" tone="brand" size={16} background={false} /> Đang khởi tạo...
          </span>
        )}
      </div>

      <div style={styles.grid}>
        {templates.map((tpl, idx) => {
          const wrapperStyle = tpl.bestChoice
            ? { ...styles.bestChoiceWrap, backgroundImage: styles.rainbowGradient }
            : styles.cardShell;

          return (
            <div key={tpl.id} style={wrapperStyle}>
              <Card
                animate
                custom={idx}
                style={{
                  ...styles.card,
                  borderColor: tpl.bestChoice ? "transparent" : tpl.btnColor,
                  background: tpl.surface || "var(--bg-card)",
                  boxShadow: tpl.bestChoice ? "0 26px 60px rgba(0,0,0,0.45)" : "var(--shadow-card)",
                }}
                whileHover={styles.cardHover}
                onClick={() => handleApply(tpl)}
                role="button"
                tabIndex={0}
              >
                {tpl.bestChoice && (
                  <span style={styles.bestChoiceBadge}>
                    <span>Best choice</span>
                  </span>
                )}

                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleRow}>
                    <span style={styles.titleBadge}>
                      <Icon name={tpl.badgeIcon || "spark"} tone={tpl.badgeTone || "brand"} size={22} />
                    </span>
                    <h3 style={styles.cardTitle}>{tpl.title}</h3>
                  </div>
                  <p style={styles.cardDesc}>{tpl.desc}</p>
                </div>

                <div style={styles.previewList}>
                  {tpl.categories.map((c, idx) => (
                    <span key={idx} style={styles.tag}>
                      <span style={styles.tagIcon}>
                        <Icon
                          name={c.icon || (c.type === "income" ? "wallet" : "bag")}
                          tone={c.tone || (c.type === "income" ? "green" : "amber")}
                          size={18}
                        />
                      </span>
                      {c.name}
                    </span>
                  ))}
                </div>

                <Button
                  style={{ borderColor: "transparent", backgroundColor: tpl.btnColor, color: "#0b1021" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(tpl);
                  }}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? (
                    "Đang thêm..."
                  ) : (
                    <>
                      <Icon name="arrowUpRight" tone="brand" size={16} background={false} />
                      Áp dụng gói này
                    </>
                  )}
                </Button>
              </Card>
            </div>
          );
        })}
      </div>

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
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  kicker: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid var(--border-soft)",
    color: "var(--text-muted)",
    fontSize: 12,
  },
  title: { fontSize: 26, color: "var(--text-strong)", margin: "8px 0 4px", fontWeight: 800 },
  lead: { fontSize: 14, color: "var(--text-muted)", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    alignItems: "stretch",
  },
  cardShell: { height: "100%" },
  bestChoiceWrap: {
    height: "100%",
    position: "relative",
    padding: 3,
    borderRadius: 28,
    backgroundSize: "320% 320%",
    animation: "tplBorderShift 10s linear infinite",
  },
  rainbowGradient:
    "linear-gradient(120deg, #f472b6, #fbbf24, #4ade80, #22c55e, #38bdf8, #8b5cf6, #ec4899, #f472b6)",
  bestChoiceBadge: {
    position: "absolute",
    top: 10,
    right: -12,
    padding: "6px 12px",
    borderRadius: 12,
    background: "linear-gradient(120deg, #fbbf24, #fcd34d)",
    border: "1px solid rgba(208,35,35,0.65)",
    color: "#0b0b0b",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    transform: "rotate(12deg)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35), 0 0 16px rgba(239,68,68,0.6)",
    textShadow: "0 0 10px rgba(239,68,68,0.45)",
  },
  card: {
    borderRadius: 24,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100%",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  },
  cardHover: { y: -4, boxShadow: "0 22px 44px rgba(0,0,0,0.32)", borderColor: "rgba(94,234,212,0.36)" },
  cardHeader: { marginBottom: 16 },
  cardTitleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  titleBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(148,163,184,0.2)",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: "var(--text-strong)", margin: 0 },
  cardDesc: { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 },
  previewList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(226,232,240,0.08)",
    padding: "6px 10px",
    borderRadius: 10,
    fontSize: 12,
    color: "var(--text-strong)",
    fontWeight: 600,
    border: "1px solid rgba(148,163,184,0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  tagIcon: { display: "grid", placeItems: "center" },
};
