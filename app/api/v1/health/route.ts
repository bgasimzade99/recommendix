import { NextResponse } from "next/server";
import pkg from "@/package.json" assert { type: "json" };

let bootTime = Date.now();

export async function GET() {
	const uptimeSeconds = Math.floor(process.uptime());
	// Basic placeholder; integrate with real metrics if available
	const requestsPerMinute = 0;
	const modelVersion = (pkg as unknown as { version?: string }).version ?? "1.0.0";

	return NextResponse.json({
		status: "healthy",
		model_version: modelVersion,
		uptime_seconds: uptimeSeconds,
		requests_per_minute: requestsPerMinute,
	});
}
