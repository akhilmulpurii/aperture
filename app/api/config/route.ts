export async function GET() {
  return Response.json({
    defaultServerUrl: process.env.DEFAULT_SERVER_URL ?? "",
  });
}
