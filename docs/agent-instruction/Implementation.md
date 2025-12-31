# Hospital Information System - Tech Stack & Implementation Plan

## Tech Stack

### Frontend
- **Nuxt 4** (Vue 3 + SSR)
- **Naive UI** - Modern Vue 3 UI Library
- **TypeScript** - Type safety
- **Pinia** - State management
- **VueUse** - Utility composables
- **Day.js** - Date handling
- **Zod** - Runtime validation

### Backend
- **Nuxt 4 Server Routes** - API endpoints
- **Drizzle ORM** - Type-safe database queries
- **Drizzle Kit** - Database migrations
- **PostgreSQL** - Primary database
- **Zod** - Request validation

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** (Docker image)
- **Node 20 Alpine** - Base image

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **pnpm** - Package manager

---

## Project Structure

```
his-app/
├── server/
│   ├── api/
│   │   ├── doctors/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   └── [id].put.ts
│   │   ├── patients/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   └── [id].put.ts
│   │   ├── registrations/
│   │   ├── vital-signs/
│   │   ├── examinations/
│   │   ├── recommendations/
│   │   └── comments/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── doctors.ts
│   │   │   ├── patients.ts
│   │   │   ├── registrations.ts
│   │   │   ├── vital-signs.ts
│   │   │   ├── examinations.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── migrate.ts
│   └── middleware/
│       └── auth.ts
├── pages/
│   ├── index.vue
│   ├── doctors/
│   │   ├── index.vue
│   │   └── [id].vue
│   ├── patients/
│   │   ├── index.vue
│   │   └── [id]/
│   │       ├── index.vue
│   │       ├── history.vue
│   │       ├── vitals.vue
│   │       ├── examination.vue
│   │       ├── recommendation.vue
│   │       └── treating-doctor.vue
├── components/
│   ├── forms/
│   │   ├── DoctorForm.vue
│   │   ├── PatientForm.vue
│   │   ├── VitalSignsForm.vue
│   │   └── ExaminationForm.vue
│   ├── tables/
│   │   ├── DoctorTable.vue
│   │   └── PatientTable.vue
│   └── layout/
│       ├── Toolbar.vue
│       └── TabNavigation.vue
├── composables/
│   ├── useDoctor.ts
│   ├── usePatient.ts
│   └── useRegistration.ts
├── types/
│   ├── doctor.ts
│   ├── patient.ts
│   └── registration.ts
├── drizzle/
│   └── migrations/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── drizzle.config.ts
└── nuxt.config.ts
```

---

## Database Schema (Drizzle)

### Core Tables

```typescript
// doctors
- id (uuid, primary key)
- doctor_id (varchar, unique)
- nick_name (varchar)
- full_name (varchar)
- address (text)
- phone_1 (varchar)
- phone_2 (varchar)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

// patients
- id (uuid, primary key)
- registration_number (varchar, unique)
- registration_date (timestamp)
- mr_number (varchar)
- full_name (varchar)
- phone (varchar)
- age (integer)
- age_unit (enum: years/months/days)
- nationality (varchar)
- sex (enum: male/female)
- admission_date (date)
- discharge_date (date)
- ward (varchar)
- current_address (text)
- created_at (timestamp)
- updated_at (timestamp)

// medical_history
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- present_complaint (text)
- past_medical_history (text)
- allergic_history (text)
- current_medication (text)
- created_at (timestamp)
- updated_at (timestamp)

// vital_signs
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- pulse_rate (decimal) // per minute
- blood_pressure (varchar) // mmhg
- respiratory_rate (decimal) // per minute
- temperature (decimal) // celsius
- spo2 (decimal) // percentage
- gcs (integer)
- recorded_at (timestamp)
- created_at (timestamp)

// examinations
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- physical_examination (text)
- other_examination (text) // Radiology, Lab, etc
- diagnosis (text)
- differential_diagnosis (text)
- treatment (text)
- created_at (timestamp)
- updated_at (timestamp)

// doctor_recommendations
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- request_repatriation (boolean)
- requires_evacuation (boolean)
- can_be_transported (boolean)
- fit_to_fly (boolean)
- needs_wheelchair (boolean)
- notes (text)
- created_at (timestamp)

// treating_doctors
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- doctor_id (uuid, foreign key)
- doctor_sequence (integer) // 1,2,3,4
- assigned_at (timestamp)

// comments
- id (uuid, primary key)
- patient_id (uuid, foreign key)
- comment_text (text)
- created_by (uuid)
- created_at (timestamp)
```

---

## Implementation Plan

### Phase 1: Project Setup (Day 1-2)

**Tasks:**
1. Initialize Nuxt 4 project
   ```bash
   npx nuxi@latest init his-app
   cd his-app
   pnpm install
   ```

