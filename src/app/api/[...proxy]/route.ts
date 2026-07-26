import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  return handleProxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  return handleProxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  return handleProxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  return handleProxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  return handleProxy(req, params);
}

async function handleProxy(req: NextRequest, paramsPromise: Promise<{ proxy: string[] }>) {
  try {
    let token: string | undefined;
    try {
      const tokenObj = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dafa-warehouse-secret-key-2024"
      });
      if (tokenObj?.accessToken) {
        token = tokenObj.accessToken as string;
      }
    } catch (e) {
      // Ignore
    }

    if (!token) {
      const session = await auth();
      token = session?.user?.accessToken;
    }
    
    // params is a Promise in Next 15, await it
    const params = await paramsPromise;
    const path = params.proxy.join("/");
    
    // Xử lý query params
    const url = new URL(req.url);
    const search = url.search;
    
    const API_URL = process.env.CORE_API_URL || 'http://localhost:3003';
    
    // Ánh xạ đường dẫn cũ sang API mới của Core API
    let coreApiPath = `/${path}`;
    
    // Mapping các route cũ của NextJS sang Core API
    if (path.startsWith("organization/employees")) {
      coreApiPath = coreApiPath.replace("organization/employees", "users");
    } else if (path.startsWith("organization/branches")) {
      coreApiPath = coreApiPath.replace("organization/branches", "branches");
    } else if (path.startsWith("tasks")) {
      coreApiPath = coreApiPath.replace("tasks", "dafa-tasks");
    } else if (path.startsWith("kpi/criteria")) {
      coreApiPath = coreApiPath.replace("kpi/criteria", "kpi-criteria");
    } else if (path.startsWith("kpi/records")) {
      coreApiPath = coreApiPath.replace("kpi/records", "kpi-records");
    } else if (path.startsWith("kpi/approve")) {
      coreApiPath = coreApiPath.replace("kpi/approve", "kpi-records/approve");
    } else if (path.startsWith("kpi/pending")) {
      coreApiPath = coreApiPath.replace("kpi/pending", "kpi-records/pending");
    } else if (path.startsWith("kpi/bulk")) {
      coreApiPath = coreApiPath.replace("kpi/bulk", "kpi-records/bulk");
    } else if (path.startsWith("kpi/delete-sheet")) {
      coreApiPath = coreApiPath.replace("kpi/delete-sheet", "kpi-records/delete-sheet");
    } else if (path.startsWith("settings/company")) {
      coreApiPath = coreApiPath.replace("settings/company", "companies/me");
    } else if (path.startsWith("profile/telegram")) {
      coreApiPath = coreApiPath.replace("profile/telegram", "users/profile");
    } else if (path.startsWith("reports/templates")) {
      coreApiPath = coreApiPath.replace("reports/templates", "report-templates");
    } else if (path.startsWith("reports")) {
      // Must be after reports/templates to not break it
      coreApiPath = coreApiPath.replace("reports", "work-reports");
    }
    // Các route khác như /departments giữ nguyên
    
    const targetUrl = `${API_URL}${coreApiPath}${search}`;
    
    const headers = new Headers(req.headers);
    headers.delete("host"); // Tránh lỗi host mismatch
    headers.delete("content-length"); // Avoid request content-length mismatch in Node fetch
    headers.delete("transfer-encoding");
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let body = null;
    let reqHeaders = headers;
    
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.headers.get("content-type")?.includes("application/json")) {
        let jsonBody = await req.json();
        
        // Transform payload for employees -> users
        if (path.startsWith("organization/employees")) {
          delete jsonBody.id;
          if (jsonBody.name !== undefined) {
            if (!jsonBody.fullName) jsonBody.fullName = jsonBody.name;
            delete jsonBody.name;
          }
          if (jsonBody.role !== undefined) {
            if (!jsonBody.roleNames || jsonBody.roleNames.length === 0) {
              jsonBody.roleNames = [jsonBody.role.toLowerCase()];
            }
            delete jsonBody.role;
          }
          if (!jsonBody.password || jsonBody.password.trim() === "") {
            delete jsonBody.password;
          }
        }
        
        body = JSON.stringify(jsonBody);
        reqHeaders.set("Content-Type", "application/json");
      } else {
        body = Buffer.from(await req.arrayBuffer());
      }
    }

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: reqHeaders,
      body,
      // redirect: "manual",
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.set("X-Debug-Token", token ? "YES" : "NO");
    responseHeaders.set("X-Debug-Target-Url", targetUrl);

    let responseBody = await res.text();
    
    console.log(`[PROXY] ${req.method} ${targetUrl} -> Status: ${res.status}, Token: ${token ? 'YES (' + token.substring(0,20) + '...)' : 'NO'}`);
    console.log(`[PROXY] Response body (first 500 chars):`, responseBody.substring(0, 500));
    if (res.status !== 200 && res.status !== 201) {
      console.log(`[PROXY ERR] Full Response:`, responseBody);
    }
    
    // Tự động unwrap success: true, data: {...} từ Core API cho frontend cũ
    try {
      if (responseHeaders.get('content-type')?.includes('application/json')) {
        const json = JSON.parse(responseBody);
        if (json && json.success !== undefined && 'data' in json) {
          responseBody = JSON.stringify(json.data);
        }
      }
    } catch (e) {
      // Ignored
    }

    return new NextResponse(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request", details: error.message },
      { status: 500 }
    );
  }
}
