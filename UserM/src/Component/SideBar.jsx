import { useEffect, useState } from "react";
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
  RiUserLine,
} from "react-icons/ri";

const API_URL = import.meta.env.VITE_API_URL;

const SideBar = ({ menuAktifDefault = "beranda" }) => {
  const navigate = useNavigate();

  const [menuAktif, setMenuAktif] =
    useState(menuAktifDefault);

  const [kelasOpen, setKelasOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const cachedUser =
          sessionStorage.getItem("current_user");

        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        const token =
          sessionStorage.getItem("token");

        if (!token || !API_URL) {
          return;
        }

        const response = await fetch(
          `${API_URL}/api/user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const text = await response.text();

        let data = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        const userData =
          data?.user ||
          data?.data?.user ||
          data?.data ||
          data;

        if (userData?.email) {
          setUser(userData);

          sessionStorage.setItem(
            "current_user",
            JSON.stringify(userData)
          );
        }
      } catch (error) {
        console.error(
          "Gagal mengambil data user:",
          error
        );
      }
    };

    loadUser();

    window.addEventListener(
      "user-login",
      loadUser
    );

    window.addEventListener(
      "user-updated",
      loadUser
    );

    window.addEventListener(
      "user-logout",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "user-login",
        loadUser
      );

      window.removeEventListener(
        "user-updated",
        loadUser
      );

      window.removeEventListener(
        "user-logout",
        loadUser
      );
    };
  }, []);

  const getProfileImage = () => {
    if (!user?.profile_photo) {
      return null;
    }

    if (
      user.profile_photo.startsWith("http://") ||
      user.profile_photo.startsWith("https://")
    ) {
      return user.profile_photo;
    }

    return `${API_URL}${user.profile_photo}`;
  };

  const getInitial = () => {
    if (!user?.nama) {
      return "U";
    }

    return user.nama
      .trim()
      .charAt(0)
      .toUpperCase();
  };

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

  const handleProfileClick = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("current_user");
    sessionStorage.removeItem("isLoggedIn");

    setUser(null);
    setProfileOpen(false);
    setShowLogoutConfirm(false);

    window.dispatchEvent(new Event("user-logout"));

    navigate("/", {
      replace: true,
    });
  };

  const profileImage = getProfileImage();

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
            onClick={() =>
              setKelasOpen((prev) => !prev)
            }
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
            <div
              style={{
                marginBottom: "6px",
              }}
            >
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
            onClick={() =>
              setProfileOpen((prev) => !prev)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 8px",
              borderRadius: "12px",
              cursor: "pointer",
              borderTop:
                "1px solid rgba(255,255,255,0.15)",
              paddingTop: "18px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span
                  style={{
                    color: "#1226C4",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {getInitial()}
                </span>
              )}
            </div>

            <div
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "110px",
              }}
            >
              {user?.nama || "User"}
            </div>

            <RiArrowDownSLine
              size={20}
              style={{
                marginLeft: "auto",
                color: "white",
                flexShrink: 0,
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
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <button
                type="button"
                onClick={handleProfileClick}
                style={{
                  width: "100%",
                  border: "none",
                  background: "white",
                  padding: "11px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#1226C4",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <RiUserLine size={20} />
                Profile
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                style={{
                  width: "100%",
                  border: "none",
                  background: "white",
                  padding: "11px 14px",
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