import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const distinctLocations = await prisma.job
      .findMany({
        where: { approved: true },
        select: { location: true },
        distinct: ["location"],
      })
      .then((locations) =>
        locations.map(({ location }) => location).filter(Boolean),
      );

    return NextResponse.json(distinctLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}