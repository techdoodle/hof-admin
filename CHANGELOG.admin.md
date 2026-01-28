## v1.3.0 (2026-01-28)

### What changed
- In the **Submit Match for Stats** screen, when you are working on 360° videos for each player, the player header now shows a masked phone identifier with only the last 4 digits (for example `(**1234)`) instead of the full phone number.
- The 360° video recorder dialog title also includes this masked identifier so you can tell players apart without seeing their full phone numbers.

### How to test
1. Open any match and click the action to **Submit Match for Stats**.
2. Go to the **Players** step and expand a player accordion; confirm you see their name, jersey number, and a masked identifier like `(**1234)` instead of the full phone number.
3. Click **Upload 360° Video** for a player and check the dialog title: it should read something like “Record 360° Video for John Doe (**1234)”.
4. Verify that uploading or retaking videos still works as before.

## v1.2.0 (2025-01-21)

### What changed
- Promo codes can now be restricted to specific users:
  - When creating or editing a promo code, you can select which users are allowed to use it.
  - If you don't select any users, the promo code works for everyone (subject to other restrictions like cities, matches, first-time users, etc.).
  - If you select specific users, only those users can redeem the promo code.
  - The promo code detail page shows which users are allowed to use it.

### How to test
1. Go to **Promo Codes** → click **Create**.
2. Fill in the basic promo code details (code, discount, dates, etc.).
3. Scroll to the **Eligibility Rules** section.
4. In the **Allowed Users** field, search for and select one or more users.
5. Save the promo code.
6. Open the promo code detail page (click **Show**) and verify the selected users are displayed.
7. Try to validate the promo code with a user who is NOT in the allowed list (should fail with "This promo code is not available for your account").
8. Try to validate the promo code with a user who IS in the allowed list (should work if other conditions are met).

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


