import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, code, address, city, isActive } = body;

    const branch = await prisma.branch.update({
      where: { id, companyId: session.user.companyId },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("[BRANCHES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.branch.delete({
      where: { id, companyId: session.user.companyId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BRANCHES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
