import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RiMailLine,
  RiUserLine,
  RiPhoneLine,
  RiCalendarLine,
  RiShieldUserLine,
  RiCameraLine,
} from "react-icons/ri";
import md5 from "md5";
import Swal from "sweetalert2";

import {
  getAuthToken,
  getCurrentUser,
  updateCurrentUser,
  clearAuth,
} from "../utils/auth";

import { getUserApi } from "../api/userApi";

const BLUE = "#1226C4";
const BORDER = "#E5E7EB";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://usermanagement-production-f2c5.up.railway.app";

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,

    id:
      user.id ??
      user.user_id ??
      user.userId ??
      null,

    nama:
      user.nama ||
      user.name ||
      user.full_name ||
      user.fullName ||
      "",

    email:
      user.email || "",

    noHp:
      user.noHp ||
      user.no_hp ||
      user.phone ||
      "",

    tanggalLahir:
      user.tanggalLahir ||
      user.tanggal_lahir ||
      user.birth_date ||
      "",

    roles:
      user.roles ||
      user.role ||
      "Member",

    profile_photo:
      user.profile_photo ||
      user.profilePhoto ||
      "",
  };
};

const extractUser = (
  response,
  fallbackUser = null
) => {
  if (!response) {
    return fallbackUser;
  }

  let data = response;

  if (
    response?.data &&
    !Array.isArray(response.data)
  ) {
    data = response.data;
  }

  if (
    response?.data?.user
  ) {
    data =
      response.data.user;
  }

  if (
    response?.user
  ) {
    data =
      response.user;
  }

  return (
    normalizeUser(data) ||
    fallbackUser
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef =
    useRef(null);

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [preview, setPreview] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    const getProfile =
      async () => {
        try {
          /*
           * Token sekarang dicek dari
           * localStorage atau sessionStorage.
           */
          const token =
            getAuthToken();

          if (!token) {
            clearAuth();

            if (!cancelled) {
              setLoading(false);
              navigate("/login", {
                replace: true,
              });
            }

            return;
          }

          /*
           * Ambil user yang tersimpan
           * terlebih dahulu supaya UI
           * langsung punya nama.
           */
          const cachedUser =
            getCurrentUser();

          if (
            cachedUser &&
            !cancelled
          ) {
            setUser(
              normalizeUser(
                cachedUser
              )
            );
          }

          /*
           * Ambil ID user.
           */
          const userId =
            cachedUser?.id ??
            cachedUser?.user_id ??
            cachedUser?.userId ??
            null;

          /*
           * Kalau ID tidak tersedia,
           * gunakan data current_user.
           */
          if (!userId) {
            if (!cachedUser) {
              throw new Error(
                "Data user tidak ditemukan."
              );
            }

            if (!cancelled) {
              setUser(
                normalizeUser(
                  cachedUser
                )
              );
            }

            return;
          }

          /*
           * Ambil data user terbaru
           * melalui endpoint yang sudah
           * ada di userApi.js.
           */
          const response =
            await getUserApi(
              userId
            );

          console.log(
            "PROFILE RESPONSE:",
            response
          );

          if (cancelled) {
            return;
          }

          const userData =
            extractUser(
              response,
              cachedUser
            );

          if (
            !userData ||
            !userData.email
          ) {
            /*
             * Kalau API detail gagal
             * tetapi cached user ada,
             * jangan langsung logout.
             */
            if (cachedUser) {
              const fallback =
                normalizeUser(
                  cachedUser
                );

              setUser(
                fallback
              );

              updateCurrentUser(
                fallback
              );

              return;
            }

            throw new Error(
              "Data user dari backend tidak ditemukan."
            );
          }

          const normalizedUser =
            normalizeUser(
              userData
            );

          setUser(
            normalizedUser
          );

          /*
           * Simpan data user terbaru
           * ke storage yang sedang
           * digunakan oleh Remember Me.
           */
          updateCurrentUser(
            normalizedUser
          );

          window.dispatchEvent(
            new Event(
              "user-updated"
            )
          );
        } catch (error) {
          console.error(
            "Gagal mengambil profile:",
            error
          );

          /*
           * Jangan langsung logout hanya
           * karena endpoint profile error.
           */
          const cachedUser =
            getCurrentUser();

          if (
            cachedUser &&
            !cancelled
          ) {
            setUser(
              normalizeUser(
                cachedUser
              )
            );
          } else if (
            error?.status === 401
          ) {
            clearAuth();

            if (!cancelled) {
              await Swal.fire({
                icon: "warning",
                title:
                  "Sesi Berakhir",
                text: "Silakan login kembali.",
                confirmButtonColor:
                  "#0B2B8E",
              });

              navigate(
                "/login",
                {
                  replace: true,
                }
              );
            }
          } else {
            if (!cancelled) {
              await Swal.fire({
                icon: "error",
                title:
                  "Gagal Mengambil Profile",
                text:
                  error?.message ||
                  "Tidak dapat mengambil data user dari backend.",
                confirmButtonColor:
                  "#0B2B8E",
              });
            }
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    getProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout =
    () => {
      clearAuth();

      setUser(null);
      setPreview(null);

      window.dispatchEvent(
        new Event(
          "user-logout"
        )
      );

      navigate("/login", {
        replace: true,
      });
    };

  const getInitials =
    () => {
      const nama =
        user?.nama ||
        "User";

      const words =
        nama
          .trim()
          .split(" ")
          .filter(Boolean);

      if (
        words.length === 1
      ) {
        return words[0]
          .substring(0, 2)
          .toUpperCase();
      }

      return (
        words[0].charAt(0) +
        words[1].charAt(0)
      ).toUpperCase();
    };

  const getGravatar =
    () => {
      if (!user?.email) {
        return null;
      }

      const emailHash =
        md5(
          user.email
            .trim()
            .toLowerCase()
        );

      return `https://www.gravatar.com/avatar/${emailHash}?s=300&d=404`;
    };

  const getPhotoUrl =
    () => {
      if (preview) {
        return preview;
      }

      if (
        user?.profile_photo
      ) {
        if (
          user.profile_photo.startsWith(
            "http://"
          ) ||
          user.profile_photo.startsWith(
            "https://"
          )
        ) {
          return user.profile_photo;
        }

        return `${API_URL}${user.profile_photo}`;
      }

      return getGravatar();
    };

  const handleSelectPhoto =
    () => {
      if (uploading) {
        return;
      }

      fileInputRef.current?.click();
    };

  const handleFileChange =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        await Swal.fire({
          icon: "warning",
          title:
            "File Tidak Valid",
          text: "Silakan pilih file gambar.",
          confirmButtonColor:
            "#0B2B8E",
        });

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        await Swal.fire({
          icon: "warning",
          title:
            "File Terlalu Besar",
          text: "Ukuran foto maksimal 5 MB.",
          confirmButtonColor:
            "#0B2B8E",
        });

        event.target.value =
          "";

        return;
      }

      const previewUrl =
        URL.createObjectURL(
          file
        );

      setPreview(
        previewUrl
      );

      const result =
        await Swal.fire({
          icon: "question",
          title:
            "Gunakan Foto Ini?",
          text: file.name,
          showCancelButton:
            true,
          confirmButtonText:
            "Upload",
          cancelButtonText:
            "Batal",
          confirmButtonColor:
            "#1226C4",
        });

      if (
        !result.isConfirmed
      ) {
        URL.revokeObjectURL(
          previewUrl
        );

        setPreview(null);

        event.target.value =
          "";

        return;
      }

      await uploadPhoto(
        file
      );
    };

  const uploadPhoto =
    async (file) => {
      const token =
        getAuthToken();

      if (!token) {
        clearAuth();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!API_URL) {
        await Swal.fire({
          icon: "error",
          title:
            "API Tidak Ditemukan",
          text: "VITE_API_URL belum dikonfigurasi.",
          confirmButtonColor:
            "#0B2B8E",
        });

        return;
      }

      try {
        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "profile_photo",
          file
        );

        const response =
          await fetch(
            `${API_URL}/api/user/profile-photo`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

        const text =
          await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          data = {};
        }

        console.log(
          "UPLOAD PHOTO RESPONSE:",
          data
        );

        if (
          response.status ===
          401
        ) {
          clearAuth();

          await Swal.fire({
            icon: "warning",
            title:
              "Sesi Berakhir",
            text: "Silakan login kembali.",
            confirmButtonColor:
              "#0B2B8E",
          });

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Upload gagal (${response.status})`
          );
        }

        const updatedUser =
          normalizeUser(
            data?.user ||
              data?.data?.user ||
              data?.data ||
              null
          );

        if (updatedUser) {
          setUser(
            (prev) => ({
              ...prev,
              ...updatedUser,
            })
          );

          updateCurrentUser({
            ...(user || {}),
            ...updatedUser,
          });
        } else if (
          data?.profile_photo
        ) {
          setUser(
            (prev) => {
              const updated = {
                ...prev,
                profile_photo:
                  data.profile_photo,
              };

              updateCurrentUser(
                updated
              );

              return updated;
            }
          );
        }

        window.dispatchEvent(
          new Event(
            "user-updated"
          )
        );

        setPreview(null);

        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Foto profile berhasil diperbarui.",
          confirmButtonColor:
            "#1226C4",
        });
      } catch (error) {
        console.error(
          "Gagal upload foto:",
          error
        );

        setPreview(null);

        await Swal.fire({
          icon: "error",
          title:
            "Upload Gagal",
          text:
            error?.message ||
            "Foto profile gagal diupload.",
          confirmButtonColor:
            "#0B2B8E",
        });
      } finally {
        setUploading(false);
      }
    };

  if (loading) {
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

  if (!user) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Data profile tidak
        ditemukan.
      </div>
    );
  }

  const nama =
    user?.nama ||
    user?.name ||
    user?.full_name ||
    "User";

  const email =
    user?.email || "";

  const noHp =
    user?.noHp ||
    user?.no_hp ||
    user?.phone ||
    "-";

  const tanggalLahir =
    user?.tanggalLahir ||
    user?.tanggal_lahir ||
    user?.birth_date ||
    "-";

  const roles =
    user?.roles ||
    user?.role ||
    "Member";

  const profilePhoto =
    getPhotoUrl();

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "100vh",
        background:
          "#F5F6FA",
        padding:
          "40px 24px",
        boxSizing:
          "border-box",
      }}
    >
      <div
        style={{
          maxWidth:
            "760px",
          margin:
            "0 auto",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 6px",
            fontSize:
              "24px",
            fontWeight:
              700,
            color:
              "#1F2937",
          }}
        >
          Profile
        </h2>

        <p
          style={{
            margin:
              "0 0 24px",
            color:
              "#6B7280",
            fontSize:
              "14px",
          }}
        >
          Informasi akun kamu
        </p>

        <div
          style={{
            background:
              "white",
            borderRadius:
              "16px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06)",
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              height:
                "120px",
              background:
                "linear-gradient(135deg, #1226C4, #3046D3)",
            }}
          />

          <div
            style={{
              padding:
                "0 32px 32px",
            }}
          >
            <div
              style={{
                marginTop:
                  "-60px",
                marginBottom:
                  "20px",
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                  width:
                    "120px",
                  height:
                    "120px",
                }}
              >
                {profilePhoto ? (
                  <img
                    src={
                      profilePhoto
                    }
                    alt={nama}
                    onError={(
                      e
                    ) => {
                      e.currentTarget.style.display =
                        "none";

                      if (
                        e.currentTarget
                          .nextSibling
                      ) {
                        e.currentTarget.nextSibling.style.display =
                          "flex";
                      }
                    }}
                    style={{
                      width:
                        "120px",
                      height:
                        "120px",
                      borderRadius:
                        "50%",
                      objectFit:
                        "cover",
                      border:
                        "5px solid white",
                      display:
                        "block",
                      background:
                        BLUE,
                    }}
                  />
                ) : null}

                <div
                  style={{
                    width:
                      "120px",
                    height:
                      "120px",
                    borderRadius:
                      "50%",
                    border:
                      "5px solid white",
                    background:
                      BLUE,
                    color:
                      "white",
                    display:
                      profilePhoto
                        ? "none"
                        : "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "34px",
                    fontWeight:
                      700,
                    boxSizing:
                      "border-box",
                  }}
                >
                  {getInitials()}
                </div>

                <button
                  type="button"
                  onClick={
                    handleSelectPhoto
                  }
                  disabled={
                    uploading
                  }
                  style={{
                    position:
                      "absolute",
                    right:
                      "-4px",
                    bottom:
                      "-4px",
                    width:
                      "38px",
                    height:
                      "38px",
                    borderRadius:
                      "50%",
                    border:
                      "3px solid white",
                    background:
                      BLUE,
                    color:
                      "white",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      uploading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      uploading
                        ? 0.6
                        : 1,
                  }}
                  title="Ubah foto profile"
                >
                  <RiCameraLine
                    size={19}
                  />
                </button>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleFileChange
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={
                  handleSelectPhoto
                }
                disabled={
                  uploading
                }
                style={{
                  marginTop:
                    "10px",
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    BLUE,
                  fontSize:
                    "13px",
                  fontWeight:
                    600,
                  cursor:
                    uploading
                      ? "not-allowed"
                      : "pointer",
                  padding: 0,
                }}
              >
                {uploading
                  ? "Mengupload..."
                  : "Ubah Foto Profile"}
              </button>

              <div
                style={{
                  marginTop:
                    "4px",
                  fontSize:
                    "11px",
                  color:
                    "#9CA3AF",
                }}
              >
                JPG, PNG, atau WEBP.
                Maksimal 5 MB.
              </div>
            </div>

            <h3
              style={{
                margin: "0",
                fontSize:
                  "22px",
                fontWeight:
                  700,
                color:
                  "#1F2937",
              }}
            >
              {nama}
            </h3>

            <p
              style={{
                margin:
                  "5px 0 24px",
                fontSize:
                  "13px",
                color:
                  "#6B7280",
              }}
            >
              {roles}
            </p>

            <div
              style={{
                borderTop: `1px solid ${BORDER}`,
                paddingTop:
                  "22px",
              }}
            >
              <h4
                style={{
                  margin:
                    "0 0 18px",
                  fontSize:
                    "15px",
                  fontWeight:
                    700,
                  color:
                    "#1F2937",
                }}
              >
                Informasi User
              </h4>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <InfoItem
                  icon={
                    <RiUserLine />
                  }
                  label="Nama Lengkap"
                  value={nama}
                />

                <InfoItem
                  icon={
                    <RiMailLine />
                  }
                  label="Email"
                  value={email}
                />

                <InfoItem
                  icon={
                    <RiPhoneLine />
                  }
                  label="No. Handphone"
                  value={noHp}
                />

                <InfoItem
                  icon={
                    <RiCalendarLine />
                  }
                  label="Tanggal Lahir"
                  value={
                    tanggalLahir
                  }
                />

                <InfoItem
                  icon={
                    <RiShieldUserLine />
                  }
                  label="Role"
                  value={roles}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                width:
                  "100%",
                marginTop:
                  "24px",
                padding:
                  "12px",
                border:
                  "none",
                borderRadius:
                  "8px",
                background:
                  "#DC2626",
                color:
                  "white",
                fontSize:
                  "13px",
                fontWeight:
                  600,
                cursor:
                  "pointer",
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

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius:
          "10px",
        padding:
          "14px",
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "12px",
      }}
    >
      <div
        style={{
          width:
            "36px",
          height:
            "36px",
          borderRadius:
            "8px",
          background:
            "#EEF1FF",
          color:
            BLUE,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          flexShrink:
            0,
        }}
      >
        {React.cloneElement(
          icon,
          {
            size: 18,
          }
        )}
      </div>

      <div
        style={{
          minWidth:
            0,
        }}
      >
        <div
          style={{
            fontSize:
              "11px",
            color:
              "#9CA3AF",
            marginBottom:
              "3px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize:
              "13px",
            fontWeight:
              600,
            color:
              "#1F2937",
            wordBreak:
              "break-word",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}