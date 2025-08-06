import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, you'd use a proper database
const components = new Map<string, { id: string; code: string; createdAt: Date; updatedAt: Date }>()

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const id = Math.random().toString(36).substr(2, 9)
    const component = {
      id,
      code,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    components.set(id, component)

    return NextResponse.json({ id, message: "Component created successfully" })
  } catch (error) {
    console.error("Error creating component:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allComponents = Array.from(components.values())
    return NextResponse.json({ components: allComponents })
  } catch (error) {
    console.error("Error fetching components:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
