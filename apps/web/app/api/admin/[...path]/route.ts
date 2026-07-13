import { NextRequest, NextResponse } from "next/server";

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8000";
}

async function proxyAdmin(request: NextRequest, pathSegments: string[]) {
  const apiUrl = resolveApiUrl();
  const subPath = pathSegments.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${apiUrl}/admin/${subPath}${search}`;

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
    const res = await fetch(targetUrl, init);
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
