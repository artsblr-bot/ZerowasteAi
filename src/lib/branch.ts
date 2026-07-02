import { prisma } from "./prisma"

export async function resolveBranchId(orgId: string, preferredId?: string | null): Promise<string> {
  if (preferredId) {
    const branch = await prisma.branch.findFirst({
      where: { id: preferredId, organizationId: orgId },
    })
    if (branch) return branch.id
  }
  const firstBranch = await prisma.branch.findFirst({
    where: { organizationId: orgId },
  })
  return firstBranch?.id || "default"
}
