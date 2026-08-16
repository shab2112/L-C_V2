# AIN Global CRM Feature Coverage and L&C Test Plan

Last updated: 2026-08-16

## Source Reviewed

- AIN CRM component: `C:\Users\USER\Documents\kimi\workspace\ain_global_website\ainglobal-realestate\src\components\admin\RealEstateCRM.tsx`
- AIN admin shell: `C:\Users\USER\Documents\kimi\workspace\ain_global_website\ainglobal-realestate\src\app\admin\page.tsx`
- AIN APIs reviewed by feature signature: `/api/leads`, `/api/submissions`, `/api/admin/send-email`, `/api/submissions/ai-audio`, `/api/submissions/whatsapp-audio`
- L&C CRM page: `pages/dashboard/CRMPage.tsx`
- L&C Node API: `server/index.js`

## AIN CRM Feature Inventory

### 1. Admin CRM Entry Points

AIN exposes the CRM inside the admin dashboard as a dedicated CRM tab, alongside enquiries, projects, home page data, and settings. The CRM module itself has sub-navigation for analytics, leads, duplicates, lead details, deals, lead creation, and reports.

Expected L&C behavior:
- Dashboard navigation includes CRM Intelligence.
- CRM Intelligence is available under the admin navbar.
- The CRM page loads without JSON parsing errors.
- Admin users can move between Overview, Leads Registry, Enquiries, Duplicates, Deals, Reports, and Import / Create.

### 2. Lead Data Model

AIN CRM tracks a broad real estate lead profile, not just name and email:

- Identity: name, first name, last name, email, phone, alternate phone, WhatsApp number.
- Contact preferences: preferred channel, language, contact time, validation call consent.
- Geography: nationality, country, city, residence status.
- Client type: buyer, tenant, seller, investor.
- Property intent: property type interest, preferred locations, bedroom preference, project interest, property interests, shortlisted projects.
- Budget and funding: budget minimum, budget maximum, financing method, mortgage pre-approval.
- Sales timeline: purchase timeframe, last activity date, next follow-up date.
- Attribution: lead source, source campaign, source submission ID, tracking metadata.
- Qualification: lead score, cold/warm/hot temperature, status.
- CRM activity: action log, tasks, communications, deals, attachments, viewings, offers, status history.
- DARIE/ARIA assistant fields: chat profile, chat transcript, availability requested, newsletter subscribed.
- Duplicate metadata: reason, note, matched lead ID, source, moved by, moved date.

Expected L&C behavior:
- `POST /api/leads` accepts this data shape and normalizes missing fields.
- `GET /api/leads` returns saved fields from Supabase.
- `PUT /api/leads` preserves nested CRM objects such as tasks, deals, communications, attachments, viewings, and status history.
- Lead score and lead temperature recalculate when profile data changes.

### 3. Lead Statuses and Pipeline States

AIN lead statuses include:

- New
- Attempted Contact
- Contacted
- Qualified
- Unqualified
- Interested
- Viewing Scheduled
- Viewing Completed
- Negotiation
- Offer Made
- Booking Pending
- Booked
- Closed Won
- Closed Lost

AIN deal stages include:

- New Opportunity
- Property Matched
- Viewing Scheduled
- Viewing Completed
- Negotiation
- Offer Submitted
- Booking Pending
- Booking Confirmed
- Closed Won
- Closed Lost

Expected L&C behavior:
- Lead status dropdown exposes the full lead status set.
- Status changes persist to Supabase.
- Status changes append status history.
- Deal stage changes persist and update probability/closed values where applicable.

### 4. Analytics Dashboard

AIN analytics include:

- Total leads.
- New leads today.
- Active leads.
- Qualified leads.
- Viewings scheduled.
- Offers made.
- Bookings.
- Closed won and closed lost.
- Pipeline value.
- Expected commission.
- Average response time.
- SLA compliance.
- Lead source breakdown.
- Project breakdown.
- Agent leaderboard.
- Stagnant leads.
- Hot leads with no follow-up.
- Deals stuck in a stage for more than 14 days.
- Filters by date range, agent, and project.

