import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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

    if (!API_URL) {
      const message =
        "VITE_API_URL belum dikonfigurasi. Periksa Environment Variable di Vercel.";

      setSubmitError(message);

      await Swal.fire({
        icon: "error",
        title: "Konfigurasi Error",
        text: message,
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
          password,
          rememberMe,
        }),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          `Login gagal (${response.status})`;

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

      const token =
        data?.token ||
        data?.access_token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.access_token ||
        data?.data?.accessToken;

      const user =
        data?.user ||
        data?.data?.user ||
        null;

      if (!token) {
        console.error("TOKEN TIDAK DITEMUKAN:", data);

        setSubmitError(
          "Login berhasil tetapi token dari backend tidak ditemukan."
        );

        setSubmitting(false);

        await Swal.fire({
          icon: "error",
          title: "Token Tidak Ditemukan",
          text: "Backend berhasil merespons, tetapi token login tidak dikirim.",
          confirmButtonColor: "#0B2B8E",
        });

        return;
      }

      if (!user) {
        console.error("USER TIDAK DITEMUKAN:", data);

        setSubmitError(
          "Login berhasil tetapi data user tidak ditemukan."
        );

        setSubmitting(false);

        await Swal.fire({
          icon: "error",
          title: "Data User Tidak Ditemukan",
          text: "Backend tidak mengirim data user.",
          confirmButtonColor: "#0B2B8E",
        });

        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("current_user", JSON.stringify(user));
      sessionStorage.setItem("isLoggedIn", "true");

      console.log("TOKEN LOGIN:", token);
      console.log("USER LOGIN:", user);
      console.log("REMEMBER ME:", rememberMe);

      window.dispatchEvent(new Event("user-login"));

      setSubmitting(false);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${user.nama || "User"}!`,
        confirmButtonColor: "#0B2B8E",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Dashboard");
    } catch (error) {
      console.error("Login error:", error);

      const message =
        "Tidak dapat terhubung ke server. Pastikan backend Railway sedang aktif dan VITE_API_URL sudah benar.";

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
      className="login-page d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#EEF1FB",
        padding: "20px",
      }}
    >
      <div
        className="login-card bg-white shadow-sm"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: "20px",
          padding: "clamp(24px, 5vw, 40px)",
        }}
      >
        <div className="text-center mb-4">
          <h2
            className="fw-bold mb-2"
            style={{
              color: "#0B2B8E",
              fontSize: "clamp(25px, 6vw, 32px)",
            }}
          >
            Masuk
          </h2>

          <p
            className="text-muted mb-0"
            style={{
              fontSize: "14px",
            }}
          >
            Silakan masuk ke akun kamu
          </p>
        </div>

        {submitError && (
          <div
            className="alert alert-danger py-2 px-3 small"
            role="alert"
            style={{
              borderRadius: "10px",
              fontSize: "13px",
            }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="loginEmail"
              className="form-label fw-semibold"
              style={{
                fontSize: "14px",
              }}
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
              autoComplete="email"
              style={{
                borderRadius: "10px",
                padding: "12px 13px",
                fontSize: "14px",
                minHeight: "46px",
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
              style={{
                fontSize: "14px",
              }}
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
                autoComplete="current-password"
                style={{
                  borderRadius: "10px",
                  padding: "12px 45px 12px 13px",
                  fontSize: "14px",
                  minHeight: "46px",
                }}
              />

              <button
                type="button"
                className="btn btn-sm position-absolute text-muted"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                style={{
                  border: "none",
                  background: "none",
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "8px",
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
                  style={{
                    fontSize: "18px",
                  }}
                />
              </button>
            </div>

            {errors.password && (
              <div className="text-danger small mt-1">
                {errors.password}
              </div>
            )}
          </div>

          <div
            className="d-flex justify-content-between align-items-center mt-3 mb-3"
          >
            <div
              className="d-flex align-items-center"
              style={{
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                }}
              />

              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  cursor: "pointer",
                  margin: 0,
                }}
              >
                Ingat saya 30 hari
              </label>
            </div>

            <button
              type="button"
              className="btn p-0 text-dark text-decoration-none fw-semibold"
              style={{
                fontSize: "13px",
              }}
              onClick={() => navigate("/register")}
            >
              Lupa Sandi?
            </button>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold text-white"
            disabled={submitting}
            style={{
              backgroundColor:
                isFormValid() && !submitting
                  ? "#0B2B8E"
                  : "#A0A3BD",
              borderRadius: "999px",
              padding: "12px 0",
              minHeight: "46px",
              letterSpacing: "0.4px",
              border: "none",
              fontSize: "14px",
            }}
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>

          <div
            className="text-center mt-4"
            style={{
              fontSize: "14px",
            }}
          >
            <span className="text-muted">
              Belum punya akun?
            </span>{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="btn p-0 fw-bold"
              style={{
                color: "#0B2B8E",
                fontSize: "14px",
                border: "none",
                background: "none",
              }}
            >
              Daftar sekarang
            </button>
          </div>

          <p
            className="text-center text-muted mt-4 mb-0"
            style={{
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            Dengan masuk ke dalam akun, kamu menyetujui{" "}
            <a
              href="#"
              className="fw-semibold text-decoration-none"
              style={{
                color: "#0B2B8E",
              }}
            >
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a
              href="#"
              className="fw-semibold text-decoration-none"
              style={{
                color: "#0B2B8E",
              }}
            >
              Kebijakan Privasi
            </a>{" "}
            kami.
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