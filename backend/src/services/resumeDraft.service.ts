// services/resumeDraft.service.ts
import { prisma } from "../../lib/prisma";
import { $Enums } from "@prisma/client";
import { processResumeAsync } from "../../utils/worker";

type CreateDraftArgs = {
  userId: string;
  jd: string;                 // raw JD text (can be "")
  template?: string;          // enum key if provided (e.g., "noah")
  jobDescriptionId?: string;  // optional link to JobDescription row
  tone?: string;              // transient; not stored
};

export async function createDraftAndStart({
  userId,
  jd,
  template,
  jobDescriptionId,
  tone = "neutral",
}: CreateDraftArgs) {
  const draft = await prisma.resume.create({
    data: {
      userId,
      title: "Untitled",
      status: $Enums.ResumeStatus.processing,
      jdRaw: jd || null,
      ...(template ? { template: template as any } : {}),
      ...(jobDescriptionId ? { jobDescriptionId } : {}),
      // content stays null; timestamps auto-managed
    },
    select: { id: true },
  });

  void processResumeAsync({
    resumeId: draft.id,
    userId,
    jd,
    tone,
    templateId: template, // pass through if your generator uses it
  });

  return draft.id;
}