Expected L&C behavior:
- L&C shows primary KPI cards for total leads, active pipeline, hot leads, chat-qualified leads, viewings, offers, pipeline value, and stale leads.
- Overview shows pipeline signals by status and an operational watchlist.
- Reports show filtered leads, qualified leads, viewings, offers, conversion rate, pipeline value, closed won value, stale leads, and source breakdown.
- L&C currently implements a practical subset of AIN analytics. Agent leaderboard, project breakdown, average response time, SLA compliance, expected commission, and stuck-stage reporting should be added if exact parity is required.

### 5. Leads Registry

AIN leads registry includes:

- Search.
- Status filter.
- Lead source filter.
- Temperature filter.
- Owner/agent filter.
- Client type filter.
- Sorting by newest, score, budget, and last activity.
- Multi-select rows.
- Bulk owner assignment.
- Bulk status update.
- CSV export.
- Row actions for communication, task, deal, duplicate management, attachments, and viewings.

Expected L&C behavior:
- The Leads Registry tab exposes all filters listed above.
- Selected rows can be bulk updated.
- Export Leads downloads a CSV.
- Row actions update the selected lead and persist changes.

### 6. Enquiry Workflow

AIN admin supports website submissions/enquiries:

- Fetch enquiry list.
- Show new enquiry counts.
- Bulk-select enquiries.
- Convert selected enquiries into CRM leads.
- Preserve enquiry source, budget, interest, message, chat profile, chat transcript, and action log.
- Update enquiry status after conversion.
- Send email responses.
- Generate AI audio responses.
- Send WhatsApp voice messages when WhatsApp credentials are configured.

Expected L&C behavior:
- Enquiries tab lists Supabase-backed enquiries from `/api/enquiries`.
- Each enquiry can be converted into a CRM lead.
- Converted lead keeps contact data, property interest, budget, source, chat profile, and chat transcript.
- L&C currently does not implement AIN's AI audio or WhatsApp voice sending in CRM Intelligence. These are parity gaps if required.

### 7. Duplicate Management

AIN duplicate handling includes:

- Automatic duplicate detection on lead creation/import by email or phone.
- Auto-routed duplicate archive.
- Manual move-to-duplicate workflow with required admin note.
- Duplicate archive tab.
- Duplicate metadata including source, reason, note, matched lead, admin, and timestamp.
- Duplicates excluded from active lead analytics.

Expected L&C behavior:
- Creating a lead with an existing email or phone archives the new lead as a duplicate unless duplicate override is allowed.
- Manual duplicate action removes the active lead and archives it in `crm_duplicate_leads`.
- Duplicates tab displays archived records.
- Archived duplicates do not appear in active Leads Registry.

### 8. Lead Creation and Import

AIN supports:

- Manual lead creation with complete contact, preference, budget, finance, source, and assignment fields.
- Duplicate warnings on matching contact data.
- CSV file import.
- Pasted/bulk import.
- Import status and duplicate count feedback.

Expected L&C behavior:
- Import / Create tab supports manual lead creation.
- Bulk textarea accepts rows in the format `name,email,phone,interest,budget,area,notes`.
- CSV upload accepts the same headers.
- Duplicate detection still runs during import.

### 9. Task Management

AIN lead tasks support:

- Add task.
- Task type.
- Priority.
- Due date.
- Notes.
- Assigned owner.
- Toggle completed/pending.
- Delete task.
- Update next follow-up date.
- Write task actions into the timeline.

Expected L&C behavior:
- Add task from lead row or selected lead detail.
- Task is persisted in lead `tasks`.
- Task appears in the selected lead panel.
- Task action appears in timeline.
- L&C supports task creation through prompts, but task completion/deletion controls are not fully exposed in the current L&C UI. This is a parity gap.

### 10. Deal Pipeline

AIN deal management supports:

