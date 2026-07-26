"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function KpiTabs({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Bảng điều khiển", href: "/kpi" },
  ];

  if (userRole !== "EMPLOYEE") {
    tabs.push({ name: "Đánh giá nhân viên", href: "/kpi/entry" });
    tabs.push({ name: "Duyệt Phiếu KPI", href: "/kpi/approval" });
  }
  
  if (userRole === "ADMIN" || userRole === "OWNER") {
    tabs.push({ name: "Cài đặt tiêu chí", href: "/kpi/criteria" });
  }

  return (
    <div className="flex gap-4 border-b border-gray-200 mb-6">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link 
            key={tab.href} 
            href={tab.href}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              isActive 
                ? "border-[#A14F39] text-[#A14F39]" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
