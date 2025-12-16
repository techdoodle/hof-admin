## v1.1.0 (2025-01-20)

### Added
- Match ticketing UI components and integration:
  - `TicketList` component (`src/resources/tickets/TicketList.tsx`) with filters (matchId, status, priority, createdBy) and pagination.
  - `TicketEdit` component (`src/resources/tickets/TicketEdit.tsx`) for editing ticket status, priority, assigned admin, and resolution notes.
  - `ReportIssueButton` component integrated into `MatchShow.tsx` (`src/resources/matches/MatchShow.tsx`) with dialog form for creating tickets.
  - Tickets resource registered in `App.tsx` with `list` and `edit` views.
  - Tickets menu item added to `Layout.tsx` (`CustomMenu`) for Admin and Super Admin roles.
  - Ticket creation posts to `POST /admin/matches/:matchId/tickets`.
  - Ticket updates use `PATCH /admin/tickets/:id` endpoint.

## v1.0.0 (2025-12-15)

### Added
- Created initial technical changelog for the admin panel to track engineer-facing changes to resources, layouts, and data flows.