- Create a linked deal/opportunity.
- Link to property/project.
- Deal type.
- Expected value.
- Expected commission.
- Stage.
- Probability.
- Expected close date.
- Notes.
- Pipeline/Kanban view by stage.
- Move deals backward/forward by stage.
- Closed Won prompt for actual value and commission.
- Closed Lost reason capture.
- Lead status synchronization from deal stage.

Expected L&C behavior:
- Add deal to selected lead.
- Deals tab lists all deals across leads.
- Deal stage can be updated.
- Pipeline value and closed won value update in analytics.
- L&C has a table pipeline rather than AIN's Kanban board.
- L&C does not yet prompt for Closed Won actuals or Closed Lost reason. This is a parity gap.

### 11. Communications and Email

AIN communication features include:

- Log calls, emails, meetings, notes, AI audio, and WhatsApp audio actions.
- Show communication history.
- Show assistant chat transcript.
- Draft lead email response.
- Send email through Resend.
- Store sent email in the lead action log and communications.
- Admin sender email profile.

Expected L&C behavior:
- Log call from a lead row.
- Review and send email from lead row or detail panel.
- `EMAIL_FROM` is the verified Resend sender identity.
- Admin sender/reply-to defaults to `info@lockwoodandcarter.com`.
- Sent email writes a communication record to the lead.
- L&C supports email, call logging, and WhatsApp text sending from CRM leads through the configured Lockwood & Carter WhatsApp Business number when Meta WhatsApp Cloud API credentials are configured. It does not currently support AI audio or WhatsApp audio from the CRM.

### 12. Attachments

AIN attachment features include:

- Add attachment metadata.
- Attachment type.
- Attachment URL.
- Open attachment.
- Delete attachment.
- Timeline entry for changes.

Expected L&C behavior:
- Add document URL to a lead.
- Attachment appears in the selected lead Attachments tab.
- Attachment can be opened.
- Attachment can be removed.

### 13. Viewings

AIN viewing features include:

- Schedule site visit/viewing.
- Select property/project.
- Select date and time.
- Auto-create viewing task.
- Update lead status to Viewing Scheduled.
- List scheduled viewings on lead detail.

Expected L&C behavior:
- Schedule viewing from lead row or selected lead.
- Viewing record persists on the lead.
- Lead status moves to Viewing Scheduled.
- Viewing appears in the selected lead Viewings tab.

### 14. Property Shortlisting and Matching

AIN includes a property shortlisting modal:

- Search available projects/properties.
- Add shortlisted property to lead.
- Prevent duplicate shortlist entries.
- Remove shortlisted property.
- Timeline entries for shortlist changes.

Expected L&C behavior:
- L&C currently links properties through deal creation and viewing scheduling, but does not expose a dedicated Shortlisted Properties panel. This is a parity gap.

### 15. Timeline

AIN builds a merged timeline from:

- Action log.
- Status history.
- Communications.
- Tasks.
- Deals.
- Attachments.
- Viewings.
- Assistant transcript activity.

Expected L&C behavior:
- Selected lead Timeline tab merges CRM actions and status history.
- Timeline updates after status, task, deal, communication, attachment, viewing, duplicate, and email actions.

### 16. Reports and Exports

AIN reports include:

- Source conversion report.
- Agent response report.
- Conversion metrics.
- CSV export from leads registry.
- CSV export for report tables.

Expected L&C behavior:
- Export Leads downloads lead CSV.
- Reports tab exports a CRM performance CSV.
- Source Breakdown displays lead count and percentage per source.
- Agent response report is not yet present in L&C. This is a parity gap.

## L&C Coverage Matrix

