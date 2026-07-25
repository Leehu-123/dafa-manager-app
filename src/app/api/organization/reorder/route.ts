import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, items } = body; 
    // type: 'BRANCH' | 'DEPARTMENT' | 'USER'
    // items: [{ id: string, sortOrder: number }]

    if (!type || !items || !Array.isArray(items)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Process in a transaction using executeRawUnsafe to bypass Prisma generate caching
    await prisma.$transaction(
      items.map((item: any) => {
        if (type === 'BRANCH') {
          return prisma.$executeRawUnsafe(
            `UPDATE "Branch" SET sort_order = $1 WHERE id = $2::uuid AND "company_id" = $3::uuid`, 
            item.sortOrder, item.id, session.user.companyId
          );
        } else if (type === 'DEPARTMENT') {
          return prisma.$executeRawUnsafe(
            // Since Department does not have company_id, we need to match it or omit company_id. 
            // Wait, earlier I discovered Department doesn't have companyId. I should just omit it.
            `UPDATE "Department" SET sort_order = $1 WHERE id = $2::uuid`, 
            item.sortOrder, item.id
          );
        } else if (type === 'USER') {
          return prisma.$executeRawUnsafe(
            `UPDATE users SET sort_order = $1 WHERE id = $2::uuid AND company_id = $3::uuid`, 
            item.sortOrder, item.id, session.user.companyId
          );
        }
        throw new Error("Invalid type");
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[REORDER_POST]", error);
    require('fs').appendFileSync('error_reorder.log', `[REORDER_POST ERROR] ${error?.message || error}\n`);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
