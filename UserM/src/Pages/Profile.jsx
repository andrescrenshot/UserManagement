import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiMailLine, RiUserLine, RiPhoneLine, RiCalendarLine, RiShieldUserLine } from "react-icons/ri";
import md5 from "md5";

const BLUE = "#1226C4";
const BORDER = "#E5E7EB";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("current_user");

    if (!currentUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Data user tidak valid:", error);
      localStorage.removeItem("current_user");
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Memuat profile...
      </div>
    );
  }

  const nama = user?.nama || "User";
  const email = user?.email || "";
  const noHp = user?.noHp || "-";
  const tanggalLahir = user?.tanggalLahir || "-";
  const roles = user?.roles || user?.role || "Member";

  const getInitials = () => {
    const words = nama.trim().split(" ").filter(Boolean);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  };

  const getProfilePhoto = () => {
    if (!email) {
      return null;
    }

    const emailHash = md5(
      email.trim().toLowerCase()
    );

    return `https://www.gravatar.com/avatar/${emailHash}?s=300&d=404`;
  };

  const profilePhoto = getProfilePhoto();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    localStorage.removeItem("isLoggedIn");

    navigate("/");
  };

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "100vh",
        background: "#F5F6FA",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#1F2937",
          }}
        >
          Profile
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            color: "#6B7280",
            fontSize: "14px",
          }}
        >
          Informasi akun kamu
        </p>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "120px",
              background:
                "linear-gradient(135deg, #1226C4, #3046D3)",
            }}
          />

          <div
            style={{
              padding: "0 32px 32px",
            }}
          >
            <div
              style={{
                marginTop: "-60px",
                marginBottom: "20px",
              }}
            >
              <img
                src={profilePhoto}
                alt={nama}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display =
                    "flex";
                }}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "5px solid white",
                  display: "block",
                }}
              />

              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "5px solid white",
                  background: BLUE,
                  color: "white",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "34px",
                  fontWeight: 700,
                }}
              >
                {getInitials()}
              </div>
            </div>

            <h3
              style={{
                margin: "0",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1F2937",
              }}
            >
              {nama}
            </h3>

            <p
              style={{
                margin: "5px 0 24px",
                fontSize: "13px",
                color: "#6B7280",
              }}
            >
              {roles}
            </p>

            <div
              style={{
                borderTop: `1px solid ${BORDER}`,
                paddingTop: "22px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 18px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#1F2937",
                }}
              >
                Informasi User
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <InfoItem
                  icon={<RiUserLine />}
                  label="Nama Lengkap"
                  value={nama}
                />

                <InfoItem
                  icon={<RiMailLine />}
                  label="Email"
                  value={email}
                />

                <InfoItem
                  icon={<RiPhoneLine />}
                  label="No. Handphone"
                  value={noHp}
                />

                <InfoItem
                  icon={<RiCalendarLine />}
                  label="Tanggal Lahir"
                  value={tanggalLahir}
                />

                <InfoItem
                  icon={<RiShieldUserLine />}
                  label="Role"
                  value={roles}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#DC2626",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        padding: "14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "#EEF1FF",
          color: BLUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, {
          size: 18,
        })}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
            marginBottom: "3px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#1F2937",
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}