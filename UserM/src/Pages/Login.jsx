import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL = "http://127.0.0.1:9983";

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

  const validateEmail = (value) => {
    if (value.trim() === "") {
      return "Email wajib diisi";
    }

    if (!EMAIL_REGEX.test(value.trim())) {
      return "Masukkan email yang valid";
    }

    return "";
  };

  const validatePassword = (value) => {
    if (value.trim() === "") {
      return "Kata sandi wajib diisi";
    }

    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));

    setSubmitError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));

    setSubmitError("");
  };

  const isFormValid = () => {
    return (
      email.trim() !== "" &&
      password.trim() !== "" &&
      !errors.email &&
      !errors.password
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });

      await Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Silakan isi email dan kata sandi dengan benar.",
        confirmButtonColor: "#0B2B8E",
      });

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Ups, login gagal! Masukkan email & password yang benar.";

        setSubmitError(message);

        setSubmitting(false);

        await Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: message,
          confirmButtonColor: "#0B2B8E",
        });

        return;
      }

      const user =
        data?.user ||
        data?.data?.user ||
        data?.data ||
        null;

      if (!user) {
        setSubmitError(
          "Login berhasil tetapi data user tidak ditemukan."
        );

        setSubmitting(false);

        await Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Data user dari server tidak ditemukan.",
          confirmButtonColor: "#0B2B8E",
        });

        return;
      }

      localStorage.setItem(
        "current_user",
        JSON.stringify(user)
      );

      localStorage.setItem("isLoggedIn", "true");

      setSubmitting(false);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${user.nama || "User"}!`,
        confirmButtonColor: "#0B2B8E",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

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
            Masuk
          </h3>

          <p className="text-muted mb-0">
            Silakan masuk ke akun kamu
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

        <form onSubmit={handleSubmit}>
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
                className="b   btn-sm position-absolute text-muted"
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

          <div className="text-end mb-3 mt-2">
            <button
              type="button"
              className="btn p-0 small text-dark text-decoration-none fw-semibold"
              onClick={() => navigate("/register")}
            >
              Lupa Sandi?
            </button>
          </div>

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