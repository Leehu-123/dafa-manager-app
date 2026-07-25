import { PrismaClient, TaskPriority, TaskStatus, RecurrenceType, ReportFrequency, EvaluationCycle } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Clean up
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
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();

  // Create Company
  const company = await prisma.company.create({
    data: { name: 'DAFA Glass', code: 'DAFA', isActive: true }
  });

  // Create Roles
  const adminRole = await prisma.role.create({
    data: { companyId: company.id, name: 'ADMIN', description: 'Quản trị viên' }
  });
  const managerRole = await prisma.role.create({
    data: { companyId: company.id, name: 'MANAGER', description: 'Quản lý' }
  });
  const employeeRole = await prisma.role.create({
    data: { companyId: company.id, name: 'EMPLOYEE', description: 'Nhân viên' }
  });

  // Create Branches
  const laoCai = await prisma.branch.create({
    data: { companyId: company.id, name: 'Lào Cai', code: 'LC', city: 'Lào Cai', address: 'Trụ sở chính', isActive: true }
  });
  const haiPhong = await prisma.branch.create({
    data: { companyId: company.id, name: 'Hải Phòng', code: 'HP', city: 'Hải Phòng', isActive: false }
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
    data: { companyId: company.id, email: 'admin@dafaglass.com', passwordHash: hashedPassword, fullName: 'Nguyễn Văn A', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: adminRole.id } } }
  });
  
  const bich = await prisma.user.create({
    data: { companyId: company.id, email: 'bich.tran@dafaglass.com', passwordHash: hashedPassword, fullName: 'Trần Thị Bích', jobTitle: 'Kế toán kiêm HCNS', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: employeeRole.id } } }
  });
  
  const duc = await prisma.user.create({
    data: { companyId: company.id, email: 'duc.le@dafaglass.com', passwordHash: hashedPassword, fullName: 'Lê Minh Đức', jobTitle: 'Media', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: employeeRole.id } } }
  });
  
  const huong = await prisma.user.create({
    data: { companyId: company.id, email: 'huong.pham@dafaglass.com', passwordHash: hashedPassword, fullName: 'Phạm Thị Hương', jobTitle: 'Marketing & Sale Admin', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: employeeRole.id } } }
  });
  
  const thanh = await prisma.user.create({
    data: { companyId: company.id, email: 'thanh.nguyen@dafaglass.com', passwordHash: hashedPassword, fullName: 'Nguyễn Văn Thành', jobTitle: 'Quản lý kho', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: managerRole.id } } }
  });
  
  const dung = await prisma.user.create({
    data: { companyId: company.id, email: 'dung.hoang@dafaglass.com', passwordHash: hashedPassword, fullName: 'Hoàng Văn Dũng', jobTitle: 'Nhân viên kho', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: employeeRole.id } } }
  });
  
  const khoa = await prisma.user.create({
    data: { companyId: company.id, email: 'khoa.vu@dafaglass.com', passwordHash: hashedPassword, fullName: 'Vũ Đình Khoa', jobTitle: 'Kinh doanh/Sale', primaryBranchId: laoCai.id, isActive: true, userRoles: { create: { roleId: employeeRole.id } } }
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
    data: { companyId: company.id, title: 'Đối soát công nợ tháng 7', departmentId: ktHcns.id, branchId: laoCai.id, priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, createdById: admin.id }
  });
  await prisma.taskAssignee.create({ data: { taskId: t1.id, userId: bich.id } });

  const t4 = await prisma.task.create({
    data: { companyId: company.id, title: 'Kiểm kê tồn kho cuối tháng 7', departmentId: kho.id, branchId: laoCai.id, priority: TaskPriority.URGENT, status: TaskStatus.TODO, createdById: thanh.id }
  });
  await prisma.taskAssignee.createMany({ data: [{ taskId: t4.id, userId: thanh.id }, { taskId: t4.id, userId: dung.id }] });

  // KPI Criteria
  // KHO
  await prisma.kpiCriteria.createMany({
    data: [
      { companyId: company.id, departmentId: kho.id, name: 'Độ chính xác tồn kho', unit: '%', targetValue: 99, weightPercent: 40, evaluationCycle: EvaluationCycle.MONTHLY },
      { companyId: company.id, departmentId: kho.id, name: 'Thời gian xử lý xuất/nhập', unit: 'giờ', targetValue: 4, weightPercent: 30, evaluationCycle: EvaluationCycle.MONTHLY }
    ]
  });

  // Report Templates
  await prisma.reportTemplate.createMany({
    data: [
      { companyId: company.id, departmentId: kho.id, name: 'Báo cáo kho hàng ngày', frequency: ReportFrequency.DAILY, fieldsConfig: [{ name: 'Số đơn nhập', type: 'number' }, { name: 'Số đơn xuất', type: 'number' }] },
      { companyId: company.id, departmentId: kd.id, name: 'Báo cáo sale tuần', frequency: ReportFrequency.WEEKLY, fieldsConfig: [{ name: 'Khách hàng tiếp cận', type: 'number' }, { name: 'Doanh số', type: 'number' }] }
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
