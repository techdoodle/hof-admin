## v1.1.0 (2025-01-20)

### What changed
- New **Tickets** feature for reporting and tracking match issues:
  - Admins can now create tickets directly from match detail pages using a "Report issue" button.
  - A new **Tickets** tab appears in the admin menu (visible to Admin and Super Admin roles).
  - In the Tickets list, you can filter by match ID, status, priority, and creator.
  - Click any ticket to open the edit screen where you can:
    - Change the status (Open → In Progress → Resolved)
    - Update priority (Low, Medium, High)
    - Assign the ticket to another admin
    - Add resolution notes

### How to test
1. Go to **Matches** → open any match → click **Show**.
2. Scroll down and click the **Report issue** button.
3. Fill in the ticket form (title, description, priority) and submit.
4. Go to the **Tickets** tab in the menu.
5. Find your ticket in the list (you can filter by match ID or status).
6. Click the ticket row to open the edit screen.
7. Change the status to "In Progress", add resolution notes, and save.
8. Verify the status update appears in the Tickets list.

## v1.0.0 (2025-12-15)

### What changed
- Created an admin-facing changelog for the admin panel. Future entries will describe changes in the admin UI and workflows (for example, how stats screens or match lists behave) in plain language.


