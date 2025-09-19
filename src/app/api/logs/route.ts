import { NextResponse } from "next/server";
import { getNotionLogs } from "@/lib/notion";

export async function GET() {
  try {
    const logs = await getNotionLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json([], { status: 500 });
  }
}