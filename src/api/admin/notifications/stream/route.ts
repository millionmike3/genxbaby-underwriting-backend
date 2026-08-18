import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      // Poll every 2 seconds
      const interval = setInterval(async () => {
        const newNotifications = await prisma.notification.findMany({
          where: {
            createdAt: { gt: lastCheck }
          },
          orderBy: { createdAt: "asc" }
        });

        if (newNotifications.length > 0) {
          lastCheck = new Date();

          controller.enqueue(
            `data: ${JSON.stringify(newNotifications)}\n\n`
          );
        }
      }, 2000);

      controller.enqueue(`data: "connected"\n\n`);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
