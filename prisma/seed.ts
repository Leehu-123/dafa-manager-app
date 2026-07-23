import { PrismaClient, Role, UserStatus, TaskPriority, TaskStatus, RecurrenceType, ReportFrequency, EvaluationCycle } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Clean up existing data to prevent duplicate seed issues (order matters due to constraints)
  await prisma.notification.deleteMany();
  await prisma.kpiRecord.deleteMany();
  await prisma.kpiCriteria.deleteMany();
  await prisma.workReport.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.taskHistory.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.departmentMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.branch.deleteMany();

  // Create Branches
  const laoCai = await prisma.branch.create({
    data: { name: 'Lào Cai', code: 'LC', city: 'Lào Cai', address: 'Trụ sở chính', isActive: true }
  });
  const haiPhong = await prisma.branch.create({
    data: { name: 'Hải Phòng', code: 'HP', city: 'Hải Phòng', isActive: false }
  });
  const haNoi = await prisma.branch.create({
    data: { name: 'Hà Nội', code: 'HN', city: 'Hà Nội', isActive: false }
  });
  const daNang = await prisma.branch.create({
    data: { name: 'Đà Nẵng', code: 'DN', city: 'Đà Nẵng', isActive: false }
  });
  const hcm = await prisma.branch.create({
    data: { name: 'TP. Hồ Chí Minh', code: 'HCM', city: 'TP. Hồ Chí Minh', isActive: false }
  });

  // Create Departments (under Lào Cai)
  const ktHcns = await prisma.department.create({
    data: { name: 'Kế toán - Hành chính nhân sự', code: 'KT-HCNS', branchId: laoCai.id }
  });
  const media = await prisma.department.create({
    data: { name: 'Media', code: 'MEDIA', branchId: laoCai.id }
  });
  const mktSa = await prisma.department.create({
    data: { name: 'Marketing & Sale Admin', code: 'MKT-SA', branchId: laoCai.id }
  });
  const kho = await prisma.department.create({
    data: { name: 'Kho vận', code: 'KHO', branchId: laoCai.id }
  });
  const kd = await prisma.department.create({
    data: { name: 'Kinh doanh', code: 'KD', branchId: laoCai.id }
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('dafa2024', 12);
  
  const admin = await prisma.user.create({
    data: { email: 'admin@dafaglass.com', passwordHash: hashedPassword, fullName: 'Nguyễn Văn A', role: Role.ADMIN, primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const bich = await prisma.user.create({
    data: { email: 'bich.tran@dafaglass.com', passwordHash: hashedPassword, fullName: 'Trần Thị Bích', role: Role.EMPLOYEE, jobTitle: 'Kế toán kiêm HCNS', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const duc = await prisma.user.create({
    data: { email: 'duc.le@dafaglass.com', passwordHash: hashedPassword, fullName: 'Lê Minh Đức', role: Role.EMPLOYEE, jobTitle: 'Media', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const huong = await prisma.user.create({
    data: { email: 'huong.pham@dafaglass.com', passwordHash: hashedPassword, fullName: 'Phạm Thị Hương', role: Role.EMPLOYEE, jobTitle: 'Marketing & Sale Admin', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const thanh = await prisma.user.create({
    data: { email: 'thanh.nguyen@dafaglass.com', passwordHash: hashedPassword, fullName: 'Nguyễn Văn Thành', role: Role.MANAGER, jobTitle: 'Quản lý kho', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const dung = await prisma.user.create({
    data: { email: 'dung.hoang@dafaglass.com', passwordHash: hashedPassword, fullName: 'Hoàng Văn Dũng', role: Role.EMPLOYEE, jobTitle: 'Nhân viên kho', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });
  
  const khoa = await prisma.user.create({
    data: { email: 'khoa.vu@dafaglass.com', passwordHash: hashedPassword, fullName: 'Vũ Đình Khoa', role: Role.EMPLOYEE, jobTitle: 'Kinh doanh/Sale', primaryBranchId: laoCai.id, status: UserStatus.ACTIVE }
  });

  // Department Members
  await prisma.departmentMember.createMany({
    data: [
      { departmentId: ktHcns.id, userId: bich.id, isHead: true },
      { departmentId: media.id, userId: duc.id, isHead: false },
      { departmentId: mktSa.id, userId: huong.id, isHead: true },
      { departmentId: kho.id, userId: thanh.id, isHead: true },
      { departmentId: kho.id, userId: dung.id, isHead: false },
      { departmentId: kd.id, userId: khoa.id, isHead: false }
    ]
  });

  // Tasks
  const t1 = await prisma.task.create({
    data: { title: 'Đối soát công nợ tháng 7', departmentId: ktHcns.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, createdById: admin.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t1.id, userId: bich.id } });

  const t2 = await prisma.task.create({
    data: { title: 'Quay video giới thiệu kính Low-E mới', departmentId: media.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.TODO, createdById: admin.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t2.id, userId: duc.id } });

  const t3 = await prisma.task.create({
    data: { title: 'Đăng bài Facebook/TikTok tuần 29', departmentId: mktSa.id, branchId: laoCai.id, priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS, createdById: admin.id, isRecurring: true, recurrenceType: RecurrenceType.WEEKLY }
  });
  await prisma.taskAssignee.create({ data: { taskId: t3.id, userId: huong.id } });

  const t4 = await prisma.task.create({
    data: { title: 'Kiểm kê tồn kho cuối tháng 7', departmentId: kho.id, branchId: laoCai.id, priority: TaskPriority.URGENT, status: TaskStatus.TODO, createdById: thanh.id }
  });
  await prisma.taskAssignee.createMany({ data: [{ taskId: t4.id, userId: thanh.id }, { taskId: t4.id, userId: dung.id }] });

  const t5 = await prisma.task.create({
    data: { title: 'Lập báo giá cho khách hàng Vingroup', departmentId: kd.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.REVIEW, createdById: khoa.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t5.id, userId: khoa.id } });

  const t6 = await prisma.task.create({
    data: { title: 'Cập nhật hồ sơ nhân sự Q3', departmentId: ktHcns.id, branchId: laoCai.id, priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, createdById: bich.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t6.id, userId: bich.id } });

  const t7 = await prisma.task.create({
    data: { title: 'Chụp ảnh sản phẩm kính phản quang', departmentId: media.id, branchId: laoCai.id, priority: TaskPriority.MEDIUM, status: TaskStatus.DONE, createdById: duc.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t7.id, userId: duc.id } });

  const t8 = await prisma.task.create({
    data: { title: 'Xử lý đơn xuất kho #DH-0720-001', departmentId: kho.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.DONE, createdById: thanh.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t8.id, userId: dung.id } });

  const t9 = await prisma.task.create({
    data: { title: 'Báo cáo doanh số tuần 29', departmentId: kd.id, branchId: laoCai.id, priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, createdById: khoa.id, isRecurring: true, recurrenceType: RecurrenceType.WEEKLY }
  });
  await prisma.taskAssignee.create({ data: { taskId: t9.id, userId: khoa.id } });

  const t10 = await prisma.task.create({
    data: { title: 'Nhập kho lô hàng kính cường lực 12mm', departmentId: kho.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, createdById: thanh.id }
  });
  await prisma.taskAssignee.createMany({ data: [{ taskId: t10.id, userId: thanh.id }, { taskId: t10.id, userId: dung.id }] });

  // KPI Criteria
  // KT-HCNS
  await prisma.kpiCriteria.createMany({
    data: [
      { departmentId: ktHcns.id, name: 'Tỷ lệ chứng từ hoàn thành đúng hạn', unit: '%', targetValue: 95, weightPercent: 40, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: ktHcns.id, name: 'Tỷ lệ hồ sơ nhân sự xử lý đúng hạn', unit: '%', targetValue: 95, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: ktHcns.id, name: 'Sai sót công nợ', unit: 'số lần', targetValue: 0, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // MEDIA
  await prisma.kpiCriteria.createMany({
    data: [
      { departmentId: media.id, name: 'Số video/ảnh hoàn thành', unit: 'sản phẩm', targetValue: 20, weightPercent: 40, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: media.id, name: 'Thời gian hoàn thành trung bình', unit: 'ngày', targetValue: 3, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: media.id, name: 'Chất lượng nội dung', unit: 'điểm 1-10', targetValue: 8, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // MKT-SA
  await prisma.kpiCriteria.createMany({
    data: [
      { departmentId: mktSa.id, name: 'Số bài đăng đúng lịch', unit: 'bài', targetValue: 12, weightPercent: 25, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: mktSa.id, name: 'Số lead thu về', unit: 'lead', targetValue: 30, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: mktSa.id, name: 'Thời gian phản hồi KH', unit: 'giờ', targetValue: 2, weightPercent: 20, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: mktSa.id, name: 'Hoàn tất báo giá đúng hạn', unit: '%', targetValue: 95, weightPercent: 25, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // KHO
  await prisma.kpiCriteria.createMany({
    data: [
      { departmentId: kho.id, name: 'Độ chính xác tồn kho', unit: '%', targetValue: 99, weightPercent: 40, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kho.id, name: 'Thời gian xử lý xuất/nhập', unit: 'giờ', targetValue: 4, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kho.id, name: 'Tỷ lệ giao đúng hạn', unit: '%', targetValue: 95, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kho.id, name: 'Số đơn xử lý/ngày', unit: 'đơn', targetValue: 15, weightPercent: 50, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kho.id, name: 'Tỷ lệ sai sót xuất/nhập', unit: '%', targetValue: 2, weightPercent: 50, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // KD
  await prisma.kpiCriteria.createMany({
    data: [
      { departmentId: kd.id, name: 'Doanh số', unit: 'triệu VNĐ', targetValue: 500, weightPercent: 35, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kd.id, name: 'Khách hàng mới', unit: 'KH', targetValue: 10, weightPercent: 25, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kd.id, name: 'Tỷ lệ chốt đơn', unit: '%', targetValue: 30, weightPercent: 25, evaluationCycle: EvaluationCycle.MONTHLY },
      { departmentId: kd.id, name: 'Giá trị đơn TB', unit: 'triệu VNĐ', targetValue: 50, weightPercent: 15, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // Report Templates
  await prisma.reportTemplate.createMany({
    data: [
      { departmentId: kho.id, name: 'Báo cáo kho hàng ngày', frequency: ReportFrequency.DAILY, fieldsConfig: [{ name: 'Số đơn nhập', type: 'number' }, { name: 'Số đơn xuất', type: 'number' }, { name: 'Tồn kho bất thường', type: 'text' }, { name: 'Ghi chú', type: 'text' }] },
      { departmentId: kd.id, name: 'Báo cáo sale tuần', frequency: ReportFrequency.WEEKLY, fieldsConfig: [{ name: 'Khách hàng tiếp cận', type: 'number' }, { name: 'Báo giá gửi', type: 'number' }, { name: 'Đơn chốt', type: 'number' }, { name: 'Doanh số', type: 'number' }, { name: 'Vướng mắc', type: 'text' }] },
      { departmentId: mktSa.id, name: 'Báo cáo marketing tuần', frequency: ReportFrequency.WEEKLY, fieldsConfig: [{ name: 'Bài đăng', type: 'number' }, { name: 'Reach/Impressions', type: 'number' }, { name: 'Lead mới', type: 'number' }, { name: 'Chi phí quảng cáo', type: 'number' }, { name: 'Kế hoạch tuần sau', type: 'text' }] }
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
