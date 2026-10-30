export const dynamic = "force-static";

/**
 * Frontend-only build: no database, no services. This endpoint exists purely so
 * the hosting platform has a healthcheck target.
 */
export function GET() {
  return Response.json({ ok: true, mode: "frontend-only" });
}
