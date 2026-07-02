import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("ZeroWaste AI - Database Setup")
  console.log("No demo data seeded. Create your first account at /register.")

  const count = await prisma.organization.count()
  console.log(`\nCurrent state: ${count} organization(s) in database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
