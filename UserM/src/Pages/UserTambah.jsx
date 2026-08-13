import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiCalendarLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { addUser } from "../Pages/UserStore";

const BLUE = "#1226C4";
const GRAY_BTN = "#C7CCD6";
const BORDER = "#E5E7EB";

const emptyForm = {
  title: "Nona",
  nama: "",
  noHp: "",
  email: "",
  tanggalLahir: "",
  roles: "",
  password: "",
  confirmPassword: "",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  
  color: "#374151",
  marginBottom: "6px",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  fontSize: "14px",
  border: `1px solid ${BORDER}`,
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
};

const errorStyle = {
  color: "#DC2626",
  fontSize: "12px",
  marginTop: "4px",
};

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const titleMap = { Tuan: "Tn", Nyonya: "Ny", Nona: "Nn" };

export default function TambahUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setForm({ ...form, noHp: digitsOnly });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nama.trim()) newErrors.nama = "Nama lengkap wajib diisi";

    if (!form.noHp) {
      newErrors.noHp = "No. handphone wajib diisi";
    } else if (("62" + form.noHp).length > 15) {
      newErrors.noHp = "Maksimum terdiri dari 15 angka termasuk kode negara";
    }

    if (!form.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!EMAIL_RULE.test(form.email)) {
      newErrors.email = "Masukkan email yang valid";
    }

    if (!form.tanggalLahir)
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!form.roles) newErrors.roles = "Pilih role terlebih dahulu";

    if (!PASSWORD_RULE.test(form.password)) {
      newErrors.password =
        "Min 8 karakter, kombinasi huruf besar-kecil, angka & karakter khusus";
    }
    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Kata sandi tidak cocok";
    }

    return newErrors;
  };

  const isValid = Object.keys(validate()).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Ups, gagal!",
        text: "Pastikan memasukkan data yang benar. Coba lagi!",
        confirmButtonColor: BLUE,
      });
      return;
    }

    addUser({
      title: titleMap[form.title],
      nama: form.nama,
      noHp: `(+62) ${form.noHp}`,
      email: form.email,
      tanggalLahir: form.tanggalLahir,
      roles: form.roles,
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "User baru berhasil ditambahkan.",
      confirmButtonColor: BLUE,
    }).then(() => {
      navigate("/Dashboard");
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#101B4C",
          color: "white",
          padding: "16px 28px",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        CRM For Education Binus
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "40px 24px",
          background: "#F5F6FA",
        }}
      >
        <div style={{ width: "100%", maxWidth: "560px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px 36px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1F2937",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Buat User
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Title</label>
                <div style={{ display: "flex", gap: "24px" }}>
                  {["Tuan", "Nyonya", "Nona"].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "16px",
                        color: "#374151",
                        cursor: "pointer",
                        fontWeight:"300"
                      }}
                    >
                      <input
                        type="radio"
                        name="title"
                        checked={form.title === opt}
                        onChange={() => setForm({ ...form, title: opt })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Lengkap"
                  value={form.nama}
                  onChange={handleChange("nama")}
                  style={inputStyle}
                />
                {errors.nama && <div style={errorStyle}>{errors.nama}</div>}
              </div>

              {/* No. Handphone */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>No. Handphone</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div
                    style={{
                      width: "75px",
                      height: "38px",
                      border: "1px solid #D0D5DD",
                      borderRadius: "8px",
                      backgroundColor: "#F9FAFB",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0 8px",
                      boxSizing: "border-box",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        width: "18px",
                        height: "12px",
                        background:
                          "linear-gradient(to bottom, #CE1126 50%, #FFFFFF 50%)",
                        border: "1px solid #E4E7EC",
                        borderRadius: "2px",
                      }}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#344054",
                        lineHeight: "14px",
                        margin: 0,
                      }}
                    >
                      +62
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Cth: 812-xxxx-xxxx"
                    value={form.noHp}
                    onChange={handlePhoneChange}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                {errors.noHp && <div style={errorStyle}>{errors.noHp}</div>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="Misal: nama@email.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  style={inputStyle}
                />
                {errors.email && <div style={errorStyle}>{errors.email}</div>}
              </div>

              {/* Tanggal Lahir */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Tanggal Lahir</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={form.tanggalLahir}
                    onChange={handleChange("tanggalLahir")}
                    style={{ ...inputStyle, paddingRight: "36px" }}
                  />
                  <RiCalendarLine
                    size={16}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                    }}
                  />
                </div>
                {errors.tanggalLahir && (
                  <div style={errorStyle}>{errors.tanggalLahir}</div>
                )}
              </div>

              {/* Roles */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Roles</label>
                <select
                  value={form.roles}
                  onChange={handleChange("roles")}
                  style={{
                    ...inputStyle,
                    color: form.roles ? "#111827" : "#9CA3AF",
                  }}
                >
                  <option value="">Pilih Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
                {errors.roles && <div style={errorStyle}>{errors.roles}</div>}
              </div>

              <div
                style={{
                  borderTop: `1px solid ${BORDER}`,
                  margin: "10px 0 18px",
                }}
              />

              {/* Kata Sandi */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Kata Sandi</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Kata Sandi"
                    value={form.password}
                    onChange={handleChange("password")}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  {showPassword ? (
                    <RiEyeOffLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <RiEyeLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {errors.password && (
                  <div style={errorStyle}>{errors.password}</div>
                )}
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div style={{ marginBottom: "26px" }}>
                <label style={labelStyle}>Konfirmasi Kata Sandi</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Masukkan Ulang Kata Sandi"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  {showConfirmPassword ? (
                    <RiEyeOffLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <RiEyeLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )}
                </div>
                {errors.confirmPassword && (
                  <div style={errorStyle}>{errors.confirmPassword}</div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/Dashboard")}
                  style={{
                    padding: "12px 24px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    border: `1px solid ${BORDER}`,
                    background: "white",
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 32px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background: isValid ? BLUE : GRAY_BTN,
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  SIMPAN DATA
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}