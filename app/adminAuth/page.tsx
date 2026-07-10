import { ShieldCheck, ShieldHalf } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { notFound } from 'next/navigation'
import { isAdminDomainAllowed } from '@/lib/get-domain'

export default async function AdminAuthPage ()  {
  const allowed = await isAdminDomainAllowed();
  if (!allowed) {
    notFound();
  }
  return (
<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl ">

                {/* Header */}
                <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 text-theme-xxs font-semibold uppercase tracking-widest text-muted-foreground bg-muted border border-border rounded-full px-3 py-1 mb-4">
                        <ShieldHalf size={12} />
                        Auth center
                    </span>
                    <h1 className="text-theme-h4 font-semibold text-foreground mb-1.5">
                        Welcome to Techsonance
                    </h1>
                    {/* <p className="text-theme-body-sm text-muted-foreground">
                        Select your portal to sign in or get started.
                    </p> */}
                 </div>
                    <div className="group bg-card border border-border hover:border-border/80 rounded-2xl p-6 flex flex-col transition-colors duration-150">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 text-blue-700">
                            <ShieldCheck size={20} />
                        </div>
                        <p className="text-theme-xxs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Operations
                        </p>
                        <h2 className="text-theme-body font-semibold text-foreground mb-2">
                            Admin panel
                        </h2>
                        <p className="text-theme-body-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                            Platform-wide controls, vendor management, analytics, and marketplace health.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/auth/adminLogin"
                                className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-blue-50 text-theme-body-sm font-medium text-center rounded-lg transition-colors"
                            >
                                Sign in as admin
                            </Link>
                        </div>
                    </div>

           </div>
</div>
               
  )
}