| Feature Area | L&C Status | Notes |
| --- | --- | --- |
| CRM dashboard entry | Covered | CRM Intelligence route is present under dashboard tools/navigation. |
| Supabase-backed leads | Covered | `/api/leads` reads/writes `crm_leads`. |
| Supabase-backed enquiries | Covered | `/api/enquiries` reads/writes `enquiries`. |
| Supabase-backed duplicate archive | Covered | `/api/leads?type=duplicates` reads `crm_duplicate_leads`. |
| Lead status lifecycle | Covered | Full status list is present and status history is stored. |
| Lead scoring/temperature | Covered | Node API recalculates score and cold/warm/hot. |
| Search/filter/sort registry | Covered | Status, source, temperature, owner, client type, date, and sort controls exist. |
| Bulk owner/status updates | Covered | Multi-select plus bulk owner/status controls exist. |
| Manual lead creation | Covered | Import / Create tab creates leads. |
| CSV/pasted import | Covered | CSV file and textarea import are present. |
| CSV exports | Covered | Lead and report exports exist in UI. |
| Enquiry conversion | Covered | Enquiries can be converted to leads. |
| Manual duplicate archival | Covered | Lead row action archives an active lead. |
| Automatic duplicate archival | Covered | API detects matching email/phone on create/import. |
| Tasks | Partial | Create and display are present; completion/delete controls should be added for parity. |
| Deals | Partial | Create and stage update are present; Kanban, Closed Won actuals, and Closed Lost reason prompts are not present. |
| Communications | Partial | Call logging, email, and WhatsApp text are present; WhatsApp/audio voice channels are not present. |
| Attachments | Covered | Add, open, and delete document URL records. |
| Viewings | Covered | Schedule viewing and status update. |
| Property shortlisting | Gap | No dedicated shortlist panel yet. |
| Analytics | Partial | Core KPIs and reports exist; AIN's SLA, response time, project breakdown, leaderboard, and stuck-deal reports are not yet present. |
| Resend email sender | Covered | Uses `EMAIL_FROM` and reply-to sender profile; default sender profile is `info@lockwoodandcarter.com`. |
| AI audio / WhatsApp voice | Gap | AIN admin shell has these actions; L&C CRM text WhatsApp is present, but voice/audio is not. |

## WhatsApp Configuration

L&C CRM WhatsApp text sending is connected to the configured WhatsApp Business number in `.env`. To send real messages through WhatsApp Cloud API, add these values to `.env` and restart the Node API:

```bash
WHATSAPP_BUSINESS_NUMBER=971XXXXXXXXX
VITE_WHATSAPP_BUSINESS_NUMBER=+971XXXXXXXXX
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_API_BASE=https://graph.facebook.com/v23.0
```

Important: `WHATSAPP_PHONE_NUMBER_ID` is the Meta phone number ID for the registered sender number, not the visible phone number. `WHATSAPP_BUSINESS_NUMBER` should be the official Lockwood & Carter sender number in international format without spaces.

## Functional Test Cases

### A. Load and Navigation

1. Open `http://localhost:3000/dashboard`.
2. Click CRM Intelligence from dashboard/admin navigation.
3. Confirm CRM page title, KPI cards, sender email profile, and all tabs render.
4. Switch tabs: Overview, Leads Registry, Enquiries, Duplicates, Deals, Reports, Import / Create.

Expected result: no blank page, no JSON parse banner, no console-level fatal UI errors.

### B. API Health

1. Call `GET http://localhost:3001/api/health`.
2. Confirm `success: true`, `supabaseConfigured: true`, and `usesServiceRole: true`.

Expected result: API confirms Supabase service role is configured.

### C. Lead Create and Retrieve

1. Create a unique test lead through `POST /api/leads`.
2. Include email, phone, client type, locations, property type, budget, financing method, lead source, source campaign, and notes.
3. Call `GET /api/leads`.
4. Find the created lead.

Expected result: created lead is returned with calculated lead score, temperature, initial task, and status history.

### D. Lead Update

1. Update the test lead through `PUT /api/leads`.
2. Change status to Qualified.
3. Add one task, one communication, one deal, one attachment, and one viewing.
4. Retrieve the lead.

Expected result: all nested objects persist; status history includes the status transition.

### E. Lead Registry UI

1. Open Leads Registry.
2. Use search to find the test lead.
3. Change filters for status, source, temperature, owner, client type, and date.
4. Select the lead.
5. Use bulk owner/status update.

