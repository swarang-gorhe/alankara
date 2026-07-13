import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8000";
}

export async function GET(request: Request) {
  const apiUrl = resolveApiUrl();
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({ detail: "Missing authorization" }, { status: 401 });
  }

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the API. Check NEXT_PUBLIC_API_URL and that the backend is running." },
      { status: 503 },
    );
  }
}
