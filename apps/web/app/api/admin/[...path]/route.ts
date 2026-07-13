import { NextRequest, NextResponse } from "next/server";

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8000";
}

const BLOCKED_SEGMENTS = new Set([".", ".."]);

function sanitizePathSegments(pathSegments: string[]): string[] | null {
  for (const segment of pathSegments) {
    const decoded = decodeURIComponent(segment);
    if (
      BLOCKED_SEGMENTS.has(segment) ||
      BLOCKED_SEGMENTS.has(decoded) ||
      segment.includes("\\") ||
      decoded.includes("/")
    ) {
      return null;
    }
  }
  return pathSegments;
}

function buildAdminTargetUrl(apiUrl: string, pathSegments: string[], search: string): URL | null {
  const safeSegments = sanitizePathSegments(pathSegments);
  if (!safeSegments) {
    return null;
  }

  const subPath = safeSegments.join("/");
  const target = new URL(`${apiUrl}/admin/${subPath}${search}`);
  if (!target.pathname.startsWith("/admin/") && target.pathname !== "/admin") {
    return null;
  }
  return target;
}

async function proxyAdmin(request: NextRequest, pathSegments: string[]) {
  const apiUrl = resolveApiUrl();
  const search = request.nextUrl.search;
  const target = buildAdminTargetUrl(apiUrl, pathSegments, search);

  if (!target) {
    return NextResponse.json({ detail: "Invalid admin path" }, { status: 400 });
  }

  const headers = new Headers();
  headers.set("Accept", "application/json");

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(target.toString(), init);
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Could not reach the API. Check NEXT_PUBLIC_API_URL and that the backend is running.",
      },
      { status: 503 },
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAdmin(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAdmin(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAdmin(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAdmin(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAdmin(request, path);
}
