Quick checks

Backend must be running; otherwise the frontend will get HTML from Vite instead of JSON (per your memories).
Start: npm run dev:backend or npm run dev
Verify: GET http://localhost:3001/health should return JSON OK.
Ensure FRONTEND_URL is set in backend env so invite links point to your app (defaults to config.FRONTEND_URL).
When accepting an invite, the authenticated user’s email must equal invitedUser.email in the invitation. Otherwise 
accept
 returns 400.
How to test in 2 minutes
Use any REST client (curl/Postman). Replace IDs/tokens accordingly.

Create an invitation (auth required)
Request: POST http://localhost:3001/api/invitations
Headers: Authorization: Bearer <your_jwt>, Content-Type: application/json
Body:
json
{
  "email": "invitee@example.com",
  "name": "Invitee",
  "targetEntity": { "type": "Workspace", "id": "<workspaceId>" },
  "role": "member",
  "message": "Join us"
}
Expected: 201 with invitation.token and inviteUrl.
Fetch invitation publicly
GET http://localhost:3001/api/invitations/token/<token>
Expected: 200 with invitation metadata while status is pending and not expired.
Accept invitation (auth required as the invited user)
Login as invitee@example.com (the email in the invitation).
POST http://localhost:3001/api/invitations/token/<token>/accept
Headers: Authorization: Bearer <jwt-of-invitee>
Expected: 200 and the user gains membership/role on the entity.
Decline (alternative)
POST http://localhost:3001/api/invitations/token/<token>/decline with invitee’s JWT.
Common pitfalls
Backend not running on 3001: you’ll see HTML responses instead of JSON.
Accepting with the wrong account: controller checks invitation.invitedUser.email === req.user.email.
Assigning admin role without being owner/admin: controller enforces role assignment rules.
Emails not arriving in dev: 
email.js
 logs emails if SMTP isn’t configured; use the API response’s inviteUrl for testing.