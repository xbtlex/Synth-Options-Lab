/**
 * Server-side Synth API proxy
 * Routes all client requests to Synth with API key from environment
 * Never expose SYNTH_API_KEY to client
 */

import { NextRequest, NextResponse } from "next/server";

const SYNTH_API_BASE = "https://api.synthdata.co";
const SYNTH_API_KEY = process.env.SYNTH_API_KEY;

// Map of valid proxy endpoints
const VALID_ENDPOINTS = [
  "option-pricing",
  "percentiles",
  "prediction-percentiles",
  "volatility",
  "lp-probabilities",
  "lp-bounds",
  "liquidation",
  "polymarket/up-down/daily",
  "polymarket/up-down/hourly",
  "polymarket/range",
];

function isValidEndpoint(path: string): boolean {
  return VALID_ENDPOINTS.some((ep) => path.includes(ep));
}

async function proxyRequest(endpoint: string, queryParams: URLSearchParams) {
  if (!SYNTH_API_KEY) {
    throw new Error("SYNTH_API_KEY not configured");
  }

  const synthUrl = new URL(`${SYNTH_API_BASE}/v1/${endpoint}`);
  synthUrl.search = queryParams.toString();

  const response = await fetch(synthUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SYNTH_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Synth API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    // Reconstruct endpoint from path segments
    const endpoint = path.join("/");

    // Validate endpoint
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Invalid endpoint", endpoint },
        { status: 400 }
      );
    }

    // Extract query parameters from request URL
    const searchParams = request.nextUrl.searchParams;

    // Proxy the request to Synth API
    const data = await proxyRequest(endpoint, searchParams);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60", // Cache for 60s
      },
    });
  } catch (error) {
    console.error("[API Error]", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Proxy request failed",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");

    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Invalid endpoint", endpoint },
        { status: 400 }
      );
    }

    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;

    if (!SYNTH_API_KEY) {
      throw new Error("SYNTH_API_KEY not configured");
    }

    const synthUrl = new URL(`${SYNTH_API_BASE}/v1/${endpoint}`);
    synthUrl.search = searchParams.toString();

    const response = await fetch(synthUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SYNTH_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Synth API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("[API Error]", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Proxy request failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
