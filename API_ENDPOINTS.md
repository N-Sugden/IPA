# Raumplaner API – Endpoint Specification

> Backend REST API for the Rafisa room planning application.
> Authentication & Authorization via Microsoft Entra ID (not part of this backend scope).

---

## Base URL

```
/api
http://172.17.13.30:3000/api
```

All endpoints return JSON. All request bodies are JSON (`Content-Type: application/json`).

---

## Authentication

Every request must include a valid **Bearer token** (Microsoft Entra ID) in the `Authorization` header.

```
Authorization: Bearer <token>
```

### Roles

| Role         | Description                          |
| ------------ | ------------------------------------ |
| `Employee`   | Full access (CRUD on all resources)  |
| `Learner`    | Read access + move objects in rooms  |

---

## Data Model Overview

```
Room
 ├── id           (GUID)
 ├── name         (string)
 ├── width        (double, in cm)
 ├── length       (double, in cm)
 ├── createdAt    (datetime)
 └── updatedAt    (datetime)

ObjectType
 ├── id           (GUID)
 └── name         (string, e.g. "Tisch", "Stuhl", "Tür", "Schrank")

RoomObject
 ├── id           (GUID)
 ├── roomId       (GUID, FK → Room)
 ├── objectTypeId (GUID, FK → ObjectType)
 ├── name         (string, optional label)
 ├── width        (double, in cm)
 ├── length       (double, in cm)
 ├── positionX    (double, in cm from left)
 ├── positionY    (double, in cm from top)
 ├── rotation     (double, degrees 0–360)
 ├── createdAt    (datetime)
 └── updatedAt    (datetime)
```

---

## Endpoints

### 1. Rooms (`/api/rooms`)

#### `GET /api/rooms`

List all rooms.

- **Auth:** Employee, Learner
- **Response:** `200 OK`

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Büro Bern 1. OG",
    "width": 500.0,
    "length": 400.0,
    "createdAt": "2026-02-10T08:00:00Z",
    "updatedAt": "2026-02-10T08:00:00Z"
  }
]
```

---

#### `GET /api/rooms/{id}`

Get a single room by ID.

- **Auth:** Employee, Learner
- **Path Parameters:** `id` (GUID)
- **Response:** `200 OK` | `404 Not Found`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Büro Bern 1. OG",
  "width": 500.0,
  "length": 400.0,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:00:00Z"
}
```

---

#### `POST /api/rooms`

Create a new room.

- **Auth:** Employee
- **Request Body:**

```json
{
  "name": "Büro Bern 1. OG",
  "width": 500.0,
  "length": 400.0
}
```

| Field    | Type   | Required | Validation         |
| -------- | ------ | -------- | ------------------ |
| `name`   | string | yes      | max 100 chars      |
| `width`  | double | yes      | > 0                |
| `length` | double | yes      | > 0                |

- **Response:** `201 Created` (Location header set)

---

#### `PUT /api/rooms/{id}`

Update an existing room.

- **Auth:** Employee
- **Path Parameters:** `id` (GUID)
- **Request Body:**

```json
{
  "name": "Büro Bern 2. OG",
  "width": 600.0,
  "length": 450.0
}
```

| Field    | Type   | Required | Validation         |
| -------- | ------ | -------- | ------------------ |
| `name`   | string | yes      | max 100 chars      |
| `width`  | double | yes      | > 0                |
| `length` | double | yes      | > 0                |

- **Response:** `200 OK` | `404 Not Found`

---

#### `DELETE /api/rooms/{id}`

Delete a room and all its placed objects.

- **Auth:** Employee
- **Path Parameters:** `id` (GUID)
- **Response:** `204 No Content` | `404 Not Found`

---

### 2. Object Types (`/api/object-types`)

#### `GET /api/object-types`

List all available object types.

- **Auth:** Employee, Learner
- **Response:** `200 OK`

