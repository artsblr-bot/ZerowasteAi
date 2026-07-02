export function ZomatoLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#CB202D" />
      <path d="M14 14h20v4H14v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4z" fill="white" opacity="0.9" />
      <circle cx="36" cy="36" r="8" fill="white" />
      <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#CB202D">Z</text>
    </svg>
  )
}

export function SwiggyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#FC8019" />
      <path d="M24 8C18 8 14 14 14 22c0 8 4 14 10 18l4-3c-4-3-6-7-6-12 0-4 2-7 6-8V8h-4z" fill="white" />
      <circle cx="28" cy="18" r="3" fill="white" />
    </svg>
  )
}

export function PetpoojaLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#E23744" />
      <rect x="14" y="14" width="8" height="8" rx="2" fill="white" />
      <rect x="26" y="14" width="8" height="8" rx="2" fill="white" />
      <rect x="14" y="26" width="8" height="8" rx="2" fill="white" />
      <rect x="26" y="26" width="8" height="8" rx="2" fill="white" />
    </svg>
  )
}

export function MyLivePOSLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#1a73e8" />
      <rect x="14" y="16" width="20" height="18" rx="3" fill="white" />
      <rect x="18" y="20" width="12" height="2" rx="1" fill="#1a73e8" />
      <rect x="18" y="24" width="8" height="2" rx="1" fill="#1a73e8" />
      <rect x="18" y="28" width="6" height="2" rx="1" fill="#1a73e8" />
    </svg>
  )
}

export function DotPeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#0F172A" />
      <circle cx="24" cy="24" r="10" fill="white" />
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0F172A">Dp</text>
    </svg>
  )
}

export function UrbanPiperLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#6C5CE7" />
      <path d="M16 14h16v4H16v-4zm0 8h16v4H16v-4zm0 8h10v4H16v-4z" fill="white" opacity="0.8" />
      <circle cx="34" cy="34" r="6" fill="#00D2D3" />
      <text x="34" y="38" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">UP</text>
    </svg>
  )
}

export function OtherPOSLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#64748b" />
      <rect x="16" y="14" width="16" height="20" rx="3" stroke="white" strokeWidth="2" fill="none" />
      <line x1="22" y1="18" x2="26" y2="18" stroke="white" strokeWidth="1.5" />
      <line x1="22" y1="22" x2="26" y2="22" stroke="white" strokeWidth="1.5" />
      <line x1="22" y1="26" x2="24" y2="26" stroke="white" strokeWidth="1.5" />
      <rect x="22" y="30" width="4" height="2" rx="0.5" fill="white" />
    </svg>
  )
}

export function GmailLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#EA4335" />
      <rect x="10" y="16" width="28" height="18" rx="2" fill="white" />
      <path d="M10 18l14 9 14-9" stroke="#EA4335" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function GoogleDriveLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#4285F4" />
      <path d="M18 14l10 0 6 10-10 0-6-10z" fill="#FBBC05" />
      <path d="M28 14l6 10-10 0 4-10z" fill="#34A853" />
      <path d="M14 24l6-10 4 10-4 10-6-10z" fill="#EA4335" />
    </svg>
  )
}

export const billingAppLogos: Record<string, React.ComponentType<{ className?: string }>> = {
  zomato: ZomatoLogo,
  swiggy: SwiggyLogo,
  petpooja: PetpoojaLogo,
  mylivepos: MyLivePOSLogo,
  dotpe: DotPeLogo,
  urbanpiper: UrbanPiperLogo,
  other: OtherPOSLogo,
}