2. Install dependencies
   ```bash
   pnpm add naive-ui
   pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit
   pnpm add zod
   pnpm add dayjs
   pnpm add @vueuse/core
   ```

3. Setup Docker environment
   - Create `docker-compose.yml`
   - Create `Dockerfile`
   - Create `.env.example`

4. Initialize Drizzle ORM
   - Create `drizzle.config.ts`
   - Setup database connection
   - Create initial schema files

5. Configure Naive UI in Nuxt
   - Create plugin for Naive UI
   - Setup global theme configuration

**Deliverables:**
- Working development environment
- Database running in Docker
- Naive UI components accessible

---

### Phase 2: Database Schema & Migrations (Day 3-4)

**Tasks:**
1. Define all schema files in `server/db/schema/`
   - `doctors.ts`
   - `patients.ts`
   - `medical-history.ts`
   - `vital-signs.ts`
   - `examinations.ts`
   - `recommendations.ts`
   - `treating-doctors.ts`
   - `comments.ts`

2. Create relationships between tables

3. Generate and run migrations
   ```bash
   pnpm drizzle-kit generate:pg
   pnpm drizzle-kit push:pg
   ```

4. Create seed data script for testing

**Deliverables:**
- Complete database schema
- Migration files
- Seed data script

---

### Phase 3: Doctor Module (Day 5-7)

**Tasks:**
1. Create Doctor API endpoints
   - GET `/api/doctors` - List all doctors
   - POST `/api/doctors` - Create doctor
   - GET `/api/doctors/:id` - Get single doctor
   - PUT `/api/doctors/:id` - Update doctor
   - DELETE `/api/doctors/:id` - Soft delete doctor

2. Create Doctor UI components
   - `DoctorForm.vue` - Form with validation
   - `DoctorTable.vue` - Data table with search
   - `DoctorToolbar.vue` - Action buttons

3. Create Doctor pages
   - `/pages/doctors/index.vue` - List page
   - `/pages/doctors/[id].vue` - Detail/Edit page

4. Create composable
   - `composables/useDoctor.ts` - CRUD operations

5. Implement features:
   - Add/Edit/Delete doctor
   - Search by ID/Name
   - Active/Inactive toggle
   - Form validation (Zod)

**Deliverables:**
- Complete Doctor module
- CRUD operations working
- Validation and error handling

---

### Phase 4: Patient Registration Module (Day 8-12)

**Tasks:**
1. Create Patient API endpoints
   - GET `/api/patients` - List with pagination
   - POST `/api/patients` - Create registration
   - GET `/api/patients/:id` - Get patient details
   - PUT `/api/patients/:id` - Update patient
   - GET `/api/patients/:id/full` - Full medical record

2. Create Patient UI components
   - `PatientForm.vue` - Registration form
   - `PatientTable.vue` - Patient list
   - `PatientHeader.vue` - Common patient info header

3. Create Patient pages
   - `/pages/patients/index.vue` - Patient list
   - `/pages/patients/[id]/index.vue` - Overview with tabs

4. Implement tab navigation:
   - Medical History & Treatment
   - Vital Signs
   - Examination & Diagnosis
   - Doctor's Recommendation
   - Treating Doctor
   - Comment

5. Create composables
   - `composables/usePatient.ts`
   - `composables/useRegistration.ts`

**Deliverables:**
- Patient registration working
- Tab navigation functional
- Patient list with search

---

### Phase 5: Medical History & Treatment (Day 13-15)

**Tasks:**
1. Create API endpoints
   - GET `/api/patients/:id/history`
   - POST `/api/patients/:id/history`
   - PUT `/api/patients/:id/history/:historyId`

2. Create UI component
   - `MedicalHistoryForm.vue` - 4 text areas

3. Implement autosave functionality

4. Add spell check integration

**Deliverables:**
- Medical history CRUD
- Autosave feature
- Data persistence

---

### Phase 6: Vital Signs Module (Day 16-17)

**Tasks:**
1. Create API endpoints
   - GET `/api/patients/:id/vitals`
   - POST `/api/patients/:id/vitals`

2. Create UI component
   - `VitalSignsForm.vue` - Numeric inputs with units

3. Add input validation (ranges)

4. Show historical vital signs (chart optional)

**Deliverables:**
- Vital signs recording
- Input validation
- Historical data view

---

### Phase 7: Examination & Diagnosis (Day 18-20)

**Tasks:**
1. Create API endpoints
   - GET `/api/patients/:id/examinations`
   - POST `/api/patients/:id/examinations`
   - PUT `/api/patients/:id/examinations/:examId`

2. Create UI component
   - `ExaminationForm.vue` - Multiple text areas

3. Implement features:
   - Physical examination notes
   - Other examinations (Radiology, Lab)
   - Diagnosis
   - Differential diagnosis
   - Treatment plan

