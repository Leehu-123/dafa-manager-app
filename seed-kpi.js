const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error("No company found.");
    return;
  }

  const departments = await prisma.department.findMany();

  const depMap = {};
  for (const dep of departments) {
    depMap[dep.code] = dep.id;
  }

  const kpis = [];

  // Kho (KHO)
  if (depMap['KHO']) {
    kpis.push(
      { name: "Sai lệch tồn kho", description: "Sai lệch <= 0.2% giá trị kho. Quản lý: Trừ 20-30% nếu giao sai.", unit: "%", targetValue: 0.2, weightPercent: 30, evaluationCycle: "MONTHLY", departmentId: depMap['KHO'], companyId: company.id },
      { name: "Xuất hàng đúng tiến độ", description: ">=98% đơn giao đúng giờ.", unit: "%", targetValue: 98, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['KHO'], companyId: company.id },
      { name: "Hàng hỏng vỡ", description: "<=0.15% doanh thu xuất kho. NV: Làm vỡ trừ 20-50%.", unit: "%", targetValue: 0.15, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['KHO'], companyId: company.id },
      { name: "Hồ sơ nhập xuất đầy đủ", description: "100% chứng từ trong ngày. Không cập nhật trong ngày trừ 10%.", unit: "%", targetValue: 100, weightPercent: 15, evaluationCycle: "MONTHLY", departmentId: depMap['KHO'], companyId: company.id },
      { name: "5S & an toàn kho", description: "Kho sạch sẽ, không vi phạm. Mất vệ sinh nhiều lần trừ 5%.", unit: "%", targetValue: 100, weightPercent: 15, evaluationCycle: "MONTHLY", departmentId: depMap['KHO'], companyId: company.id }
    );
  }

  // Kinh doanh (KD)
  if (depMap['KD']) {
    kpis.push(
      { name: "Doanh số đơn hàng", description: "Mức 100%. Hoa hồng: <500tr (0.5%), 500tr-1 tỷ (0.7%), >1 tỷ (1%). Đạt >=80% nhận 100% lương cứng, 50-80% nhận 80%, <50% nhận 50%.", unit: "VNĐ", targetValue: 1000000000, weightPercent: 100, evaluationCycle: "MONTHLY", departmentId: depMap['KD'], companyId: company.id },
      { name: "Đại lý mới mở", description: "Thưởng nóng 500k/đại lý.", unit: "Đại lý", targetValue: 5, weightPercent: 0, evaluationCycle: "MONTHLY", departmentId: depMap['KD'], companyId: company.id },
      { name: "Chăm sóc KH (Tần suất)", description: "Duy trì sức mua ổn định 3 tháng liên tục thưởng 1tr.", unit: "Lần", targetValue: 100, weightPercent: 0, evaluationCycle: "MONTHLY", departmentId: depMap['KD'], companyId: company.id }
    );
  }

  // KT-HCNS
  if (depMap['KT-HCNS']) {
    kpis.push(
      { name: "Đảm bảo thời gian tính lương & thưởng", description: "100% đúng hạn trước ngày mùng 5 hàng tháng.", unit: "%", targetValue: 100, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['KT-HCNS'], companyId: company.id },
      { name: "Tính chính xác của chứng từ, thu chi", description: "Sai sót = 0", unit: "Lỗi", targetValue: 0, weightPercent: 30, evaluationCycle: "MONTHLY", departmentId: depMap['KT-HCNS'], companyId: company.id },
      { name: "Tuyển dụng & Đào tạo hội nhập", description: "Hoàn thành >90% định biên nhân sự theo yêu cầu.", unit: "%", targetValue: 90, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['KT-HCNS'], companyId: company.id },
      { name: "Quản lý hành chính & Văn hóa công ty", description: "1-2 sự kiện/tháng, môi trường làm việc tốt.", unit: "Sự kiện", targetValue: 1, weightPercent: 15, evaluationCycle: "MONTHLY", departmentId: depMap['KT-HCNS'], companyId: company.id },
      { name: "Tuân thủ nội quy & 5S văn phòng", description: "Không vi phạm.", unit: "%", targetValue: 100, weightPercent: 15, evaluationCycle: "MONTHLY", departmentId: depMap['KT-HCNS'], companyId: company.id }
    );
  }

  // MKT-SA
  if (depMap['MKT-SA']) {
    kpis.push(
      { name: "Số lượng Leads", description: "Đạt 100% số lượng giao đầu tháng.", unit: "Lead", targetValue: 100, weightPercent: 35, evaluationCycle: "MONTHLY", departmentId: depMap['MKT-SA'], companyId: company.id },
      { name: "Chi phí trên mỗi Lead (CPL)", description: "Không vượt quá ngân sách phê duyệt.", unit: "VNĐ", targetValue: 50000, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['MKT-SA'], companyId: company.id },
      { name: "Tỷ lệ chuyển đổi", description: "Lead to Sales > 15%.", unit: "%", targetValue: 15, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['MKT-SA'], companyId: company.id },
      { name: "Xử lý hợp đồng & Đơn hàng (Sale Admin)", description: "100% đơn hàng lên hệ thống đúng tiến độ, không sai lệch.", unit: "%", targetValue: 100, weightPercent: 15, evaluationCycle: "MONTHLY", departmentId: depMap['MKT-SA'], companyId: company.id },
      { name: "Sáng tạo nội dung (Content)", description: "Đạt KPI về lượng tương tác trên Fanpage/Web.", unit: "Bài", targetValue: 30, weightPercent: 10, evaluationCycle: "MONTHLY", departmentId: depMap['MKT-SA'], companyId: company.id }
    );
  }

  // MEDIA
  if (depMap['MEDIA']) {
    kpis.push(
      { name: "Tiến độ sản xuất Video / Ấn phẩm", description: "100% hoàn thành đúng deadline yêu cầu từ MKT.", unit: "%", targetValue: 100, weightPercent: 40, evaluationCycle: "MONTHLY", departmentId: depMap['MEDIA'], companyId: company.id },
      { name: "Chất lượng ấn phẩm (Tương tác / View)", description: "Đạt mốc view/tương tác cam kết cho từng chiến dịch.", unit: "View", targetValue: 10000, weightPercent: 30, evaluationCycle: "MONTHLY", departmentId: depMap['MEDIA'], companyId: company.id },
      { name: "Số lượng kịch bản / Ý tưởng viral sáng tạo", description: "2-3 ý tưởng đột phá mỗi tháng.", unit: "Kịch bản", targetValue: 2, weightPercent: 20, evaluationCycle: "MONTHLY", departmentId: depMap['MEDIA'], companyId: company.id },
      { name: "Quản lý & Bảo quản thiết bị quay chụp", description: "0 hỏng hóc do lỗi bất cẩn, thiết bị luôn sẵn sàng.", unit: "Lỗi", targetValue: 0, weightPercent: 10, evaluationCycle: "MONTHLY", departmentId: depMap['MEDIA'], companyId: company.id }
    );
  }

  try {
    for (const data of kpis) {
      await prisma.kpiCriteria.create({ data });
    }
    console.log("Successfully seeded", kpis.length, "KPI criteria.");
  } catch(e) {
    console.error("Error seeding:", e);
  }
}
main().then(() => process.exit(0));
