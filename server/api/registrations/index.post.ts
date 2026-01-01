import { db } from '../../db';
import { registrations, patients } from '../../db/schema';
import { z } from 'zod';
import dayjs from 'dayjs';

const createRegistrationSchema = z.object({
    // Patient data (for new patient)
    patientId: z.string().uuid().optional(),
    patient: z.object({
        fullName: z.string().min(1),
        mrNumber: z.string().optional(),
        phone: z.string().optional(),
        age: z.number().optional(),
        ageUnit: z.enum(['years', 'months', 'days']).optional(),
        nationality: z.string().optional(),
        sex: z.enum(['male', 'female']).optional(),
        currentAddress: z.string().optional(),
    }).optional(),
    // Registration data
    ward: z.string().optional(),
    admissionDate: z.string().optional(),
});

function generateRegNumber() {
    const date = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REG-${date}-${random}`;
}

export default defineEventHandler(async (event) => {
    try {
        // Get the user session and organization
        const session = await requireUserSession(event);
        const organizationId = session.user.currentOrganizationId;

        if (!organizationId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No organization selected',
            });
        }

        const body = await readBody(event);
        const data = createRegistrationSchema.parse(body);

        let patientId = data.patientId;

        // Create new patient if not provided
        if (!patientId && data.patient) {
            const [newPatient] = await db
                .insert(patients)
                .values({
                    organizationId,
                    fullName: data.patient.fullName,
                    mrNumber: data.patient.mrNumber || null,
                    phone: data.patient.phone || null,
                    age: data.patient.age || null,
                    ageUnit: data.patient.ageUnit || 'years',
                    nationality: data.patient.nationality || null,
                    sex: data.patient.sex || null,
                    currentAddress: data.patient.currentAddress || null,
                })
                .returning();
            patientId = newPatient.id;
        }

        if (!patientId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Patient ID or patient data is required',
            });
        }

        // Create registration
        const [registration] = await db
            .insert(registrations)
            .values({
                organizationId,
                patientId,
                registrationNumber: generateRegNumber(),
                ward: data.ward || null,
                admissionDate: data.admissionDate || null,
            })
            .returning();

        return {
            success: true,
            data: registration,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation failed',
            });
        }
        if ((error as any).statusCode) throw error;
        console.error('Registration creation error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create registration',
        });
    }
});
