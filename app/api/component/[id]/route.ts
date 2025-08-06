import { type NextRequest, NextResponse } from "next/server";

// Same in-memory storage reference
const components = new Map<
  string,
  { id: string; code: string; createdAt: Date; updatedAt: Date }
>();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: "Component ID is required" }, { status: 400 });
    }

    const component = components.get(id);

    if (!component) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error("Error fetching component:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch component",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: "Component ID is required" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });

    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required and must be a string" }, { status: 400 });
    }

    if (code.trim().length === 0) {
      return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 });
    }

    const existingComponent = components.get(id);
    if (!existingComponent) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    const updatedComponent = {
      ...existingComponent,
      code: code.trim(),
      updatedAt: new Date(),
    };

    components.set(id, updatedComponent);

    return NextResponse.json({
      message: "Component updated successfully",
      component: updatedComponent,
    });
  } catch (error) {
    console.error("Error updating component:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to update component",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: "Component ID is required" }, { status: 400 });
    }

    const component = components.get(id);

    if (!component) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    components.delete(id);

    return NextResponse.json({
      message: "Component deleted successfully",
      deletedComponent: component,
    });
  } catch (error) {
    console.error("Error deleting component:", error);
    return NextResponse.json(
      {
        error: "Failed to delete component",
      },
      { status: 500 }
    );
  }
}
