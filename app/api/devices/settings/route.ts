import { NextRequest, NextResponse } from "next/server";
import { DeviceCacheSettingsManager } from "@/lib/deviceCacheSettings";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = DeviceCacheSettingsManager.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching device cache settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offlineThresholdMs, removeThresholdMs, checkIntervalMs } = body;

    // Validate settings
    if (offlineThresholdMs !== undefined && offlineThresholdMs < 0) {
      return NextResponse.json(
        { error: "Offline threshold must be positive" },
        { status: 400 }
      );
    }

    if (removeThresholdMs !== undefined && removeThresholdMs < 0) {
      return NextResponse.json(
        { error: "Remove threshold must be positive" },
        { status: 400 }
      );
    }

    if (checkIntervalMs !== undefined && checkIntervalMs < 1000) {
      return NextResponse.json(
        { error: "Check interval must be at least 1 second" },
        { status: 400 }
      );
    }

    // Update settings
    DeviceCacheSettingsManager.updateSettings({
      offlineThresholdMs,
      removeThresholdMs,
      checkIntervalMs,
    });

    const settings = DeviceCacheSettingsManager.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating device cache settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    DeviceCacheSettingsManager.resetToDefaults();

    const settings = DeviceCacheSettingsManager.getSettings();
    return NextResponse.json({ message: "Settings reset to defaults", settings });
  } catch (error) {
    console.error("Error resetting device cache settings:", error);
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    );
  }
}
