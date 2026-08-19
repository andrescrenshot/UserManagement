import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RiCalendarLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import {
  getUserApi,
  updateUserApi,
} from "../api/userApi";

const BLUE = "#1226C4";
const GRAY_BTN = "#C7CCD6";
const BORDER = "#E5E7EB";

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

const reverseTitleMap = {
  Tn: "Tuan",
  Ny: "Nyonya",
  Nn: "Nona",
  Tuan: "Tuan",
  Nyonya: "Nyonya",
  Nona: "Nona",
};

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  if (stringValue.includes(" ")) {
    return stringValue.split(" ")[0];
  }

  const match = stringValue.match(
    /^(\d{2})[/-](\d{2})[/-](\d{4})$/
  );

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  return "";
};

const normalizePhoneForForm = (value) => {
  let phone = String(value || "").replace(/\D/g, "");

  if (phone.startsWith("62")) {
    phone = phone.substring(2);
  }

  if (phone.startsWith("0")) {
    phone = phone.substring(1);
  }

  return phone.substring(0, 13);
};

const normalizePhoneForApi = (value) => {
  const phone = String(value || "").replace(/\D/g, "");

  if (!phone) {
    return "";
  }

  if (phone.startsWith("62")) {
    return phone;
  }

  if (phone.startsWith("0")) {
    return `62${phone.substring(1)}`;
  }

  return `62${phone}`;
};

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "Nona",
    nama: "",
    noHp: "",
    email: "",
    tanggalLahir: "",
    roles: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);

        await Swal.fire({
          icon: "error",
          title: "ID Tidak Ditemukan",
          text: "ID user tidak tersedia.",
          confirmButtonColor: BLUE,
        });

        navigate("/Dashboard");
        return;
      }

      try {
        setLoading(true);

        const response = await getUserApi(id);

        console.log("GET USER EDIT:", response);

        const user =
          response?.data?.data ||
          response?.data ||
          response?.user ||
          response;

        if (!user || typeof user !== "object") {
          throw new Error(
            "Format data user dari backend tidak valid."
          );
        }

        setForm({
          title:
            reverseTitleMap[user.title] ||
            "Nona",

          nama:
            user.nama ||
            user.name ||
            "",

          noHp: normalizePhoneForForm(
            user.noHp ||
              user.no_hp ||
              user.phone ||
              ""
          ),

          email:
            user.email ||
            "",

          tanggalLahir:
            normalizeDate(
              user.tanggalLahir ||
                user.tanggal_lahir ||
                user.birthDate ||
                ""
            ),

          roles:
            user.roles ||
            user.role ||
            "",
        });

        setNotFound(false);
      } catch (error) {
        console.error(
          "Gagal mengambil user:",
          error
        );

        setNotFound(true);

        await Swal.fire({
          icon: "error",
          title: "Gagal!",
          text:
            error?.message ||
            "Data user tidak ditemukan.",
          confirmButtonColor: BLUE,
        });

        navigate("/Dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

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
    let digitsOnly = e.target.value.replace(
      /\D/g,
      ""
    );

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

    const nama = form.nama.trim();
    const email = form.email.trim();

    if (!nama) {
      newErrors.nama =
        "Nama lengkap wajib diisi";
    } else if (nama.length < 3) {
      newErrors.nama =
        "Nama minimal 3 karakter";
    }

    if (!form.noHp) {
      newErrors.noHp =
        "No. handphone wajib diisi";
    } else if (form.noHp.length < 9) {
      newErrors.noHp =
        "Nomor handphone tidak valid";
    } else if (form.noHp.length > 13) {
      newErrors.noHp =
        "Nomor handphone terlalu panjang";
    }

    if (!email) {
      newErrors.email =
        "Email wajib diisi";
    } else if (!EMAIL_RULE.test(email)) {
      newErrors.email =
        "Masukkan email yang valid";
    }

    if (!form.tanggalLahir) {
      newErrors.tanggalLahir =
        "Tanggal lahir wajib diisi";
    }

    if (!form.roles) {
      newErrors.roles =
        "Pilih role terlebih dahulu";
    }

    return newErrors;
  };

  const isValid =
    form.nama.trim().length >= 3 &&
    form.noHp.length >= 9 &&
    form.noHp.length <= 13 &&
    EMAIL_RULE.test(form.email.trim()) &&
    form.tanggalLahir !== "" &&
    form.roles !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text:
          "Pastikan semua data sudah diisi dengan benar.",
        confirmButtonColor: BLUE,
      });

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      await Swal.fire({
        icon: "error",
        title: "Belum Login",
        text:
          "Token login tidak ditemukan. Silakan login kembali.",
        confirmButtonColor: BLUE,
      });

      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: titleMap[form.title],
        nama: form.nama.trim(),
        noHp: normalizePhoneForApi(form.noHp),
        email: form.email.trim().toLowerCase(),
        tanggalLahir: form.tanggalLahir,
        roles: form.roles,
      };

      console.log("=================================");
      console.log("PUT EDIT USER");
      console.log("ID:", id);
      console.log("PAYLOAD:", payload);
      console.log("=================================");

      await updateUserApi(id, payload);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text:
          "Perubahan data user berhasil disimpan.",
        confirmButtonColor: BLUE,
      });

      navigate("/Dashboard");
    } catch (error) {
      console.error(
        "Gagal update user:",
        error
      );

      let message =
        "Gagal memperbarui data user.";

      if (error?.response) {
        const data =
          error.response.data;

        message =
          data?.message ||
          data?.error ||
          data?.detail ||
          `Server error (${error.response.status})`;

        if (error.response.status === 401) {
          message =
            "Session login sudah tidak valid. Silakan login kembali.";

          localStorage.removeItem("token");
          localStorage.removeItem("current_user");
          localStorage.removeItem("isLoggedIn");
        }

        if (error.response.status === 404) {
          message =
            "User atau endpoint edit tidak ditemukan.";
        }

        if (error.response.status === 409) {
          message =
            data?.message ||
            "Email sudah digunakan oleh user lain.";
        }
      } else if (error?.request) {
        message =
          "Railway tidak dapat dihubungi.";
      } else if (error?.message) {
        message = error.message;
      }

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: message,
        confirmButtonColor: BLUE,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#6B7280",
        }}
      >
        Memuat data user...
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        style={{
          padding: "28px",
          color: "#6B7280",
        }}
      >
        User tidak ditemukan.

        <span
          style={{
            color: BLUE,
            cursor: "pointer",
            textDecoration: "underline",
            marginLeft: "5px",
          }}
          onClick={() =>
            navigate("/Dashboard")
          }
        >
          Kembali ke daftar user
        </span>
      </div>
    );
  }

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
              Edit User
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
                        fontSize: "13px",
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
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: "8px",
                      padding: "0 12px",
                      fontSize: "14px",
                      color: "#374151",
                      background: "#F9FAFB",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🇮🇩 +62
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

              <div style={{ marginBottom: "8px" }}>
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
                  marginTop: "26px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/Dashboard")
                  }
                  disabled={saving}
                  style={{
                    padding: "12px 24px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    border: `1px solid ${BORDER}`,
                    background: "white",
                    color: "#6B7280",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "12px 32px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background:
                      isValid && !saving
                        ? BLUE
                        : GRAY_BTN,
                    color: "white", 
                    cursor:
                      isValid && !saving
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {saving
                    ? "MENYIMPAN..."
                    : "SIMPAN PERUBAHAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}