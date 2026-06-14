import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}