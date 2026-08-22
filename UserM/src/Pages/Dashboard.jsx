import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine,
  RiCalendarLine,
  RiAddLine,
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiCloseLine,
} from "react-icons/ri"; 
import Swal from "sweetalert2";

import { getUsersApi, updateUserApi, deleteUserApi } from "../api/userApi";

const BLUE = "#1226C4";

const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI_ID = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const normalizeUser = (user) => {
  let status = user.status;

  if (
    status === "nonaktif" ||
    status === "inactive" ||
    status === 0 ||
    status === false
  ) {
    status = "nonaktif";
  } else {
    status = "active";
  }

  return {
    ...user,
    id: user.id ?? user.user_id,
    title: user.title || "",
    nama: user.nama || user.name || "",
    noHp: user.noHp || user.no_hp || user.phone || "",
    email: user.email || "",
    tanggalLahir:
      user.tanggalLahir || user.tanggal_lahir || user.birth_date || "",
    roles: user.roles || user.role || "",
    status,
  };
};

function formatTanggalID(date) {
  if (!date) return "";

  return `${date.getDate()} ${BULAN_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function MiniCalendar({ year, month, onPrev, onNext, selected, onSelectDate }) {
  const weeks = getMonthGrid(year, month);

  return (
    <div
      style={{
        flex: 1,
        minWidth: "220px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <RiArrowLeftSLine
          size={18}
          style={{
            cursor: "pointer",
            color: "#6B7280",
          }}
          onClick={onPrev}
        />

        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          {BULAN_ID[month]}, {year}
        </div>

        <RiArrowRightSLine
          size={18}
          style={{
            cursor: "pointer",
            color: "#6B7280",
          }}
          onClick={onNext}
        />
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr>
            {HARI_ID.map((h) => (
              <th
                key={h}
                style={{
                  padding: "4px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d, di) => (
                <td
                  key={di}
                  style={{
                    padding: "2px",
                    textAlign: "center",
                  }}
                >
                  {d ? (
                    <div
                      onClick={() => onSelectDate(d)}
                      style={{
                        width: "26px",
                        height: "26px",
                        lineHeight: "26px",
                        borderRadius: "50%",
                        margin: "0 auto",
                        cursor: "pointer",
                        background: isSameDay(d, selected)
                          ? BLUE
                          : "transparent",
                        color: isSameDay(d, selected) ? "white" : "#374151",
                      }}
                    >
                      {d.getDate()}
                    </div>
                  ) : (
                    ""
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");

  const [detailUser, setDetailUser] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [toggleTarget, setToggleTarget] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateFrom, setDateFrom] = useState(new Date(2023, 3, 4));
  const [dateTo, setDateTo] = useState(new Date(2023, 6, 16));

  const [leftCal, setLeftCal] = useState({
    year: 2023,
    month: 3,
  });

  const [rightCal, setRightCal] = useState({
    year: 2023,
    month: 6,
  });

  const loadUsers = async () => {
    try {
      const response = await getUsersApi();

      console.log("Response GET TAMBAH USER:", response);

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.users)) {
        data = response.users;
      }

      const normalized = data.map(normalizeUser);

      setUsers(normalized);
    } catch (error) {
      console.error("Gagal mengambil user:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.message || "Gagal mengambil data user dari backend.",
        confirmButtonColor: BLUE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        const response = await getUsersApi();

        if (cancelled) return;

        console.log("Response GET TAMBAH USER:", response);

        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          data = response.data.data;
        } else if (Array.isArray(response?.users)) {
          data = response.users;
        }

        setUsers(data.map(normalizeUser));
      } catch (error) {
        if (cancelled) return;

        console.error("Gagal mengambil user:", error);

        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.message || "Gagal mengambil data user dari backend.",
          confirmButtonColor: BLUE,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = users.filter((u) => {
    const nama = (u.nama || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const keyword = search.toLowerCase();

    return (
      u.status === tab && (nama.includes(keyword) || email.includes(keyword))
    );
  });

  const totalMember = users.length;

  const memberBaru = users.length;

  const handleDelete = (u) => {
    setDeleteTarget(u);
    setDeleteReason("");
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      setDeleteError("Alasan wajib diisi sebelum menghapus data.");
      return;
    }

    try {
      await deleteUserApi(deleteTarget.id, deleteReason.trim());

      setDeleteTarget(null);
      setDeleteReason("");
      setDeleteError("");

      await loadUsers();

      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Data user berhasil dihapus.",
        confirmButtonColor: BLUE,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete user error:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.message || "Data user gagal dihapus.",
        confirmButtonColor: BLUE,
      });
    }
  };

  const shiftMonth = (cal, setCal, dir) => {
    let { year, month } = cal;

    month += dir;

    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }

    setCal({
      year,
      month,
    });
  };

  const handleToggleStatus = (u) => {
    setToggleTarget(u);
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;

    const goingActive = toggleTarget.status !== "active";

    try {
      await updateUserApi(toggleTarget.id, {
        title: toggleTarget.title,
        nama: toggleTarget.nama,
        noHp: toggleTarget.noHp,
        email: toggleTarget.email,
        tanggalLahir: toggleTarget.tanggalLahir,
        roles: toggleTarget.roles,
        status: goingActive ? "active" : "nonaktif",
      });

      setToggleTarget(null);

      await loadUsers();

      Swal.fire({
        icon: "success",
        title: goingActive ? "User diaktifkan kembali" : "User dinon-aktifkan",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Toggle status error:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.message || "Status user gagal diubah.",
        confirmButtonColor: BLUE,
      });
    }
  };

  return (
    <>
      <style>{`
        .user-table-scroll {
          overflow-x: auto;
          scrollbar-width: auto;
        }

        .user-table-scroll::-webkit-scrollbar {
          height: 10px;
        }

        .user-table-scroll::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 8px;
        }

        .user-table-scroll::-webkit-scrollbar-thumb {
          background: #C7CCD6;
          border-radius: 8px;
        }

        .user-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>

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
            padding: "22px 32px",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          CRM For Education Binus
        </div>

        <div
          style={{
            padding: "28px 32px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "32px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#EAF1FE",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  minWidth: "260px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#4A6FA5",
                    marginBottom: "8px",
                  }}
                >
                  Total Member
                </div>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 700,
                    color: "#1F2937",
                  }}
                >
                  {totalMember.toLocaleString("id-ID")}
                </div>
              </div>

              <div
                style={{
                  background: "#FDF3E1",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  minWidth: "260px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#A5793D",
                    marginBottom: "8px",
                  }}
                >
                  Member Baru
                </div>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 700,
                    color: "#1F2937",
                  }}
                >
                  {memberBaru}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#B79A6A",
                    marginTop: "4px",
                  }}
                >
                  90 hari terakhir
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "32px",
                borderBottom: "1px solid #E5E7EB",
                marginBottom: "20px",
              }}
            >
              {[
                {
                  key: "active",
                  label: "Active",
                },
                {
                  key: "nonaktif",
                  label: "Non Active",
                },
              ].map((t) => (
                <div
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    paddingBottom: "14px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: tab === t.key ? 600 : 400,
                    color: tab === t.key ? BLUE : "#9CA3AF",
                    borderBottom:
                      tab === t.key
                        ? `3px solid ${BLUE}`
                        : "3px solid transparent",
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <RiSearchLine
                    size={20}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                    }}
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari"
                    style={{
                      padding: "13px 16px 13px 42px",
                      fontSize: "15px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "9px",
                      outline: "none",
                      width: "240px",
                    }}
                  />
                </div>

                <div
                  onClick={() => setShowDatePicker(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "9px",
                    padding: "13px 16px",
                    fontSize: "15px",
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  <RiCalendarLine size={20} />

                  {formatTanggalID(dateFrom)}

                  {" - "}

                  {formatTanggalID(dateTo)}
                </div>
              </div>

              <button
                onClick={() => navigate("/Dashboard/tambah")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: BLUE,
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  padding: "14px 22px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RiAddLine size={20} />
                Buat User Baru
              </button>
            </div>

            <div
              className="user-table-scroll"
              style={{
                paddingBottom: "6px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "1000px",
                  borderCollapse: "collapse",
                  fontSize: "15px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      color: "#9CA3AF",
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    <th style={thStyle}>No.</th>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Nama</th>
                    <th style={thStyle}>No. Handphone</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Tanggal Lahir</th>
                    <th style={thStyle}>Roles</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: "40px 0",
                          textAlign: "center",
                          color: "#9CA3AF",
                        }}
                      >
                        Memuat data user...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: "40px 0",
                          textAlign: "center",
                          color: "#9CA3AF",
                        }}
                      >
                        Tidak ada user pada kategori ini.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, idx) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid #F3F4F6",
                          color: "#374151",
                        }}
                      >
                        <td style={tdStyle}>{idx + 1}</td>

                        <td style={tdStyle}>{u.title}</td>

                        <td style={tdStyle}>{u.nama}</td>

                        <td style={tdStyle}>🇮🇩 {u.noHp}</td>

                        <td style={tdStyle}>{u.email}</td>

                        <td style={tdStyle}>{u.tanggalLahir}</td>

                        <td style={tdStyle}>{u.roles}</td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              color: "#9CA3AF",
                            }}
                          >
                            <RiEyeLine
                              size={20}
                              title="Lihat Detail"
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() => setDetailUser(u)}
                            />

                            <RiPencilLine
                              size={20}
                              title="Edit"
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/Dashboard/edit/${u.id}`)
                              }
                            />

                            <span
                              onClick={() => handleToggleStatus(u)}
                              style={{
                                fontSize: "13px",
                                textDecoration: "underline",
                                cursor: "pointer",
                                color: "#B79A6A",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tab === "active" ? "Non-aktif" : "Re-aktif"}
                            </span>

                            <RiDeleteBinLine
                              size={20}
                              title="Hapus"
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() => handleDelete(u)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "14px",
                marginTop: "30px",
                color: "#9CA3AF",
              }}
            >
              <RiArrowLeftDoubleLine size={20} />

              <RiArrowLeftSLine size={20} />

              <span
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "7px",
                  background: BLUE,
                  color: "white",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </span>

              <RiArrowRightSLine size={20} />

              <RiArrowRightDoubleLine size={20} />
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "380px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#1F2937",
                }}
              >
                Konfirmasi
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#6B7280",
                marginBottom: "16px",
              }}
            >
              Apakah kamu yakin menghapus data ini? Berikan alasan!
            </div>

            <textarea
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(e.target.value);

                if (deleteError) {
                  setDeleteError("");
                }
              }}
              placeholder="Tulis di sini"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                border: `1px solid ${deleteError ? "#DC2626" : "#E5E7EB"}`,
                borderRadius: "8px",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />

            {deleteError && (
              <div
                style={{
                  color: "#DC2626",
                  fontSize: "11px",
                  marginTop: "4px",
                }}
              >
                {deleteError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "11px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  background: BLUE,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                YA, HAPUS DATA
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                TIDAK, KEMBALI
              </button>
            </div>
          </div>
        </div>
      )}

      {toggleTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "380px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <RiCloseLine
              size={18}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
              onClick={() => setToggleTarget(null)}
            />

            <div
              style={{
                textAlign: "center",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#1F2937",
                }}
              >
                Konfirmasi
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#6B7280",
                marginBottom: "18px",
              }}
            >
              {toggleTarget.status === "active"
                ? "Apakah kamu yakin ingin menonaktifkan data ini?"
                : "Apakah kamu yakin ingin mengaktifkan kembali data ini?"}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={confirmToggle}
                style={{
                  flex: 1,
                  padding: "11px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  background: BLUE,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {toggleTarget.status === "active"
                  ? "YA, NON-AKTIFKAN DATA"
                  : "YA, AKTIFKAN DATA"}
              </button>

              <button
                onClick={() => setToggleTarget(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid #E5E7EB",
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                TIDAK, KEMBALI
              </button>
            </div>
          </div>
        </div>
      )}

      {showDatePicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "480px",
              padding: "22px 24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#1F2937",
                }}
              >
                Pilih Rentang Tanggal
              </div>

              <RiCloseLine
                size={18}
                style={{
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
                onClick={() => setShowDatePicker(false)}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <MiniCalendar
                year={leftCal.year}
                month={leftCal.month}
                onPrev={() => shiftMonth(leftCal, setLeftCal, -1)}
                onNext={() => shiftMonth(leftCal, setLeftCal, 1)}
                selected={dateFrom}
                onSelectDate={(d) => setDateFrom(d)}
              />

              <MiniCalendar
                year={rightCal.year}
                month={rightCal.month}
                onPrev={() => shiftMonth(rightCal, setRightCal, -1)}
                onNext={() => shiftMonth(rightCal, setRightCal, 1)}
                selected={dateTo}
                onSelectDate={(d) => setDateTo(d)}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    marginBottom: "4px",
                  }}
                >
                  Date
                </div>

                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  {formatTanggalID(dateFrom)}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    marginBottom: "4px",
                  }}
                >
                  Sampai
                </div>

                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  {formatTanggalID(dateTo)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDatePicker(false)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "11px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                background: BLUE,
                color: "white",
                cursor: "pointer",
              }}
            >
              TERAPKAN
            </button>
          </div>
        </div>
      )}

      {detailUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#1F2937",
                }}
              >
                Detail Data User
              </div>

              <RiCloseLine
                size={20}
                style={{
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
                onClick={() => setDetailUser(null)}
              />
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <tbody>
                <DetailRow label="Title" value={detailUser.title} />

                <DetailRow label="Nama" value={detailUser.nama} />

                <DetailRow
                  label="No. Handphone"
                  value={`🇮🇩 ${detailUser.noHp}`}
                />

                <DetailRow label="Email" value={detailUser.email} />

                <DetailRow
                  label="Tanggal Lahir"
                  value={detailUser.tanggalLahir}
                />

                <DetailRow label="Roles" value={detailUser.roles} last />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

const thStyle = {
  padding: "14px 12px",
  fontWeight: 600,
  fontSize: "13px",
};

const tdStyle = {
  padding: "16px 12px",
};

function DetailRow({ label, value, last }) {
  return (
    <tr
      style={{
        borderBottom: last ? "none" : "1px solid #F3F4F6",
      }}
    >
      <td
        style={{
          padding: "12px 8px 12px 0",
          color: "#6B7280",
          fontWeight: 600,
          width: "40%",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>

      <td
        style={{
          padding: "12px 0",
          color: "#1F2937",
          fontWeight: 600,
        }}
      >
        {value}
      </td>
    </tr>
  );
}
