# ParkEase API Reference

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <accessToken>`.

## Auth
| Method | Route | Description |
|---|---|---|
| POST | /auth/register | Register as `user` or `owner` |
| POST | /auth/login | Log in, returns access + refresh tokens |
| POST | /auth/refresh | Exchange a refresh token for a new access token |
| POST | /auth/logout | Invalidate the stored refresh token |
| POST | /auth/forgot-password | Send a password reset email |
| POST | /auth/reset-password/:token | Set a new password |
| GET | /auth/me | Current user profile |

## Malls
| Method | Route | Description |
|---|---|---|
| GET | /malls | Public search (city, keyword, lat/lng, vehicleType) |
| GET | /malls/:id | Mall details + slot summary |
| POST | /malls | Owner: register a new mall (pending approval) |
| PUT | /malls/:id | Owner/Admin: update mall |
| GET | /malls/owner/mine | Owner: list own malls |
| GET | /malls/:mallId/dashboard | Owner: today's stats |
| GET | /malls/:mallId/bookings | Owner: bookings for a mall |

## Floors & Slots
| Method | Route | Description |
|---|---|---|
| GET | /floors/mall/:mallId | List floors with live slot counts |
| POST | /floors | Owner: create a floor |
| PUT/DELETE | /floors/:id | Owner: update/delete a floor |
| GET | /slots/floor/:floorId | List slots on a floor |
| GET | /slots/mall/:mallId/availability | Availability summary by vehicle type |
| POST | /slots/bulk | Owner: bulk-create slots |
| PUT | /slots/:id | Owner: update a slot |

## Bookings
| Method | Route | Description |
|---|---|---|
| POST | /bookings | Create a booking (atomic slot allocation + QR) |
| GET | /bookings/mine | Current user's bookings |
| GET | /bookings/:id | Booking detail (+ fresh QR if still valid) |
| PUT | /bookings/:id/cancel | Cancel a booking |

## Guard
| Method | Route | Description |
|---|---|---|
| GET | /guard/dashboard | Today's entries/exits/pending |
| POST | /guard/scan | Validate a scanned QR payload |
| POST | /guard/entry/:bookingId | Record vehicle entry |
| POST | /guard/exit/:bookingId | Record vehicle exit + generate bill |

## Admin
| Method | Route | Description |
|---|---|---|
| GET | /admin/dashboard | Platform-wide counts |
| GET | /admin/analytics | Revenue/booking/peak-hour charts |
| GET | /admin/audit-logs | Audit log list |
| GET | /admin/users | List/search users & owners |
| PUT | /admin/users/:id/suspend | Suspend/reinstate a user |
| GET | /admin/malls/pending | Pending mall registrations |
| PUT | /admin/malls/:id/approve | Approve a mall |
| PUT | /admin/malls/:id/reject | Reject a mall |

## Payments
| Method | Route | Description |
|---|---|---|
| GET | /payments/:bookingId | Invoice for a booking |
| GET | /payments/owner/revenue | Owner: daily revenue series |
