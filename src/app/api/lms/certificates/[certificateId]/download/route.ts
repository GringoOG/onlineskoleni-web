import { generateCertificatePdf } from "@/lib/lms/generate-certificate-pdf";
import { getCertificateForDownload } from "@/lib/lms/issue-certificate";
import { getLmsSession } from "@/lib/lms/session";

interface RouteParams {
  params: Promise<{ certificateId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getLmsSession();
  if (!session) {
    return new Response("Nejste přihlášeni.", { status: 401 });
  }

  const { certificateId } = await params;
  const data = await getCertificateForDownload(certificateId, session.userId);

  if (!data) {
    return new Response("Certifikát nebyl nalezen.", { status: 404 });
  }

  try {
    const pdfBytes = await generateCertificatePdf(data);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certifikat-${data.certificateCode}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/lms/certificates/download]", error);
    return new Response("Nepodařilo se vygenerovat certifikát.", { status: 500 });
  }
}
