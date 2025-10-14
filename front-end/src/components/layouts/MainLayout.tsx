import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <>
      <Header />
      <div className="flex">
        <SideBar />
        <main className="flex-1 bg-white p-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
