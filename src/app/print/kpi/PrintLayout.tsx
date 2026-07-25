"use client";

import { useEffect } from "react";
import "./print.css";

export function PrintLayout({ user, departmentName, criteria, periodText }: any) {
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  const totalMaxScore = criteria.reduce((sum: number, c: any) => sum + (c.weightPercent || 0), 0);

  return (
    <div className="print-container font-sans text-black bg-white p-8 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold uppercase">CÔNG TY DAFA GLASS</h2>
          <p className="text-sm">Phòng ban: {departmentName}</p>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">BIÊN BẢN ĐÁNH GIÁ KPI</h1>
          <p className="text-sm italic">Kỳ đánh giá: {periodText}</p>
        </div>
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      <div className="mb-6 space-y-2">
        <p><strong>Họ và tên nhân viên:</strong> {user.fullName}</p>
        <p><strong>Chức vụ:</strong> {user.jobTitle || "Nhân viên"}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-8 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 w-10 text-center">STT</th>
            <th className="border border-black px-2 py-2 text-left">Tiêu chí đánh giá</th>
            <th className="border border-black px-2 py-2 w-20 text-center">Đơn vị</th>
            <th className="border border-black px-2 py-2 w-24 text-center">Mục tiêu</th>
            <th className="border border-black px-2 py-2 w-20 text-center">Trọng số</th>
            <th className="border border-black px-2 py-2 w-28 text-center">Thực tế đạt</th>
            <th className="border border-black px-2 py-2 w-20 text-center">Điểm</th>
            <th className="border border-black px-2 py-2 w-32 text-center">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((crit: any, idx: number) => (
            <tr key={crit.id}>
              <td className="border border-black px-2 py-3 text-center">{idx + 1}</td>
              <td className="border border-black px-2 py-3">{crit.name}</td>
              <td className="border border-black px-2 py-3 text-center">{crit.unit}</td>
              <td className="border border-black px-2 py-3 text-center">{crit.targetValue}</td>
              <td className="border border-black px-2 py-3 text-center">{crit.weightPercent}</td>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
              <td className="border border-black px-2 py-3"></td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={4} className="border border-black px-2 py-3 text-right uppercase">Tổng cộng:</td>
            <td className="border border-black px-2 py-3 text-center">{totalMaxScore}</td>
            <td className="border border-black px-2 py-3 text-center bg-gray-100"></td>
            <td className="border border-black px-2 py-3 text-center"></td>
            <td className="border border-black px-2 py-3 text-center bg-gray-100"></td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between mt-12 px-8">
        <div className="text-center">
          <p className="font-bold mb-16">Nhân viên</p>
          <p className="text-sm italic">(Ký và ghi rõ họ tên)</p>
          <p className="mt-20 font-bold">{user.fullName}</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-16">Quản lý trực tiếp</p>
          <p className="text-sm italic">(Ký và ghi rõ họ tên)</p>
        </div>
        <div className="text-center">
          <p className="italic mb-1">Ngày ..... tháng ..... năm 20...</p>
          <p className="font-bold mb-16">Kế toán / HCNS</p>
          <p className="text-sm italic">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
