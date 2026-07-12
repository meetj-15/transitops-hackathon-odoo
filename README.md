# TransitOps - Step-by-Step Project Plan

## Project Goal

TransitOps is a transport operations platform for managing vehicles, drivers, trips, maintenance, fuel logs, expenses, and dashboard metrics.

The goal is to build a working hackathon MVP that shows one complete operational flow:

```text
Login
-> Add vehicle
-> Add driver
-> Create trip
-> Dispatch trip
-> Complete trip
-> Add maintenance, fuel, and expense records
-> View updated dashboard
```

## Step 1 - Finalize Team Roles

| Member | Responsibility |
|---|---|
| Member 1 | Auth, dashboard, integration, README |
| Member 2 | Database, vehicles, drivers, seed data |
| Member 3 | Trips, dispatch, complete, cancel workflow |
| Member 4 | Maintenance, fuel, expenses, frontend polish |

## Step 2 - Set Up Foundation

- Create React with Vite frontend.
- Create Express backend.
- Connect PostgreSQL.
- Add `/api/health`.
- Add schema and seed data.

Done when the frontend runs, backend runs, database connects, and seed data can be inserted.

## Step 3 - Build Authentication

- Add login API.
- Add JWT middleware.
- Add protected routes.
- Add login page.

Done when valid users can log in and private pages reject unauthenticated users.

## Step 4 - Build Vehicles

- Add vehicle table and endpoints.
- Add vehicle list and form.
- Block duplicate registration numbers.
- Track `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, and `RETIRED`.

## Step 5 - Build Drivers

- Add driver table and endpoints.
- Add driver list and form.
- Block duplicate licence numbers.
- Track licence expiry and driver status.

## Step 6 - Build Trips

- Create draft trips.
- Link vehicle and driver.
- Validate cargo, source, and destination.

## Step 7 - Build Dispatch Rules

When dispatching, block unavailable vehicles, suspended drivers, expired licences, busy resources, and over-capacity cargo. Dispatch must update trip, vehicle, and driver status inside a SQL transaction.

## Step 8 - Build Completion and Cancellation

- Complete trip and restore vehicle and driver availability.
- Cancel trip and restore availability.
- Validate final odometer readings.

## Step 9 - Build Maintenance

- Open maintenance.
- Set vehicle to `IN_SHOP`.
- Close maintenance and restore availability when allowed.

## Step 10 - Build Fuel and Expenses

- Add fuel logs.
- Add expense records.
- Block negative amounts.

## Step 11 - Build Dashboard

- Show real PostgreSQL metrics.
- Update metrics after trips, maintenance, fuel, and expenses change.

## Step 12 - Polish and Test

- Add loading states.
- Add empty states.
- Add clear errors.
- Add responsive layout.
- Test all major business rules.

## Demo Flow

1. Log in as Fleet Manager.
2. Show dashboard KPIs.
3. Create vehicle `Van-05` with `500 kg` capacity.
4. Create driver `Alex` with a valid licence.
5. Create a trip with `450 kg` cargo.
6. Dispatch the trip.
7. Show vehicle and driver as `ON_TRIP`.
8. Try assigning the same vehicle again and show it is blocked.
9. Try `550 kg` cargo and show capacity validation.
10. Complete the valid trip.
11. Open maintenance and show the vehicle becomes `IN_SHOP`.
12. Add fuel and expense records.
13. Return to dashboard and show updated metrics.

## Priority Rule

Build the complete core workflow first. Do not add optional features until the main demo flow works end to end.
