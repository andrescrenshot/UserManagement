import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Component/Layout";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import TambahUser from "./Pages/TambahUser";
import EditUser from "./Pages/EditUser";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Profile" element={<Profile />} />{" "}
          <Route path="/dashboard/tambah" element={<TambahUser />} />
          <Route path="/dashboard/edit/:id" element={<EditUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
