import QRCode from "qrcode"

export async function generateDonationQR(
  donationId: string,
  ngoName: string,
  weightKg: number,
): Promise<string> {
  const data = JSON.stringify({
    id: donationId,
    ngo: ngoName,
    weight: weightKg,
    ts: new Date().toISOString(),
  })

  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1a2129",
      light: "#ffffff",
    },
  })
}

export async function verifyQRCode(qrData: string): Promise<{
  valid: boolean
  donationId?: string
  ngoName?: string
}> {
  try {
    const parsed = JSON.parse(qrData)
    if (parsed.id && parsed.ngo) {
      return { valid: true, donationId: parsed.id, ngoName: parsed.ngo }
    }
    return { valid: false }
  } catch {
    return { valid: false }
  }
}
