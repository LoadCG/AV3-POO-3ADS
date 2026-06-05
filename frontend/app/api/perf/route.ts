import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Força execução dinâmica, garantindo que a consulta ao BD ocorra em cada requisição
export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();

  try {
    // Consulta simulada para representar carga de trabalho real (busca aeronaves e todas as relações)
    await prisma.aeronave.findMany({
      include: {
        pecas: true,
        etapas: true,
        testes: true,
      },
    });

    const end = performance.now();
    const processingTimeMs = end - start;

    return NextResponse.json({
      ok: true,
      processingTimeMs,
    });
  } catch (error: any) {
    const end = performance.now();
    return NextResponse.json(
      {
        ok: false,
        erro: error.message || "Erro de processamento interno",
        processingTimeMs: end - start,
      },
      { status: 500 }
    );
  }
}
