import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8000";
}

export async function POST(request: Request) {
  const apiUrl = resolveApiUrl();
  const body = await request.text();

  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
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
