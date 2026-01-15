import { db } from '../../../db';
import { patients, doctors, organizations } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Import patient from hospital API to RIPAC database
 * 
 * POST /api/external/patients/import
 * 
 * Body: {
 *   medicalNo: string,
 *   patientName: string,
 *   patientAddress?: string,
 *   phone?: string,
 *   registrationNo: string,    // Saved as reference
 *   paramedicCode?: string,
 *   paramedicName?: string
 * }
 * 
 * Action:
 * 1. Upsert patient by mrNumber (update if exists, create if not)
 * 2. Save registrationNo as externalRegistrationNo
 * 3. Upsert doctor by doctorId (paramedicCode) if provided
 */
export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    const orgId = session.user.currentOrganizationId;

    if (!orgId) {
        throw createError({
            statusCode: 400,
            message: 'No organization selected',
        });
    }

    // Parse request body
    const body = await readBody(event);

    const {
        medicalNo,
        patientName,
        patientAddress,
        phone,
        registrationNo,
        paramedicCode,
        paramedicName,
    } = body;

    // Validate required fields
    if (!medicalNo || !patientName) {
        throw createError({
            statusCode: 400,
            message: 'medicalNo and patientName are required',
        });
    }

    // Start transaction-like operations
    let importedPatient;
    let importedDoctor = null;

    // 1. Check if patient already exists by mrNumber
    const existingPatient = await db.query.patients.findFirst({
        where: and(
            eq(patients.organizationId, orgId),
            eq(patients.mrNumber, medicalNo)
        ),
    });

    if (existingPatient) {
        // Update existing patient
        const [updated] = await db
            .update(patients)
            .set({
                fullName: patientName,
                currentAddress: patientAddress || existingPatient.currentAddress,
                phone: phone || existingPatient.phone,
                externalRegistrationNo: registrationNo || existingPatient.externalRegistrationNo,
                updatedAt: new Date(),
            })
            .where(eq(patients.id, existingPatient.id))
            .returning();

        importedPatient = updated;
    } else {
        // Create new patient
        const [created] = await db
            .insert(patients)
            .values({
                organizationId: orgId,
                mrNumber: medicalNo,
                fullName: patientName,
                currentAddress: patientAddress,
                phone: phone,
                externalRegistrationNo: registrationNo,
            })
            .returning();

        importedPatient = created;
    }

    // 2. Handle doctor/paramedic if provided
    if (paramedicCode && paramedicName) {
        const existingDoctor = await db.query.doctors.findFirst({
            where: and(
                eq(doctors.organizationId, orgId),
                eq(doctors.doctorId, paramedicCode)
            ),
        });

        if (existingDoctor) {
            // Update existing doctor
            const [updated] = await db
                .update(doctors)
                .set({
                    fullName: paramedicName,
                    updatedAt: new Date(),
                })
                .where(eq(doctors.id, existingDoctor.id))
                .returning();

            importedDoctor = updated;
        } else {
            // Create new doctor
            const [created] = await db
                .insert(doctors)
                .values({
                    organizationId: orgId,
                    doctorId: paramedicCode,
                    fullName: paramedicName,
                })
                .returning();

            importedDoctor = created;
        }
    }

    return {
        success: true,
        message: existingPatient ? 'Patient updated' : 'Patient imported',
        patient: importedPatient,
        doctor: importedDoctor,
    };
});