Expected result: table filters correctly; selected lead updates persist and reload correctly.

### F. Selected Lead Detail

1. Select a lead.
2. Inspect Tasks, Deals, Communications, Attachments, Viewings, and Timeline tabs.

Expected result: each tab shows the persisted data from API tests and the timeline shows matching activity entries.

### G. Enquiry Conversion

1. Create a test enquiry through `POST /api/enquiries`.
2. Open Enquiries tab.
3. Convert the enquiry to a lead.
4. Confirm the lead appears in Leads Registry.

Expected result: enquiry data becomes a CRM lead with website source and preserved notes/transcript.

### H. Duplicate Handling

1. Create an active lead.
2. Create a second lead with the same email or phone.
3. Call `GET /api/leads?type=duplicates`.
4. Confirm duplicate archive contains the second lead.
5. Manually mark an active lead duplicate with an admin note.

Expected result: automatic and manual duplicates are archived, and manual duplicate is removed from active leads.

### I. Deals and Reports

1. Create a deal on a lead.
2. Open Deals tab.
3. Change deal stage to Closed Won.
4. Open Reports.
5. Export report CSV.

Expected result: pipeline and closed won values update, deal stage persists, CSV export starts.

### J. Email

1. Confirm `RESEND_API_KEY` and `EMAIL_FROM` exist in `.env`.
2. Confirm `EMAIL_FROM` is a verified Lockwood & Carter sender/domain.
3. Open a lead email draft.
4. Send a short test email to an approved test recipient.

Expected result: `/api/admin/send-email` returns `success: true`; sent email is recorded in communications and action log.

### K. Known Parity Gap Tests

These should fail or be absent until implemented:

- Dedicated property shortlisting panel.
- Task completion and task delete UI parity.
- Deal Kanban board and stage-by-stage drag/move controls.
- Closed Won actual value/commission prompt.
- Closed Lost reason prompt.
- Agent leaderboard report.
- Project breakdown report.
- Average response time and SLA compliance report.
- Deals stuck by stage for more than 14 days.
- AI audio response generation in CRM Intelligence.
- WhatsApp voice message action in CRM Intelligence.

## Local Verification Log

Use this section to append run results.

| Date | Check | Result | Notes |
| --- | --- | --- | --- |
| 2026-08-16 | Source comparison | Pass | AIN CRM component and admin shell reviewed. |
| 2026-08-16 | L&C production build | Pass | `npm.cmd run build` completed successfully. Vite reported only the existing large chunk warning. |
| 2026-08-16 | API health | Pass | `GET /api/health` returned `success: true`, `supabaseConfigured: true`, and `usesServiceRole: true`. |
| 2026-08-16 | Lead create/read/update | Pass | Created disposable lead, verified score/temperature, initial task, status history, nested task/communication/deal/attachment/viewing persistence, then removed test data. |
| 2026-08-16 | Duplicate management | Pass | Automatic duplicate archive and manual duplicate move both worked against Supabase-backed duplicate storage, then test data was removed. |
| 2026-08-16 | Enquiry create/read | Pass | UUID enquiry create/read passed. Non-UUID external IDs now generate a valid UUID before insert. |
| 2026-08-16 | Admin routes served | Pass | `GET /dashboard` and `GET /dashboard/darie-assistant` returned HTTP 200 from the local Vite server. |
| 2026-08-16 | CRM UI static coverage | Pass | CRM page contains expected tabs and controls: Overview, Leads Registry, Enquiries, Duplicates, Deals, Reports, Import / Create, sender email profile, deal pipeline, CSV upload, report export, and enquiry conversion. |
| 2026-08-16 | Live browser click-through | Blocked | In-app browser runtime was unavailable (`Browser is not available: iab`), so tab-by-tab click testing remains manual. |
| 2026-08-16 | WhatsApp text route | Config-gated | `/api/admin/send-whatsapp` added for WhatsApp Cloud API text messages from the configured Lockwood & Carter sender number; real send test requires `WHATSAPP_BUSINESS_NUMBER`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID`. |
