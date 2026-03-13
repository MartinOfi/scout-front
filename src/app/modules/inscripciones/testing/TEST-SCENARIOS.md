# Test Scenarios - Inscripciones Module

This document describes all test scenarios covered by the inscripciones module test suite.

**Total Tests:** 230 tests across 4 test files

---

## Table of Contents

1. [InscripcionesStateService (72 tests)](#inscripcionesstateservice-72-tests)
2. [InscripcionesApiService (40 tests)](#inscripcionesapiservice-40-tests)
3. [PagoInscripcionDialogComponent (59 tests)](#pagoinscripciondialogcomponent-59-tests)
4. [InscripcionDetailComponent (59 tests)](#inscripciondetailcomponent-59-tests)

---

## InscripcionesStateService (72 tests)

**File:** `src/app/modules/inscripciones/services/inscripciones-state.service.spec.ts`

### Initial State (2 tests)


| Test                            | Description                    |
| ------------------------------- | ------------------------------ |
| should be created               | Service instantiation          |
| should have initial empty state | Initial signals are empty/null |


### Loading Inscripciones (7 tests)


| Test                                           | Description                                     |
| ---------------------------------------------- | ----------------------------------------------- |
| should load inscripciones and update state     | Fetches list and updates `inscripciones` signal |
| should set loading to true while fetching      | `loading` signal is true during API call        |
| should set loading to false after fetching     | `loading` signal is false after API completes   |
| should handle error when loading inscripciones | Sets `error` signal on API failure              |
| should clear previous error on new load        | Clears error before new API call                |
| should update inscripciones signal             | Signal contains fetched data                    |
| should handle empty response                   | Handles empty array response                    |


### Loading Single Inscripcion (6 tests)


| Test                                      | Description                                            |
| ----------------------------------------- | ------------------------------------------------------ |
| should load single inscripcion            | Fetches by ID and updates `selectedInscripcion` signal |
| should set loading state                  | Loading signal during fetch                            |
| should handle error                       | Error handling for single fetch                        |
| should clear selected on null id          | Clears selection when null passed                      |
| should update selected inscripcion signal | Signal contains fetched data                           |
| should handle not found                   | Handles 404 responses                                  |


### Creating Inscripcion (5 tests)


| Test                              | Description                         |
| --------------------------------- | ----------------------------------- |
| should create inscripcion         | Calls API create and returns result |
| should add to inscripciones list  | Adds new item to list signal        |
| should handle validation error    | Handles 400 validation errors       |
| should handle server error        | Handles 500 server errors           |
| should return created inscripcion | Returns created entity              |


### Updating Inscripcion (5 tests)


| Test                                | Description                         |
| ----------------------------------- | ----------------------------------- |
| should update inscripcion           | Calls API update                    |
| should update in inscripciones list | Updates item in list signal         |
| should update selected if same id   | Updates selected signal if matching |
| should handle not found             | Handles 404 on update               |
| should return updated inscripcion   | Returns updated entity              |


### Deleting Inscripcion (5 tests)


| Test                             | Description                   |
| -------------------------------- | ----------------------------- |
| should delete inscripcion        | Calls API delete              |
| should remove from list          | Removes item from list signal |
| should clear selected if same id | Clears selected if matching   |
| should handle not found          | Handles 404 on delete         |
| should handle server error       | Handles 500 on delete         |


### Payment State Scenarios (42 tests)

#### PENDIENTE State (4 tests)


| Test                                         | Description                          |
| -------------------------------------------- | ------------------------------------ |
| should show PENDIENTE when no payments exist | Estado is PENDIENTE with empty pagos |
| should show montoPendiente equal to monto    | Full amount pending                  |
| should show montoPagado as 0                 | No amount paid                       |
| should show montoBonificado as 0             | No bonification                      |


#### PARCIAL State (5 tests)


| Test                                            | Description                         |
| ----------------------------------------------- | ----------------------------------- |
| should show PARCIAL when partial payment exists | Estado is PARCIAL with partial pago |
| should calculate correct montoPendiente         | Remaining amount calculated         |
| should calculate correct montoPagado            | Paid amount calculated              |
| should handle multiple partial payments         | Sum of multiple pagos               |
| should show correct percentage paid             | Percentage calculation              |


#### PAGADO State - Without Caja Personal (4 tests)


| Test                                   | Description        |
| -------------------------------------- | ------------------ |
| should show PAGADO when fully paid     | Estado is PAGADO   |
| should show montoPendiente as 0        | Nothing pending    |
| should show montoPagado equal to monto | Full amount paid   |
| should handle exact payment            | Exact amount match |


#### PAGADO State - With Caja Personal (5 tests)


| Test                                            | Description              |
| ----------------------------------------------- | ------------------------ |
| should show PAGADO when paid from caja personal | Estado is PAGADO         |
| should show source as caja personal             | usaCajaPersonal is true  |
| should calculate from caja personal balance     | Uses caja personal funds |
| should handle partial caja personal payment     | Mixed payment sources    |
| should show correct caja used                   | Displays caja name       |


#### BONIFICADO Total State (4 tests)


| Test                                       | Description          |
| ------------------------------------------ | -------------------- |
| should show BONIFICADO when 100% bonified  | Estado is BONIFICADO |
| should show montoBonificado equal to monto | Full bonification    |
| should show montoPendiente as 0            | Nothing pending      |
| should show montoPagado as 0               | Nothing paid         |


#### BONIFICADO Partial State (5 tests)


| Test                                          | Description                  |
| --------------------------------------------- | ---------------------------- |
| should show PARCIAL with partial bonification | Estado reflects partial      |
| should calculate correct montoBonificado      | Bonification amount          |
| should calculate correct montoPendiente       | Remaining after bonification |
| should handle bonification + payment          | Combined amounts             |
| should show correct percentages               | Percentage calculations      |


#### MIXTO State (5 tests)


| Test                                        | Description            |
| ------------------------------------------- | ---------------------- |
| should handle payment + bonification combo  | Mixed payment types    |
| should calculate totals correctly           | Sum of all types       |
| should show correct estado based on amounts | Derived estado         |
| should handle overpayment                   | More than required     |
| should handle complex scenarios             | Multiple payment types |


#### CUOTAS En Progreso (5 tests)


| Test                                | Description             |
| ----------------------------------- | ----------------------- |
| should show cuotas progress         | Cuota tracking          |
| should calculate cuotas pagadas     | Count of paid cuotas    |
| should calculate cuotas pendientes  | Count of pending cuotas |
| should show next cuota due date     | Due date calculation    |
| should handle partial cuota payment | Partial cuota amounts   |


#### CUOTAS Completas (5 tests)


| Test                                    | Description           |
| --------------------------------------- | --------------------- |
| should show all cuotas complete         | All cuotas paid       |
| should show PAGADO when all cuotas paid | Estado is PAGADO      |
| should calculate total from cuotas      | Sum of cuota payments |
| should handle cuota overpayment         | Extra cuota payments  |
| should show cuota history               | Payment history       |


---

## InscripcionesApiService (40 tests)

**File:** `src/app/modules/inscripciones/services/inscripciones-api.service.spec.ts`

### Service Initialization (2 tests)


| Test                        | Description           |
| --------------------------- | --------------------- |
| should be created           | Service instantiation |
| should use correct base URL | API URL configuration |


### getAll (6 tests)


| Test                           | Description                   |
| ------------------------------ | ----------------------------- |
| should fetch all inscripciones | GET request to /inscripciones |
| should handle empty response   | Empty array handling          |
| should handle server error     | 500 error handling            |
| should handle network error    | Network failure handling      |
| should include auth headers    | JWT token in headers          |
| should map response correctly  | DTO to model mapping          |


### getById (6 tests)


| Test                           | Description                       |
| ------------------------------ | --------------------------------- |
| should fetch inscripcion by id | GET request to /inscripciones/:id |
| should handle not found        | 404 error handling                |
| should handle invalid id       | Invalid ID format                 |
| should handle server error     | 500 error handling                |
| should include auth headers    | JWT token in headers              |
| should map response correctly  | DTO to model mapping              |


### getByPersona (5 tests)


| Test                                     | Description                  |
| ---------------------------------------- | ---------------------------- |
| should fetch inscripciones by persona id | GET with persona filter      |
| should handle empty response             | No inscripciones for persona |
| should handle not found persona          | 404 for persona              |
| should handle server error               | 500 error handling           |
| should map response correctly            | DTO to model mapping         |


### create (5 tests)


| Test                              | Description             |
| --------------------------------- | ----------------------- |
| should create inscripcion         | POST to /inscripciones  |
| should send correct payload       | Request body validation |
| should handle validation error    | 400 error handling      |
| should handle server error        | 500 error handling      |
| should return created inscripcion | Response handling       |


### update (5 tests)


| Test                              | Description               |
| --------------------------------- | ------------------------- |
| should update inscripcion         | PUT to /inscripciones/:id |
| should send correct payload       | Request body validation   |
| should handle not found           | 404 error handling        |
| should handle validation error    | 400 error handling        |
| should return updated inscripcion | Response handling         |


### delete (4 tests)


| Test                          | Description                  |
| ----------------------------- | ---------------------------- |
| should delete inscripcion     | DELETE to /inscripciones/:id |
| should handle not found       | 404 error handling           |
| should handle server error    | 500 error handling           |
| should return void on success | No content response          |


### pagarInscripcion (3 tests)


| Test                              | Description                      |
| --------------------------------- | -------------------------------- |
| should create payment             | POST to /inscripciones/:id/pagos |
| should send correct payment data  | Payment payload validation       |
| should return updated inscripcion | Response with new payment        |


### updatePago (2 tests)


| Test                              | Description                             |
| --------------------------------- | --------------------------------------- |
| should update payment             | PUT to /inscripciones/:id/pagos/:pagoId |
| should return updated inscripcion | Response with updated payment           |


### deletePago (2 tests)


| Test                              | Description                                |
| --------------------------------- | ------------------------------------------ |
| should delete payment             | DELETE to /inscripciones/:id/pagos/:pagoId |
| should return updated inscripcion | Response without deleted payment           |


---

## PagoInscripcionDialogComponent (59 tests)

**File:** `src/app/modules/inscripciones/components/shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component.spec.ts`

### Component Initialization (3 tests)


| Test                      | Description               |
| ------------------------- | ------------------------- |
| should create             | Component instantiation   |
| should inject dialog ref  | MatDialogRef injection    |
| should inject dialog data | MAT_DIALOG_DATA injection |


### Create Mode (12 tests)


| Test                                      | Description                  |
| ----------------------------------------- | ---------------------------- |
| should show create title                  | Dialog title for new payment |
| should initialize empty form              | Form starts empty            |
| should show monto field                   | Amount input visible         |
| should show fecha field                   | Date input visible           |
| should show metodoPago field              | Payment method select        |
| should show observaciones field           | Notes textarea               |
| should show usaCajaPersonal toggle        | Caja personal option         |
| should hide caja selector when toggle off | Conditional visibility       |
| should show caja selector when toggle on  | Conditional visibility       |
| should enable save button when valid      | Form validation              |
| should disable save button when invalid   | Form validation              |
| should emit create result on save         | Dialog result                |


### Edit Mode (12 tests)


| Test                                 | Description              |
| ------------------------------------ | ------------------------ |
| should show edit title               | Dialog title for editing |
| should populate form with pago data  | Pre-filled form          |
| should show existing monto           | Amount pre-filled        |
| should show existing fecha           | Date pre-filled          |
| should show existing metodoPago      | Method pre-filled        |
| should show existing observaciones   | Notes pre-filled         |
| should show existing usaCajaPersonal | Toggle pre-set           |
| should show existing caja            | Caja pre-selected        |
| should show delete button            | Delete option visible    |
| should enable save button when valid | Form validation          |
| should emit edit result on save      | Dialog result            |
| should emit delete result on delete  | Dialog result            |


### Form Validation (12 tests)


| Test                                     | Description             |
| ---------------------------------------- | ----------------------- |
| should require monto                     | Amount required         |
| should require monto > 0                 | Positive amount         |
| should require monto <= montoPendiente   | Max amount validation   |
| should require fecha                     | Date required           |
| should require fecha not future          | Future date validation  |
| should require metodoPago                | Method required         |
| should require caja when usaCajaPersonal | Conditional requirement |
| should show monto error message          | Error display           |
| should show fecha error message          | Error display           |
| should show metodoPago error message     | Error display           |
| should show caja error message           | Error display           |
| should clear errors on valid input       | Error clearing          |


### Computed Properties (10 tests)


| Test                                 | Description               |
| ------------------------------------ | ------------------------- |
| should compute montoPendiente        | Remaining amount          |
| should compute montoPagado           | Paid amount               |
| should compute porcentajePagado      | Percentage calculation    |
| should compute isFullPayment         | Full payment detection    |
| should compute remaining after input | Dynamic calculation       |
| should compute with existing pagos   | Multiple payment handling |
| should compute with bonificacion     | Bonification handling     |
| should update on form changes        | Reactive updates          |
| should handle edge cases             | Zero, negative, etc.      |
| should format currency correctly     | Display formatting        |


### Dialog Actions (10 tests)


| Test                                 | Description           |
| ------------------------------------ | --------------------- |
| should close on cancel               | Cancel button         |
| should close with null on cancel     | No result on cancel   |
| should close with create result      | Create submission     |
| should close with edit result        | Edit submission       |
| should close with delete result      | Delete confirmation   |
| should show delete confirmation      | Confirmation dialog   |
| should cancel delete on decline      | Confirmation declined |
| should handle form submission        | Submit handler        |
| should disable actions while loading | Loading state         |
| should show loading indicator        | Spinner display       |


---

## InscripcionDetailComponent (59 tests)

**File:** `src/app/modules/inscripciones/components/inscripcion-detail/inscripcion-detail.component.spec.ts`

### Component Initialization (5 tests)


| Test                            | Description             |
| ------------------------------- | ----------------------- |
| should create                   | Component instantiation |
| should load inscripcion on init | Initial data fetch      |
| should show loading state       | Loading indicator       |
| should handle not found         | 404 handling            |
| should display inscripcion data | Data binding            |


### Header Section (6 tests)


| Test                            | Description        |
| ------------------------------- | ------------------ |
| should show persona name        | Persona display    |
| should show periodo             | Period display     |
| should show estado badge        | Status badge       |
| should show correct badge color | Status-based color |
| should show edit button         | Edit action        |
| should show delete button       | Delete action      |


### Payment Summary Section (8 tests)


| Test                             | Description      |
| -------------------------------- | ---------------- |
| should show monto total          | Total amount     |
| should show monto pagado         | Paid amount      |
| should show monto pendiente      | Pending amount   |
| should show monto bonificado     | Bonified amount  |
| should show percentage progress  | Progress bar     |
| should update on payment changes | Reactive updates |
| should format currency           | Currency display |
| should show payment breakdown    | Amount breakdown |


### Pagos List Section (10 tests)


| Test                                  | Description           |
| ------------------------------------- | --------------------- |
| should show pagos table               | Table display         |
| should show empty state when no pagos | Empty message         |
| should show pago fecha                | Date column           |
| should show pago monto                | Amount column         |
| should show pago metodo               | Method column         |
| should show pago observaciones        | Notes column          |
| should show edit action               | Edit button per row   |
| should show delete action             | Delete button per row |
| should sort by fecha desc             | Default sorting       |
| should paginate pagos                 | Pagination            |


### Add Payment Action (6 tests)


| Test                                          | Description        |
| --------------------------------------------- | ------------------ |
| should show add payment button                | Button visibility  |
| should disable when fully paid                | Button state       |
| should open payment dialog                    | Dialog opening     |
| should pass correct dialog data               | Dialog data        |
| should call pagarInscripcion on create result | API call on create |
| should refresh data after payment             | Data reload        |


### Edit Payment Action (6 tests)


| Test                                  | Description        |
| ------------------------------------- | ------------------ |
| should open edit dialog               | Dialog opening     |
| should pass pago data to dialog       | Dialog data        |
| should call updatePago on edit result | API call on edit   |
| should refresh data after update      | Data reload        |
| should handle dialog cancel           | Cancel handling    |
| should show success message           | Toast notification |


### Delete Payment Action (6 tests)


| Test                                    | Description        |
| --------------------------------------- | ------------------ |
| should open delete dialog from edit     | Dialog trigger     |
| should call deletePago on delete result | API call on delete |
| should refresh data after delete        | Data reload        |
| should show confirmation dialog         | Confirmation       |
| should handle delete cancel             | Cancel handling    |
| should show success message             | Toast notification |


### Navigation Actions (6 tests)


| Test                                   | Description            |
| -------------------------------------- | ---------------------- |
| should navigate to edit page           | Edit navigation        |
| should navigate back to list           | Back navigation        |
| should show confirm on unsaved changes | Unsaved warning        |
| should handle delete inscripcion       | Delete action          |
| should navigate after delete           | Post-delete navigation |
| should handle navigation errors        | Error handling         |


### Error Handling (6 tests)


| Test                                 | Description           |
| ------------------------------------ | --------------------- |
| should show error on load failure    | Load error display    |
| should show error on payment failure | Payment error display |
| should show error on update failure  | Update error display  |
| should show error on delete failure  | Delete error display  |
| should allow retry on error          | Retry action          |
| should clear error on success        | Error clearing        |


---

## Running Tests

```bash
# Run all inscripciones tests
npm test

# Run specific test file
npm test -- --include='**/inscripciones/**/*.spec.ts'

# Run with coverage
npm test -- --code-coverage
```

## Test File Locations


| File             | Path                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| State Service    | `src/app/modules/inscripciones/services/inscripciones-state.service.spec.ts`                                        |
| API Service      | `src/app/modules/inscripciones/services/inscripciones-api.service.spec.ts`                                          |
| Payment Dialog   | `src/app/modules/inscripciones/components/shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component.spec.ts` |
| Detail Component | `src/app/modules/inscripciones/components/inscripcion-detail/inscripcion-detail.component.spec.ts`                  |


---

*Last updated: 2026-03-13*
 