# ParkEase — Database Schema (MongoDB / Mongoose)

```
User
 ├─ role: admin | owner | guard | user
 ├─ approvalStatus (owners only): pending | approved | rejected
 └─ assignedMall (guards only) -> Mall

Mall
 ├─ owner -> User
 ├─ status: pending | approved | rejected
 └─ pricing { hourly, daily, monthly }

ParkingFloor
 ├─ mall -> Mall
 └─ level, name

ParkingSlot
 ├─ mall -> Mall, floor -> ParkingFloor
 ├─ status: available | occupied | reserved | maintenance
 └─ currentBooking -> Booking

Booking
 ├─ user -> User, mall -> Mall, floor -> ParkingFloor, slot -> ParkingSlot
 ├─ status: pending | confirmed | entered | completed | cancelled | expired
 ├─ qrHash, qrExpiresAt
 ├─ pricing { baseAmount, extraCharges, lateExitCharges, gst, totalAmount }
 └─ payment -> Payment

Payment
 ├─ booking -> Booking, user -> User
 └─ status: pending | success | failed | refunded

Notification
 └─ user -> User, type, title, message, isRead

AuditLog
 └─ actor -> User, action, targetType, targetId, details
```

### Key relationships
- One `Mall` has many `ParkingFloor`s; one floor has many `ParkingSlot`s.
- One `Booking` locks exactly one `ParkingSlot` for its duration (`currentBooking` back-reference).
- `Payment` is 1:1 with `Booking` in this dummy-gateway implementation.