```json
[
  { "id": "...", "name": "Tisch" },
  { "id": "...", "name": "Stuhl" },
  { "id": "...", "name": "Tür" },
  { "id": "...", "name": "Schrank" },
  { "id": "...", "name": "Fenster" }
]
```

---

#### `GET /api/object-types/{id}`

Get a single object type.

- **Auth:** Employee, Learner
- **Path Parameters:** `id` (GUID)
- **Response:** `200 OK` | `404 Not Found`

---

#### `POST /api/object-types`

Create a new object type.

- **Auth:** Employee
- **Request Body:**

```json
{
  "name": "Monitor"
}
```

| Field  | Type   | Required | Validation              |
| ------ | ------ | -------- | ----------------------- |
| `name` | string | yes      | max 50 chars, unique    |

- **Response:** `201 Created`

---

#### `PUT /api/object-types/{id}`

Update an object type.

- **Auth:** Employee
- **Path Parameters:** `id` (GUID)
- **Request Body:**

```json
{
  "name": "Bildschirm"
}
```

- **Response:** `200 OK` | `404 Not Found`

---

#### `DELETE /api/object-types/{id}`

Delete an object type. Fails if objects of this type still exist.

- **Auth:** Employee
- **Path Parameters:** `id` (GUID)
- **Response:** `204 No Content` | `404 Not Found` | `409 Conflict`

---

### 3. Room Objects (`/api/rooms/{roomId}/objects`)

Objects placed inside a specific room.

#### `GET /api/rooms/{roomId}/objects`

List all objects in a room.

- **Auth:** Employee, Learner
- **Path Parameters:** `roomId` (GUID)
- **Response:** `200 OK` | `404 Not Found` (room not found)

```json
[
  {
    "id": "...",
    "roomId": "...",
    "objectTypeId": "...",
    "objectTypeName": "Tisch",
    "name": "Arbeitsplatz 1",
    "width": 160.0,
    "length": 80.0,
    "positionX": 50.0,
    "positionY": 120.0,
    "rotation": 0.0,
    "createdAt": "2026-02-10T08:00:00Z",
    "updatedAt": "2026-02-10T08:00:00Z"
  }
]
```

---

#### `GET /api/rooms/{roomId}/objects/{id}`

Get a single object placement.

- **Auth:** Employee, Learner
- **Path Parameters:** `roomId` (GUID), `id` (GUID)
- **Response:** `200 OK` | `404 Not Found`

---

#### `POST /api/rooms/{roomId}/objects`

Place a new object in a room.

- **Auth:** Employee
- **Path Parameters:** `roomId` (GUID)
- **Request Body:**

```json
{
  "objectTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Arbeitsplatz 1",
  "width": 160.0,
  "length": 80.0,
  "positionX": 50.0,
  "positionY": 120.0,
  "rotation": 0.0
}
```

| Field          | Type   | Required | Validation                |
| -------------- | ------ | -------- | ------------------------- |
| `objectTypeId` | GUID   | yes      | must exist                |
| `name`         | string | no       | max 100 chars             |
| `width`        | double | yes      | > 0                       |
| `length`       | double | yes      | > 0                       |
| `positionX`    | double | yes      | >= 0                      |
| `positionY`    | double | yes      | >= 0                      |
| `rotation`     | double | no       | 0–360, default 0          |

- **Response:** `201 Created` | `404 Not Found` (room/type not found)

---

#### `PUT /api/rooms/{roomId}/objects/{id}`

Full update of an object in a room (edit all properties).

- **Auth:** Employee
- **Path Parameters:** `roomId` (GUID), `id` (GUID)
- **Request Body:**

```json
{
  "objectTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Arbeitsplatz 2",
  "width": 180.0,
  "length": 90.0,
  "positionX": 60.0,
  "positionY": 130.0,
  "rotation": 90.0
}
```

