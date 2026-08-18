# DECISIONS.md

## Project Completion & Scope Decisions

This document records the features and technical decisions that were not fully implemented due to the limited development time available for the assignment.

The core booking flow and the main Customer, Vendor, and Admin workflows were prioritized so that the application could remain functional and demonstrable.

---

## 1. Super Admin

### Status

**Not implemented**

A separate Super Admin role and dedicated Super Admin workflows were not completed.

### Not completed
- Admin Create sub-admin
- Super Admin management of Admin users
- Admin creation/deactivation by Super Admin
- Admin permission management
- Super Admin-specific permissions
- Separate Super Admin workspace

---

## 2. Fogot password

### Status

**Not implemented**

### Not completed

- forget password show link on console

---


## 9. Refund Management

### Status

**Not fully implemented**

### Not completed

- Admin refund UI
- Customer refund requests
- Automatic gateway refunds
- Partial refunds
- Refund approval workflow
- Refund history UI
- Refund notifications

---

## 10. Advanced Booking Features

### Status

**implemented**

The booking system supports availability, exceptions, slots, and the required booking status flow.

### Not completed

- Rescheduling workflow
- Booking modification history
- Recurring bookings
- Waitlists
- Multi-service bookings
- Advanced conflict resolution

---


# Prioritization Decision

Because the assignment had a limited development timeline, implementation was prioritized in the following order:

1. Authentication
2. Role-based access
3. Customer registration/login
4. Vendor registration/login
5. Vendor approval workflow
6. Service management
7. Service offerings
8. Availability and slot generation
9. Customer booking flow
10. Pay Now / Pay Later flow
11. Customer booking management
12. Vendor booking management
13. Admin vendor management
14. Admin service/category management
15. Admin booking management
16. Protected routes
17. Refresh-token authentication
18. Deployment and documentation

Features outside the core booking lifecycle were deferred.

---

# Current Scope

The implemented application demonstrates the primary marketplace workflow.

## Customer

```text
Customer
   ↓
Browse Services
   ↓
Select Offering
   ↓
Select Availability
   ↓
Select Slot
   ↓
Create Booking
   ↓
Pay Now / Pay Later
   ↓
Booking Management