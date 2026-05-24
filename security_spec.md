# Security Specification - Lumina Beauty

## Data Invariants
1. Appointments MUST belong to a valid serviceId.
2. Inquiries MUST have a valid email format.
3. Users can only read/write their own appointments if authenticated, or manage them via email/ID reference if guest. For simplicity in this marketing site, we will allow create for anyone but read only for that user.
4. Services and Products are read-only for public, write-only for admins.

## The Dirty Dozen Payloads
1. Create appointment with empty serviceId.
2. Create appointment with date in the past (handled by app logic, but rules should check basic types).
3. Update someone else's appointment.
4. Inject 1MB string into inquiry message.
5. Delete a service (Public).
6. Update product price to 0.00 (Public).
7. Create appointment with "status": "confirmed" (Only admins should confirm).
8. Read all inquiries (Public).
9. Spoof userId in appointment.
10. Massive array of service refs in appointment.
11. Update 'createdAt' on inquiry.
12. Inject script into customerName.

## Test Runner
See `firestore.rules.test.ts`.