**Deliverables:**
- Examination module complete
- All text areas functional
- Save and update working

---

### Phase 8: Doctor's Recommendation (Day 21-22)

**Tasks:**
1. Create API endpoints
   - GET `/api/patients/:id/recommendations`
   - POST `/api/patients/:id/recommendations`
   - PUT `/api/patients/:id/recommendations/:recId`

2. Create UI component
   - `RecommendationForm.vue` - Radio buttons + text areas

3. Implement Yes/No options:
   - Patient Request Repatriation
   - Requires Repatriation/Medical Evacuation
   - Can be transported
   - Fit to Fly
   - Wheelchair needed

**Deliverables:**
- Recommendation form complete
- Radio button logic working
- Conditional text areas

---

### Phase 9: Treating Doctor & Comments (Day 23-24)

**Tasks:**
1. Create API endpoints
   - POST `/api/patients/:id/treating-doctors`
   - GET `/api/patients/:id/treating-doctors`
   - DELETE `/api/patients/:id/treating-doctors/:doctorId`
   - POST `/api/patients/:id/comments`
   - GET `/api/patients/:id/comments`

2. Create UI components
   - `TreatingDoctorSelector.vue` - Doctor lookup (up to 4)
   - `CommentBox.vue` - Text area with spell check

3. Implement doctor selection with search

**Deliverables:**
- Treating doctor assignment
- Comment system
- Spell check integration

---

### Phase 10: Toolbar & Common Features (Day 25-26)

**Tasks:**
1. Create global toolbar component
   - Save button
   - New/Add button
   - Edit button
   - Delete button
   - Print button
   - Search button
   - Phone call button
   - Calculator button
   - Close/Cancel button

2. Implement keyboard shortcuts

3. Add print functionality (PDF generation)

4. Implement search across modules

**Deliverables:**
- Functional toolbar
- Keyboard shortcuts
- Print feature

---

### Phase 11: Testing & Refinement (Day 27-28)

**Tasks:**
1. End-to-end testing all modules
2. Fix bugs and edge cases
3. Optimize database queries
4. Add loading states
5. Improve error messages
6. Test Docker deployment

**Deliverables:**
- Stable application
- Docker deployment ready
- All features tested

---

### Phase 12: Documentation & Deployment (Day 29-30)

**Tasks:**
1. Write API documentation
2. Create user manual
3. Document deployment process
4. Create backup/restore procedures
5. Final Docker image optimization
6. Production deployment checklist

**Deliverables:**
- Complete documentation
- Production-ready Docker setup
- Deployment guide

---

## Docker Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: his_db
      POSTGRES_USER: his_user
      POSTGRES_PASSWORD: his_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-EXEC", "pg_isready -U his_user -d his_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://his_user:his_password@postgres:5432/his_db
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Run migrations
RUN pnpm drizzle-kit push:pg

# Build application
RUN pnpm build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

---

## Key Features Summary

### Technical Features
- ✅ Type-safe database queries (Drizzle)
- ✅ Server-side rendering (Nuxt 4)
- ✅ Modern UI components (Naive UI)
- ✅ Real-time validation (Zod)
- ✅ Dockerized deployment
- ✅ PostgreSQL with migrations
- ✅ Composable architecture
- ✅ TypeScript throughout

### Functional Features
- ✅ Doctor management (CRUD)
- ✅ Patient registration
- ✅ Medical history tracking
- ✅ Vital signs recording
- ✅ Examination & diagnosis
- ✅ Doctor recommendations
- ✅ Multi-doctor assignment
- ✅ Comment system
- ✅ Search & filter
- ✅ Print functionality
- ✅ Spell checking

---

## Estimated Timeline

**Total Duration: 30 days**

- Setup & Infrastructure: 4 days
- Doctor Module: 3 days
- Patient Module: 5 days
- Medical Records: 3 days
- Vital Signs: 2 days
- Examination: 3 days
- Recommendations: 2 days
- Treating Doctors & Comments: 2 days
- Toolbar & Features: 2 days
- Testing: 2 days
- Documentation & Deployment: 2 days

---

## Next Steps

1. **Initialize project**: Run setup commands
2. **Setup environment**: Configure `.env` file
3. **Start Docker**: `docker-compose up -d`
4. **Run migrations**: `pnpm drizzle-kit push:pg`
5. **Start development**: `pnpm dev`
6. **Begin with Phase 1**: Follow implementation plan sequentially

---

## Notes

- Use **pnpm** for package management (faster, efficient)
- Follow **component-driven development** approach
- Implement **proper error handling** at each layer
- Use **TypeScript strictly** - no `any` types
- Write **reusable composables** for business logic
- Keep **API routes thin** - logic in services
- Use **Zod schemas** for validation everywhere
- Test with **real data** early and often
- **Docker** should be used from day 1
- **Git commits** should be frequent and descriptive