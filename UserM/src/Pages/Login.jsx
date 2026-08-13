import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // =========================
  // VALIDASI EMAIL
  // =========================
  const validateEmail = (value) => {
    if (value.trim() === "") {
      return "Email wajib diisi";
    }

    if (!EMAIL_REGEX.test(value.trim())) {
      return "Masukkan email yang valid";
    }

    return "";
  };

  // =========================
  // VALIDASI PASSWORD
  // =========================
  const validatePassword = (value) => {
    if (value.trim() === "") {
      return "Kata sandi wajib diisi";
    }

    return "";
  };

  // =========================
  // EMAIL CHANGE
  // =========================
  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));

    setSubmitError("");
  };

  // =========================
  // PASSWORD CHANGE
  // =========================
  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));

    setSubmitError("");
  };

  // =========================
  // CEK FORM
  // =========================
  const isFormValid = () => {
    return (
      email.trim() !== "" &&
      password.trim() !== "" &&
      !errors.email &&
      !errors.password
    );
  };

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Simulasi proses login
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Ambil data user dari localStorage
      const savedUsers = localStorage.getItem("users_data");

      const users = savedUsers ? JSON.parse(savedUsers) : [];

      // Cari user berdasarkan email
      const foundUser = users.find(
        (user) =>
          user.email?.toLowerCase() === email.trim().toLowerCase()
      );

      // User tidak ditemukan
      if (!foundUser) {
        setSubmitError(
          "Ups, login gagal! Masukkan email & password yang benar."
        );

        setSubmitting(false);
        return;
      }

      // Kalau data user memiliki password,
      // cek juga password-nya
      if (foundUser.password && foundUser.password !== password) {
        setSubmitError(
          "Ups, login gagal! Masukkan email & password yang benar."
        );

        setSubmitting(false);
        return;
      }

      // Simpan user yang sedang login
      localStorage.setItem(
        "current_user",
        JSON.stringify(foundUser)
      );

      // Simpan status login
      localStorage.setItem("isLoggedIn", "true");

      setSubmitting(false);

      // =========================
      // MASUK KE DASHBOARD
      // =========================
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setSubmitError(
        "Terjadi kesalahan saat login. Silakan coba lagi."
      );

      setSubmitting(false);
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
          width: "150%",
          maxWidth: "500px",
          borderRadius: "16px",
          padding: "35px",
        }}  
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <h3
            className="fw-bold mb-2"
            style={{ color: "#0B2B8E" }}
          >
            Masuk
          </h3>

          <p className="text-muted mb-0">
            Silakan masuk ke akun kamu
          </p>
        </div>

        {/* ERROR LOGIN */}
        {submitError && (
          <div
            className="alert alert-danger py-2 small"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mb-3">
            <label
              htmlFor="loginEmail"
              className="form-label fw-semibold"
            >
              Email
            </label>

            <input
              type="email"
              id="loginEmail"
              className={`form-control ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="Masukkan email"
              value={email}
              onChange={handleEmailChange}
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

          {/* PASSWORD */}
          <div className="mb-2">
            <label
              htmlFor="loginPassword"
              className="form-label fw-semibold"
            >
              Kata Sandi
            </label>

            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                id="loginPassword"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={handlePasswordChange}
                style={{
                  borderRadius: "8px",
                  padding: "11px 42px 11px 12px",
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
                  transform: "translateY(-50%)",
                }}
                onClick={() =>
                  setShowPassword((prev) => !prev)
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

          {/* LUPA PASSWORD */}
          <div className="text-end mb-3 mt-2">
            <a
              href="#"
              className="small text-dark text-decoration-none fw-semibold"
            >
              Lupa Sandi?
            </a>
          </div>

          {/* BUTTON LOGIN */}
          <button
            type="submit"
            className="btn w-100 fw-semibold text-white text-uppercase"
            disabled={submitting}
            style={{
              backgroundColor:
                isFormValid() && !submitting
                  ? "#0B2B8E"
                  : "#A0A3BD",
              borderRadius: "999px",
              padding: "12px 0",
              letterSpacing: "0.5px",
              border: "none",
              transition: "background-color 0.2s ease",
            }}
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>

          {/* TERMS */}
          <p
            className="text-center text-muted mt-3 mb-0"
            style={{
              fontSize: "11px",
              lineHeight: 1.5,
            }}
          >
            Dengan masuk ke dalam akun, kamu menyetujui{" "}
            <a
              href="#"
              className="fw-semibold text-decoration-none"
              style={{ color: "#0B2B8E" }}
            >
              Syarat &amp; Ketentuan
            </a>{" "}
            dan{" "}
            <a
              href="#"
              className="fw-semibold text-decoration-none"
              style={{ color: "#0B2B8E" }}
            >
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>
        </form>

        {/* COPYRIGHT */}
        <p
          className="text-center text-muted mt-4 mb-0"
          style={{ fontSize: "11px" }}
        >
          ©Copyright 2026
        </p>
      </div>
    </div>
  );
}