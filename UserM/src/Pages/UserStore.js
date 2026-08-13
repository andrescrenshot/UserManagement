
let users = [
  {
    id: 1,
    title: "Nn",
    nama: "Siti Rahayu",
    noHp: "(+62) 812-1001-1100",
    email: "sitirahayu@gmail.com",
    tanggalLahir: "01-01-2001",
    roles: "Admin",
    status: "active",
  },
  {
    id: 2,
    title: "Tn",
    nama: "Agus Setiawan",
    noHp: "(+62) 812-1001-1101",
    email: "agussetiawan@gmail.com",
    tanggalLahir: "02-01-2001",
    roles: "Member",
    status: "active",
  },
  {
    id: 3,
    title: "Tn",
    nama: "Bambang Wijaya",
    noHp: "(+62) 812-1001-1102",
    email: "bambangwijaya@gmail.com",
    tanggalLahir: "03-01-2001",
    roles: "Member",
    status: "active",
  },
  {
    id: 4,
    title: "Ny",
    nama: "Sri Wahyuni",
    noHp: "(+62) 812-1001-1103",
    email: "sriwahyuni@gmail.com",
    tanggalLahir: "04-01-2001",
    roles: "Member",
    status: "active",
  },
  {
    id: 5,
    title: "Tn",
    nama: "Slamet Riyadi",
    noHp: "(+62) 812-1001-1104",
    email: "slametriyadi@gmail.com",
    tanggalLahir: "05-01-2001",
    roles: "Member",
    status: "active",
  },
];

let listeners = [];

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getUsers() {
  return users;
}

export function getUserById(id) {
  return users.find((u) => String(u.id) === String(id));
}

export function addUser(data) {
  const newUser = {
    ...data,
    id: Date.now(),
    status: "active",
  };
  users = [...users, newUser];
  notify();
  return newUser;
}

export function updateUser(id, data) {
  users = users.map((u) => (String(u.id) === String(id) ? { ...u, ...data } : u));
  notify();
}

export function deleteUser(id) {
  users = users.filter((u) => String(u.id) !== String(id));
  notify();
}

export function toggleStatus(id) {
  users = users.map((u) =>
    String(u.id) === String(id)
      ? { ...u, status: u.status === "active" ? "nonaktif" : "active" }
      : u
  );
  notify();
}