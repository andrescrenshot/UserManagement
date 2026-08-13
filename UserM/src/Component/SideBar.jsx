import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

import {
  RiDashboardLine,
  RiHome5Line,
  RiUserSettingsLine,
  RiBookOpenLine,
  RiFileList3Line,
  RiBarChartLine,
  RiAwardLine,
  RiArrowDownSLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

const SideBar = ({ menuAktifDefault = "beranda" }) => {
  const [menuAktif, setMenuAktif] = useState(menuAktifDefault);
  const [kelasOpen, setKelasOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const itemStyle = (key) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    marginBottom: "6px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "white",
    fontSize: "14px",
    fontWeight: menuAktif === key ? 600 : 400,
    background:
      menuAktif === key
        ? "rgba(255,255,255,0.18)"
        : "transparent",
    transition: "background 0.2s",
  });

  const subItemStyle = (key) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px 10px 30px",
    marginBottom: "4px",
    borderRadius: "10px",
    cursor: "pointer",
    color:
      menuAktif === key
        ? "white"
        : "rgba(255,255,255,0.75)",
    fontSize: "13px",
    fontWeight: menuAktif === key ? 600 : 400,
    background:
      menuAktif === key
        ? "rgba(255,255,255,0.18)"
        : "transparent",
    transition: "background 0.2s",
  });

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("current_user");
    localStorage.removeItem("token");

    setShowLogoutConfirm(false);

    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "#1226C4",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "22px 14px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0 8px",
              marginBottom: "28px",
            }}
          >
            <RiDashboardLine size={30} />
            DASHBOARD
          </div>

          <div
            onClick={() => {
              setMenuAktif("beranda");
              navigate("/homepage");
            }}
            style={itemStyle("beranda")}
          >
            <RiHome5Line size={30} />
            Beranda
          </div>

          <div
            onClick={() => {
              setMenuAktif("Dashboard");
              navigate("/dashboard");
            }}
            style={itemStyle("Dashboard")}
          >
            <RiUserSettingsLine size={30} />
            User Management
          </div>

          <div
            onClick={() => setKelasOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              marginBottom: "6px",
              borderRadius: "10px",
              cursor: "pointer",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <RiBookOpenLine size={30} />

            Kelas LMS

            <RiArrowDownSLine
              size={18}
              style={{
                marginLeft: "auto",
                transform: kelasOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </div>

          {kelasOpen && (
            <div style={{ marginBottom: "6px" }}>
              <div
                onClick={() => {
                  setMenuAktif("presensi");
                  navigate("/kelasku");
                }}
                style={subItemStyle("presensi")}
              >
                <RiFileList3Line size={20} />
                Presensi Peserta
              </div>

              <div
                onClick={() => {
                  setMenuAktif("input-nilai");
                  navigate("/penilaian");
                }}
                style={subItemStyle("input-nilai")}
              >
                <RiBarChartLine size={20} />
                Input Nilai
              </div>

              <div
                onClick={() => {
                  setMenuAktif("sertifikat");
                  navigate("/sertifikat");
                }}
                style={subItemStyle("sertifikat")}
              >
                <RiAwardLine size={20} />
                Sertifikat
              </div>
            </div>
          )}
        </div>

        <div>
          <div
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 8px",
              borderRadius: "12px",
              cursor: "pointer",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: "18px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="https://i.pinimg.com/736x/73/41/0c/73410cf0fb499cc4d41587a98978b26f.jpg"
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Fdhil
            </div>

            <RiArrowDownSLine
              size={20}
              style={{
                marginLeft: "auto",
                color: "white",
                transform: profileOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </div>

          {profileOpen && (
            <div
              style={{
                marginTop: "6px",
                background: "white",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={handleLogoutClick}
                style={{
                  width: "100%",
                  border: "none",
                  background: "white",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#dc3545",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <RiLogoutBoxRLine size={20} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        show={showLogoutConfirm}
        onHide={handleCancelLogout}
        centered
      >
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold mb-0">
              Konfirmasi
            </h5>

            <button
              type="button"
              className="btn btn-sm p-1 text-muted"
              style={{
                border: "none",
                background: "none",
                fontSize: "22px",
                lineHeight: 1,
              }}
              onClick={handleCancelLogout}
            >
              &times;
            </button>
          </div>

          <p className="text-muted small mb-4">
            Apakah Anda ingin keluar?
          </p>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn flex-fill fw-semibold text-white"
              style={{
                backgroundColor: "#0B2B8E",
                borderRadius: "8px",
                padding: "10px 0",
                border: "none",
              }}
              onClick={handleConfirmLogout}
            >
              YA
            </button>

            <button
              type="button"
              className="btn flex-fill fw-semibold"
              style={{
                backgroundColor: "#fff",
                color: "#0B2B8E",
                border: "1px solid #0B2B8E",
                borderRadius: "8px",
                padding: "10px 0",
              }}
              onClick={handleCancelLogout}
            >
              TIDAK
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SideBar;