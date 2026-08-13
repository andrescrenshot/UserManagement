import { Outlet } from "react-router-dom";
import SideBar from "../Component/SideBar";
export default function Layout() {
  return (
    <div style={{ display: "flex", background: "#F5F6FA", minHeight: "100vh" }}>
      <SideBar />

      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}