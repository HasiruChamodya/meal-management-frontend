import React from "react"

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-balance">{title}</h1>
          {description && <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>}
        </div>
        {children && <div className="flex gap-3">{children}</div>}
      </div>
    </div>
  )
}