import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL = "http://127.0.0.1:9983";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    nama: "",
    noHp: "",
    email: "",
    tanggalLahir: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    nama: "",
    noHp: "",
    email: "",
    tanggalLahir: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateField = (name, value) => {
    if (name === "title") {
      if (!value.trim()) {
        return "Title wajib diisi";
      }

      if (!["Tn", "Ny", "Nn"].includes(value)) {
        return "Title tidak valid";
      }
    }

    if (name === "nama") {
      if (!value.trim()) {
        return "Nama wajib diisi";
      }

      if (value.trim().length < 3) {
        return "Nama minimal 3 karakter";
      }
    }

    if (name === "noHp") {
      if (!value.trim()) {
        return "Nomor HP wajib diisi";
      }

      if (!/^[0-9+\-\s()]+$/.test(value)) {
        return "Nomor HP tidak valid";
      }
    }

    if (name === "email") {
      if (!value.trim()) {
        return "Email wajib diisi";
      }

      if (!EMAIL_REGEX.test(value.trim())) {
        return "Masukkan email yang valid";
      }
    }

    if (name === "tanggalLahir") {
      if (!value) {
        return "Tanggal lahir wajib diisi";
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        return "Kata sandi wajib diisi";
      }

      if (value.length < 6) {
        return "Kata sandi minimal 6 karakter";
      }
    }

    if (name === "confirmPassword") {
      if (!value.trim()) {
        return "Konfirmasi kata sandi wajib diisi";
      }

      if (value !== form.password) {
        return "Kata sandi tidak sama";
      }
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validateField("password", value),
        confirmPassword: form.confirmPassword
          ? value === form.confirmPassword
            ? ""
            : "Kata sandi tidak sama"
          : "",
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== form.password
            ? "Kata sandi tidak sama"
            : "",
      }));
    }

    setSubmitError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {
      title: validateField("title", form.title),
      nama: validateField("nama", form.nama),
      noHp: validateField("noHp", form.noHp),
      email: validateField("email", form.email),
      tanggalLahir: validateField(
        "tanggalLahir",
        form.tanggalLahir
      ),
      password: validateField(
        "password",
        form.password
      ),
      confirmPassword: validateField(
        "confirmPassword",
        form.confirmPassword
      ),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) => error
    );
  };

  const isFormValid = () => {
    return (
      form.title.trim() &&
      form.nama.trim() &&
      form.noHp.trim() &&
      form.email.trim() &&
      form.tanggalLahir &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      !Object.values(errors).some(
        (error) => error
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    const valid = validateForm();

    if (!valid) {
      await Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Silakan periksa kembali data yang kamu masukkan.",
        confirmButtonColor: "#0B2B8E",
      });

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            nama: form.nama.trim(),
            noHp: form.noHp.trim(),
            email: form.email.trim(),
            tanggalLahir: form.tanggalLahir,
            password: form.password,
            roles: "Member",
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Registrasi gagal. Silakan coba lagi.";

        setSubmitError(message);
        setSubmitting(false);

        await Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: message,
          confirmButtonColor: "#0B2B8E",
        });

        return;
      }

      const successMessage =
        data?.message ||
        "Akun berhasil dibuat. Silakan masuk.";

      setSuccessMessage(successMessage);
      setSubmitting(false);

      await Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: successMessage,
        confirmButtonColor: "#0B2B8E",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);

      const message =
        "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.";

      setSubmitError(message);
      setSubmitting(false);

      await Swal.fire({
        icon: "error",
        title: "Server Tidak Terhubung",
        text: message,
        confirmButtonColor: "#0B2B8E",
      });
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#EEF1FB",
        padding: "24px",
      }}
    >
      <div
        className="bg-white shadow-sm"
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "16px",
          padding: "35px",
        }}
      >
        <div className="text-center mb-4">
          <h3
            className="fw-bold mb-2"
            style={{ color: "#0B2B8E" }}
          >
            Daftar
          </h3>

          <p className="text-muted mb-0">
            Silakan buat akun kamu
          </p>
        </div>

        {submitError && (
          <div
            className="alert alert-danger py-2 small"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success py-2 small"
            role="alert"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="registerTitle"
              className="form-label fw-semibold"
            >
              Title
            </label>

            <select
              id="registerTitle"
              name="title"
              className={`form-select ${
                errors.title ? "is-invalid" : ""
              }`}
              value={form.title}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            >
              <option value="">Pilih title</option>
              <option value="Tn">Tn</option>
              <option value="Ny">Ny</option>
              <option value="Nn">Nn</option>
            </select>

            {errors.title && (
              <div className="text-danger small mt-1">
                {errors.title}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerNama"
              className="form-label fw-semibold"
            >
              Nama
            </label>

            <input
              type="text"
              id="registerNama"
              name="nama"
              className={`form-control ${
                errors.nama ? "is-invalid" : ""
              }`}
              placeholder="Masukkan nama"
              value={form.nama}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            />

            {errors.nama && (
              <div className="text-danger small mt-1">
                {errors.nama}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerNoHp"
              className="form-label fw-semibold"
            >
              Nomor HP
            </label>

            <input
              type="tel"
              id="registerNoHp"
              name="noHp"
              className={`form-control ${
                errors.noHp ? "is-invalid" : ""
              }`}
              placeholder="Masukkan nomor HP"
              value={form.noHp}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            />

            {errors.noHp && (
              <div className="text-danger small mt-1">
                {errors.noHp}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerEmail"
              className="form-label fw-semibold"
            >
              Email
            </label>

            <input
              type="email"
              id="registerEmail"
              name="email"
              className={`form-control ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            />

            {errors.email && (
              <div className="text-danger small mt-1">
                {errors.email}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerTanggalLahir"
              className="form-label fw-semibold"
            >
              Tanggal Lahir
            </label>

            <input
              type="date"
              id="registerTanggalLahir"
              name="tanggalLahir"
              className={`form-control ${
                errors.tanggalLahir
                  ? "is-invalid"
                  : ""
              }`}
              value={form.tanggalLahir}
              onChange={handleChange}
              style={{
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            />

            {errors.tanggalLahir && (
              <div className="text-danger small mt-1">
                {errors.tanggalLahir}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerPassword"
              className="form-label fw-semibold"
            >
              Kata Sandi
            </label>

            <div className="position-relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="registerPassword"
                name="password"
                className={`form-control ${
                  errors.password
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Masukkan kata sandi"
                value={form.password}
                onChange={handleChange}
                style={{
                  borderRadius: "8px",
                  padding:
                    "11px 42px 11px 12px",
                }}
              />

              <button
                type="button"
                className="btn btn-sm position-absolute text-muted"
                style={{
                  border: "none",
                  background: "none",
                  right: "5px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
              >
                <i
                  className={`bi ${
                    showPassword
                      ? "bi-eye-slash"
                      : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>

            {errors.password && (
              <div className="text-danger small mt-1">
                {errors.password}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="registerConfirmPassword"
              className="form-label fw-semibold"
            >
              Konfirmasi Kata Sandi
            </label>

            <div className="position-relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="registerConfirmPassword"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Masukkan ulang kata sandi"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                style={{
                  borderRadius: "8px",
                  padding:
                    "11px 42px 11px 12px",
                }}
              />

              <button
                type="button"
                className="btn btn-sm position-absolute text-muted"
                style={{
                  border: "none",
                  background: "none",
                  right: "5px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
              >
                <i
                  className={`bi ${
                    showConfirmPassword
                      ? "bi-eye-slash"
                      : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>

            {errors.confirmPassword && (
              <div className="text-danger small mt-1">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold text-white text-uppercase"
            disabled={submitting}
            style={{
              backgroundColor:
                isFormValid() &&
                !submitting
                  ? "#0B2B8E"
                  : "#A0A3BD",
              borderRadius: "999px",
              padding: "12px 0",
              letterSpacing: "0.5px",
              border: "none",
              transition:
                "background-color 0.2s ease",
            }}
          >
            {submitting
              ? "Memproses..."
              : "Daftar"}
          </button>

          <p
            className="text-center text-muted mt-3 mb-0"
            style={{
              fontSize: "12px",
            }}
          >
            Sudah punya akun?{" "}
            <button
              type="button"
              className="border-0 bg-transparent fw-semibold p-0"
              style={{
                color: "#0B2B8E",
              }}
              onClick={() =>
                navigate("/login")
              }
            >
              Masuk
            </button>
          </p>
        </form>

        <p
          className="text-center text-muted mt-4 mb-0"
          style={{
            fontSize: "11px",
          }}
        >
          ©Copyright 2026
        </p>
      </div>
    </div>
  );
}