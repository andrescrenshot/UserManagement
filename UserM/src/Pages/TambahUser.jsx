import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiCalendarLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { createUserApi } from "../api/userApi";

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

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const titleMap = {
  Tuan: "Tn",
  Nyonya: "Ny",
  Nona: "Nn",
};

export default function TambahUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handlePhoneChange = (e) => {
    let digitsOnly = e.target.value.replace(/[^0-9]/g, "");

    if (digitsOnly.startsWith("62")) {
      digitsOnly = digitsOnly.substring(2);
    }

    if (digitsOnly.startsWith("0")) {
      digitsOnly = digitsOnly.substring(1);
    }

    digitsOnly = digitsOnly.substring(0, 13);

    setForm((prev) => ({
      ...prev,
      noHp: digitsOnly,
    }));

    setErrors((prev) => ({
      ...prev,
      noHp: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    }

    if (!form.noHp) {
      newErrors.noHp = "No. handphone wajib diisi";
    } else if (form.noHp.length < 9) {
      newErrors.noHp = "Nomor handphone tidak valid";
    } else if (form.noHp.length > 13) {
      newErrors.noHp = "Nomor handphone terlalu panjang";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!EMAIL_RULE.test(form.email.trim())) {
      newErrors.email = "Masukkan email yang valid";
    }

    if (!form.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    }

    if (!form.roles) {
      newErrors.roles = "Pilih role terlebih dahulu";
    }

    if (!form.password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Kata sandi minimal 8 karakter";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Konfirmasi kata sandi wajib diisi";
    } else if (
      form.confirmPassword !== form.password
    ) {
      newErrors.confirmPassword =
        "Kata sandi tidak cocok";
    }

    return newErrors;
  };

  const isValid =
    form.nama.trim() !== "" &&
    form.noHp.length >= 9 &&
    form.noHp.length <= 13 &&
    EMAIL_RULE.test(form.email.trim()) &&
    form.tanggalLahir !== "" &&
    form.roles !== "" &&
    form.password.length >= 8 &&
    form.confirmPassword === form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Pastikan semua data sudah diisi dengan benar.",
        confirmButtonColor: BLUE,
      });

      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: titleMap[form.title],
        nama: form.nama.trim(),
        noHp: form.noHp,
        email: form.email.trim().toLowerCase(),
        tanggalLahir: form.tanggalLahir,
        roles: form.roles,
        password: form.password,
      };

      console.log("DATA TAMBAH USER:", payload);

      const response = await createUserApi(payload);

      console.log("RESPONSE BACKEND:", response);

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "User baru berhasil ditambahkan.",
          confirmButtonColor: BLUE,
        });

        navigate("/Dashboard");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Gagal!",
          text:
            response.message ||
            "User gagal ditambahkan.",
          confirmButtonColor: BLUE,
        });
      }
    } catch (error) {
      console.error("ERROR TAMBAH USER:", error);

      let message =
        error?.message ||
        "Backend tidak dapat dihubungi.";

      if (error?.status === 409) {
        message =
          error?.response?.message ||
          "Email sudah terdaftar.";
      }

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: message,
        confirmButtonColor: BLUE,
      });
    } finally {
      setLoading(false);
    }
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
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px 36px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06)",
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
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Title
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                  }}
                >
                  {[
                    "Tuan",
                    "Nyonya",
                    "Nona",
                  ].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        color: "#374151",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="title"
                        checked={
                          form.title === opt
                        }
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            title: opt,
                          }))
                        }
                      />

                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  placeholder="Masukkan Nama Lengkap"
                  value={form.nama}
                  onChange={handleChange("nama")}
                  style={{
                    ...inputStyle,
                    borderColor: errors.nama
                      ? "#DC2626"
                      : BORDER,
                  }}
                />

                {errors.nama && (
                  <div style={errorStyle}>
                    {errors.nama}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  No. Handphone
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "75px",
                      height: "42px",
                      border: `1px solid ${BORDER}`,
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
                        border:
                          "1px solid #E4E7EC",
                        borderRadius: "2px",
                      }}
                    />

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#344054",
                      }}
                    >
                      +62
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="812xxxxxxxx"
                    value={form.noHp}
                    onChange={handlePhoneChange}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      borderColor: errors.noHp
                        ? "#DC2626"
                        : BORDER,
                    }}
                  />
                </div>

                {errors.noHp && (
                  <div style={errorStyle}>
                    {errors.noHp}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Misal: nama@email.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  style={{
                    ...inputStyle,
                    borderColor: errors.email
                      ? "#DC2626"
                      : BORDER,
                  }}
                />

                {errors.email && (
                  <div style={errorStyle}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Tanggal Lahir
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type="date"
                    value={form.tanggalLahir}
                    onChange={handleChange(
                      "tanggalLahir"
                    )}
                    style={{
                      ...inputStyle,
                      paddingRight: "42px",
                      borderColor:
                        errors.tanggalLahir
                          ? "#DC2626"
                          : BORDER,
                      cursor: "pointer",
                    }}
                  />

                  <RiCalendarLine
                    size={18}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#6B7280",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {errors.tanggalLahir && (
                  <div style={errorStyle}>
                    {errors.tanggalLahir}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>
                  Roles
                </label>

                <select
                  value={form.roles}
                  onChange={handleChange("roles")}
                  style={{
                    ...inputStyle,
                    color: form.roles
                      ? "#111827"
                      : "#9CA3AF",
                    borderColor: errors.roles
                      ? "#DC2626"
                      : BORDER,
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    Pilih Role
                  </option>

                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Member">
                    Member
                  </option>
                </select>

                {errors.roles && (
                  <div style={errorStyle}>
                    {errors.roles}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: `1px solid ${BORDER}`,
                  margin: "10px 0 18px",
                }}
              />

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  Kata Sandi
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange(
                      "password"
                    )}
                    style={{
                      ...inputStyle,
                      paddingRight: "40px",
                      borderColor: errors.password
                        ? "#DC2626"
                        : BORDER,
                    }}
                  />

                  {showPassword ? (
                    <RiEyeOffLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowPassword(false)
                      }
                    />
                  ) : (
                    <RiEyeLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowPassword(true)
                      }
                    />
                  )}
                </div>

                {errors.password && (
                  <div style={errorStyle}>
                    {errors.password}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "26px" }}>
                <label style={labelStyle}>
                  Konfirmasi Kata Sandi
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Masukkan ulang kata sandi"
                    value={form.confirmPassword}
                    onChange={handleChange(
                      "confirmPassword"
                    )}
                    style={{
                      ...inputStyle,
                      paddingRight: "40px",
                      borderColor:
                        errors.confirmPassword
                          ? "#DC2626"
                          : BORDER,
                    }}
                  />

                  {showConfirmPassword ? (
                    <RiEyeOffLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowConfirmPassword(
                          false
                        )
                      }
                    />
                  ) : (
                    <RiEyeLine
                      size={18}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#9CA3AF",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowConfirmPassword(
                          true
                        )
                      }
                    />
                  )}
                </div>

                {errors.confirmPassword && (
                  <div style={errorStyle}>
                    {errors.confirmPassword}
                  </div>
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
                  disabled={loading}
                  onClick={() =>
                    navigate("/Dashboard")
                  }
                  style={{
                    padding: "12px 24px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    border: `1px solid ${BORDER}`,
                    background: "white",
                    color: "#6B7280",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 32px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background:
                      isValid && !loading
                        ? BLUE
                        : GRAY_BTN,
                    color: "white",
                    cursor:
                      isValid && !loading
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {loading
                    ? "MENYIMPAN..."
                    : "SIMPAN DATA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}