| Field          | Type   | Required | Validation                |
| -------------- | ------ | -------- | ------------------------- |
| `objectTypeId` | GUID   | yes      | must exist                |
| `name`         | string | no       | max 100 chars             |
| `width`        | double | yes      | > 0                       |
| `length`       | double | yes      | > 0                       |
| `positionX`    | double | yes      | >= 0                      |
| `positionY`    | double | yes      | >= 0                      |
| `rotation`     | double | no       | 0–360, default 0          |

- **Response:** `200 OK` | `404 Not Found`

---

#### `PATCH /api/rooms/{roomId}/objects/{id}/position`

Update only the position of an object (Drag & Drop).

- **Auth:** Employee, **Learner**
- **Path Parameters:** `roomId` (GUID), `id` (GUID)
- **Request Body:**

```json
{
  "positionX": 200.0,
  "positionY": 150.0,
  "rotation": 45.0
}
```

| Field       | Type   | Required | Validation       |
| ----------- | ------ | -------- | ---------------- |
| `positionX` | double | yes      | >= 0             |
| `positionY` | double | yes      | >= 0             |
| `rotation`  | double | no       | 0–360            |

- **Response:** `200 OK` | `404 Not Found`

> This is the endpoint the frontend calls during drag & drop.
> Learners are authorized to use this endpoint so they can rearrange furniture.

---

#### `DELETE /api/rooms/{roomId}/objects/{id}`

Remove an object from a room.

- **Auth:** Employee
- **Path Parameters:** `roomId` (GUID), `id` (GUID)
- **Response:** `204 No Content` | `404 Not Found`

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "Room with id '...' was not found.",
  "traceId": "00-..."
}
```

### Common Status Codes

| Code  | Meaning                                               |
| ----- | ----------------------------------------------------- |
| `200` | OK – Request successful                               |
| `201` | Created – Resource created successfully               |
| `204` | No Content – Deletion successful                      |
| `400` | Bad Request – Validation error                        |
| `401` | Unauthorized – Missing or invalid token               |
| `403` | Forbidden – Insufficient role                         |
| `404` | Not Found – Resource does not exist                   |
| `409` | Conflict – Cannot delete (dependencies exist)         |
| `500` | Internal Server Error                                 |

---

## Endpoint Summary

| Method  | Endpoint                                        | Employee | Learner | Description                     |
| ------- | ----------------------------------------------- | :------: | :-----: | ------------------------------- |
| GET     | `/api/rooms`                                    | ✅       | ✅      | List all rooms                  |
| GET     | `/api/rooms/{id}`                               | ✅       | ✅      | Get room by ID                  |
| POST    | `/api/rooms`                                    | ✅       | ❌      | Create room                     |
| PUT     | `/api/rooms/{id}`                               | ✅       | ❌      | Update room                     |
| DELETE  | `/api/rooms/{id}`                               | ✅       | ❌      | Delete room                     |
| GET     | `/api/object-types`                             | ✅       | ✅      | List object types               |
| GET     | `/api/object-types/{id}`                        | ✅       | ✅      | Get object type                 |
| POST    | `/api/object-types`                             | ✅       | ❌      | Create object type              |
| PUT     | `/api/object-types/{id}`                        | ✅       | ❌      | Update object type              |
| DELETE  | `/api/object-types/{id}`                        | ✅       | ❌      | Delete object type              |
| GET     | `/api/rooms/{roomId}/objects`                   | ✅       | ✅      | List objects in room            |
| GET     | `/api/rooms/{roomId}/objects/{id}`              | ✅       | ✅      | Get single object in room       |
| POST    | `/api/rooms/{roomId}/objects`                   | ✅       | ❌      | Place object in room            |
| PUT     | `/api/rooms/{roomId}/objects/{id}`              | ✅       | ❌      | Update object in room           |
| PATCH   | `/api/rooms/{roomId}/objects/{id}/position`     | ✅       | ✅      | Move object (Drag & Drop)       |
| DELETE  | `/api/rooms/{roomId}/objects/{id}`              | ✅       | ❌      | Remove object from room         |

**Total: 16 endpoints**
