# Trail of Joy — Learning Loop Ledger
Append-only. Newest entry first. Each entry sharpens SOPs and expands autonomy.

---

## 2026-06 / Trail of Joy infra / GitHub MCP write access confirmed
**action:** Installed Claude Github MCP Connector on kcumby2-wq account via https://github.com/apps/claude-github-mcp-connector/installations/new
**result:** push_files now works. First successful agent-executed commit to Groundfloorsports repo (this file).
**autonomy_delta:** DEPLOYER and CAMPAIGNER Phase D now fully agent-executed. Human file upload eliminated. ~60% -> ~85% autonomous confirmed with real commit evidence.

---

## 2026-06 / Trail of Joy infra / CAMPAIGNER v1.0 created
**context:** User confirmed GHL for main CRM but needs custom stack for standalone campaigns.
**decision:** CAMPAIGNER forked from DEPLOYER. GHL vs standalone routing decision guide added. D6 deferral mechanism for GHL-adjacent campaigns.
**autonomy_delta:** CAMPAIGNER inherits GitHub MCP write path -- Phase D agent-executed from v1.0.

---

## 2026-06 / Trail of Joy infra / connector stack complete
**connectors:** GitHub (write), Vercel, Supabase, Google Drive, Gmail, Stripe, Airtable, Make, Google Calendar, Slack, Notion.
**result:** Notion = durable memory. SOPs stored in Agency HQ. No more starting from zero.
**autonomy_delta:** Full connector stack established. DEPLOYER ~85%.

---

## 2026-06 / Subjectreport / DEPLOYER v1.0
**surprises:** Real repo was Groundfloorsports not Subjectreport. Homepage served from public/Subjectreport.html via vercel.json rewrite. Backend wiring dormant -- credentials were placeholders.
**failures:** Missing deps (stripe, @clerk/nextjs); bogus route folder broke Next build; stuck CDN cache.
**human_steps_blocked:** File commits (now resolved); env vars; Stripe key rotation; live page eyeball; secret exposure incident (keys pasted in chat -- halted and rotated).
**sop_changes:** Verify repo from deploy metadata. Check placeholders. Secret-exposure guardrail. Evidence-based DONE.
**autonomy_delta:** Vercel connector for deploy verification. GitHub MCP established.
**open:** D6 deferred (GHL may replace Stripe webhook). D9 (delete subjectreport-static) pending.
