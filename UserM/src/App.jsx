import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Component/Layout";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import TambahUser from "./Pages/UserTambah";
import EditUser from "./Pages/EditUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/tambah" element={<TambahUser />} />
          <Route path="/dashboard/edit/:id" element={<EditUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;