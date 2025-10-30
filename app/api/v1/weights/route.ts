import { NextRequest, NextResponse } from "next/server";
import { getCurrentWeights, setCurrentWeights } from "@/lib/rgr/runtime-weights";
import { handleError, ValidationError } from "@/lib/backend/errors";

export async function GET() {
  return NextResponse.json({ weights: getCurrentWeights() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      throw new ValidationError("Body must be a JSON object with weight fields");
    }
    const updated = setCurrentWeights(body);
    return NextResponse.json({ weights: updated });
  } catch (error) {
    return handleError(error);
  }
}


