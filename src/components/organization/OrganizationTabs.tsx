"use client";

import { useState } from "react";
import { OrgTreeView } from "./OrgTreeView";
import { DepartmentList } from "./DepartmentList";
import { EmployeeList } from "./EmployeeList";

export function OrganizationTabs() {
  const [activeTab, setActiveTab] = useState<"tree" | "departments" | "employees">("tree");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("tree")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tree"
              ? "border-[#A14F39] text-[#A14F39]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Sơ đồ tổ chức
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "departments"
              ? "border-[#A14F39] text-[#A14F39]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Chi nhánh & Phòng ban
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "employees"
              ? "border-[#A14F39] text-[#A14F39]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Nhân sự
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "tree" && <OrgTreeView />}
        {activeTab === "departments" && <DepartmentList />}
        {activeTab === "employees" && <EmployeeList />}
      </div>
    </div>
  );
}
