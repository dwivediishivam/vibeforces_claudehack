"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { sampleRecruiterTests } from "@shared/seed-data";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { RecruiterTestRecord } from "@shared/types";

export default function RecruiterTestsPage() {
  const auth = useAuth();
  const [tests, setTests] = useState<RecruiterTestRecord[]>(sampleRecruiterTests);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getRecruiterTests(auth.session?.access_token)
      .then((response) => {
        if (!cancelled) {
          setTests(response.tests);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTests(sampleRecruiterTests);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Tests
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Recruiter test inventory
        </h1>
      </div>
      <div className="space-y-3">
        {tests.map((test) => (
          <Link key={test.id} href={`/recruiter/tests/${test.id}`}>
            <Card className="surface-card rounded-2xl p-5 transition hover:border-[#334155]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono-ui text-lg text-[#f1f5f9]">{test.title}</div>
                  <div className="mt-2 text-sm text-[#94a3b8]">
                    {test.challenge_ids.length} challenges · {test.time_limit_minutes} minutes · share code {test.share_code}
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[2px] text-[#a78bfa]">
                  Results
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
