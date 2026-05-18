import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Strapi webhook events
    const { event, model, entry } = body;
    
    if (!event || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine tenant from entry data or default
    const tenant = entry?.tenant || "default";

    // Revalidate based on model type
    switch (model) {
      case "page":
        if (entry?.slug) {
          revalidateTag(`page-${tenant}-${entry.slug}`);
        }
        break;
      case "navigation":
        revalidateTag(`nav-${tenant}`);
        break;
      default:
        // Generic collection revalidation
        revalidateTag(`collection-${tenant}-${model}`);
    }

    return NextResponse.json({
      received: true,
      revalidated: true,
      model,
      event,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
