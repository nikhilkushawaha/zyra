import { AlertTriangle, Flame, Clock, CheckCircle } from "lucide-react"
import type { UrgencyLevel } from "../types"

interface UrgencyBannerProps {
  urgencyLevel: UrgencyLevel
}

// Tradeoff: Hardcoded styling/label configuration object map. Keeps component layout extremely clean,
// but makes it rigid if we ever want to dynamically feed these alert parameters from an API or allow configurations.
const config: Record<
  UrgencyLevel,
  {
    bg: string
    border: string
    text: string
    icon: React.ReactNode
    message: string
    badgeClass: string
    label: string
  }
> = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    message: "⚠ Urgent Attention Required — This student needs immediate follow-up",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    label: "Critical",
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />,
    message: "This student has high-priority items pending",
    badgeClass: "bg-orange-100 text-orange-700 border border-orange-200",
    label: "High",
  },
  moderate: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
    message: "Some tasks need attention soon",
    badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    label: "Moderate",
  },
  low: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    message: "Everything is Active",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    label: "Low",
  },
}

export function UrgencyBanner({ urgencyLevel }: UrgencyBannerProps) {
  const c = config[urgencyLevel]

  return (
    <div
      id="urgency-banner"
      role="alert"
      className={`flex items-center justify-between px-5 py-3 rounded-xl border mb-5 ${c.bg} ${c.border}`}
    >
      <div className="flex items-center gap-3">
        {c.icon}
        <p className={`text-sm font-medium ${c.text}`}>{c.message}</p>
      </div>

      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${c.badgeClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {c.label}
      </span>
    </div>
  )
}
