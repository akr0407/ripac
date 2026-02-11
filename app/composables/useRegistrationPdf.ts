import dayjs from 'dayjs';

export const useRegistrationPdf = () => {
    const isGeneratingPdf = ref(false);
    const pdfPreviewUrl = ref<string | null>(null);

    const helper = {
        val: (v: any) => v || '-',
        bool: (v: any) => v ? 'Yes' : 'No',
        formatDate: (date: string) => date ? dayjs(date).format('DD MMM YYYY HH:mm') : '-',
        formatDateOnly: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    };

    /**
     * Fetches all registration data if not provided, then generates PDF
     */
    async function generatePdf(registrationId: string, preview = false) {
        if (!registrationId) return;

        isGeneratingPdf.value = true;

        try {
            // dynamic import jspdf
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            // 1. Fetch Data
            // We need to fetch all data points to generate the full report
            // Run in parallel
            const [
                { data: registration },
                { data: history },
                { data: vitalsRaw },
                { data: exams },
                { data: recommendations },
                { data: treatingDocsRaw },
                { data: commentsRaw }
            ] = await Promise.all([
                $fetch<any>(`/api/registrations/${registrationId}`),
                $fetch<any>(`/api/registrations/${registrationId}/history`).catch(() => ({ data: {} })),
                $fetch<any>(`/api/registrations/${registrationId}/vitals`).catch(() => ({ data: [] })),
                $fetch<any>(`/api/registrations/${registrationId}/examinations`).catch(() => ({ data: {} })),
                $fetch<any>(`/api/registrations/${registrationId}/recommendations`).catch(() => ({ data: {} })),
                $fetch<any>(`/api/registrations/${registrationId}/treating-doctors`).catch(() => ({ data: [] })),
                $fetch<any>(`/api/registrations/${registrationId}/comments`).catch(() => ({ data: [] }))
            ]);

            // Process fetched data
            const medicalHistory = history || {};
            const vitalSigns = vitalsRaw?.[0] || {};
            const examination = exams || {};
            const recommendation = recommendations || {};
            const comments = commentsRaw || [];

            // For treating doctors, we need names. The API result for treating-doctors usually has IDs.
            // But depending on the API, it might include joins. 
            // Looking at the codebase, treating-doctors schema joins with doctors table, but the return type might not have name if using simple select.
            // Let's assume we might need to fetch doctors list OR check if the API returns joined data.
            // The previous code in [id].vue fetched ALL doctors to map names. That's expensive but robust.
            // Let's try to fetch all doctors for now to be safe and consistent with previous logic.
            const { data: allDoctors } = await $fetch<any>('/api/doctors?limit=1000').catch(() => ({ data: [] }));

            const treatingDoctors = (treatingDocsRaw || [])
                .map((d: any) => {
                    // Try to get name from joined data first, then fallback to lookup
                    const name = d.doctorName || allDoctors.find((ad: any) => ad.id === d.doctorId)?.fullName;
                    return {
                        name,
                        isMain: d.isMain
                    };
                })
                .filter((d: any) => d.name);


            // 2. Generate PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let y = 15;
            const org = registration.organization;

            // --- HEADER ---
            if (org?.logo) {
                try {
                    // Try adding logo
                    doc.addImage(org.logo, 'PNG', (pageWidth / 2) - 15, y, 30, 20, undefined, 'FAST');
                    y += 25;
                } catch (e) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    doc.text(org?.name || "RIPAC HOSPITAL", pageWidth / 2, y + 10, { align: "center" });
                    y += 15;
                }
            } else {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(18);
                doc.text(org?.name || "RIPAC HOSPITAL", pageWidth / 2, y + 5, { align: "center" });
                y += 12;
            }

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const address = org?.address || "123 Healthcare Avenue, Medical District";
            const splitAddr = doc.splitTextToSize(address, pageWidth - (margin * 2));
            doc.text(splitAddr, pageWidth / 2, y, { align: "center" });
            y += (splitAddr.length * 5);

            doc.text(`Phone: ${helper.val(org?.phone)} | Email: ${helper.val(org?.email)} | Fax: ${helper.val(org?.fax)}`, pageWidth / 2, y, { align: "center" });

            y += 8;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("MEDICAL RESUME", pageWidth / 2, y, { align: "center" });
            doc.line(margin, y + 2, pageWidth - margin, y + 2);

            y += 10;

            // --- PATIENT INFO ---
            // @ts-ignore
            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
                bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
                styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak', font: 'helvetica' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 35 },
                    1: { cellWidth: 55 },
                    2: { fontStyle: 'bold', cellWidth: 35 },
                    3: { cellWidth: 55 }
                },
                body: [
                    ['Patient Name', helper.val(registration.patient?.fullName), 'MR Number', helper.val(registration.patient?.mrNumber)],
                    [
                        'Age / Sex',
                        `${helper.val(registration.patient?.age)} ${helper.val(registration.patient?.ageUnit)} / ${registration.patient?.sex ? registration.patient.sex.toUpperCase() : '-'}`,
                        'Registration No',
                        helper.val(registration.registrationNumber)
                    ],
                    ['Nationality', helper.val(registration.patient?.nationality), 'Admission Date', helper.formatDateOnly(registration.admissionDate)],
                    ['Address', { content: helper.val(registration.patient?.currentAddress), colSpan: 3 }],
                    ['Ward', helper.val(registration.ward), 'Discharge Date', helper.formatDateOnly(registration.dischargeDate)]
                ]
            });

            // @ts-ignore
            y = doc.lastAutoTable.finalY + 10;

            // --- DIAGNOSIS ---
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("DIAGNOSIS", margin, y);
            doc.line(margin, y + 1, pageWidth - margin, y + 1);
            y += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const diagnosisText = doc.splitTextToSize(helper.val(examination.diagnosis), pageWidth - (margin * 2));
            doc.text(diagnosisText, margin, y);
            y += (diagnosisText.length * 5) + 5;

            if (examination.differentialDiagnosis) {
                doc.setFont("helvetica", "bold");
                doc.text("Diff. Diagnosis:", margin, y);
                doc.setFont("helvetica", "normal");
                const diffText = doc.splitTextToSize(helper.val(examination.differentialDiagnosis), pageWidth - (margin * 2) - 30);
                doc.text(diffText, margin + 30, y);
                y += (diffText.length * 5) + 5;
            }

            // --- HISTORY ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("MEDICAL HISTORY", margin, y);
            doc.line(margin, y + 1, pageWidth - margin, y + 1);
            y += 5;

            // @ts-ignore
            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 1, overflow: 'linebreak' },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 'auto' } },
                body: [
                    ['Present Complaint:', helper.val(medicalHistory.presentComplaint)],
                    ['Past History:', helper.val(medicalHistory.pastMedicalHistory)],
                    ['Allergies:', helper.val(medicalHistory.allergicHistory)],
                    ['Current Medication:', helper.val(medicalHistory.currentMedication)]
                ]
            });
            // @ts-ignore
            y = doc.lastAutoTable.finalY + 10;
            if (y > 250) { doc.addPage(); y = 20; }

            // --- VITALS ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("VITAL SIGNS", margin, y);
            doc.line(margin, y + 1, pageWidth - margin, y + 1);
            y += 5;

            // @ts-ignore
            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
                bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], halign: 'center' },
                head: [['Pulse', 'BP', 'RR', 'Temp', 'SpO2', 'GCS']],
                body: [[
                    helper.val(vitalSigns.pulseRate),
                    helper.val(vitalSigns.bloodPressure),
                    helper.val(vitalSigns.respiratoryRate),
                    helper.val(vitalSigns.temperature),
                    helper.val(vitalSigns.spo2),
                    helper.val(vitalSigns.gcs)
                ]]
            });
            // @ts-ignore
            y = doc.lastAutoTable.finalY + 10;

            // --- EXAM & TREATMENT ---
            if (y > 240) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("EXAMINATION & TREATMENT", margin, y);
            doc.line(margin, y + 1, pageWidth - margin, y + 1);
            y += 5;

            // @ts-ignore
            autoTable(doc, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
                body: [
                    ['Physical Exam:', helper.val(examination.physicalExamination)],
                    ['Treatment:', helper.val(examination.treatment)]
                ]
            });
            // @ts-ignore
            y = doc.lastAutoTable.finalY + 10;

            // --- RECOMMENDATIONS ---
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("RECOMMENDATIONS", margin, y);
            doc.line(margin, y + 1, pageWidth - margin, y + 1);
            y += 5;

            const recs = [
                `Request Repatriation: ${helper.bool(recommendation.requestRepatriation)}`,
                `Fit to Fly: ${helper.bool(recommendation.fitToFly)}${recommendation.fitToFly && recommendation.fitToFlyNote ? ` (${recommendation.fitToFlyNote})` : ''}`,
                `Requires Evacuation: ${helper.bool(recommendation.requiresEvacuation)}`,
                `Can be Transported: ${helper.bool(recommendation.canBeTransported)}${recommendation.canBeTransported && recommendation.canBeTransportedNote ? ` (${recommendation.canBeTransportedNote})` : ''}`,
                `Needs Wheelchair: ${helper.bool(recommendation.needsWheelchair)}${recommendation.needsWheelchair && recommendation.needsWheelchairNote ? ` (${recommendation.needsWheelchairNote})` : ''}`
            ];

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const recText = doc.splitTextToSize(recs.join(" | "), pageWidth - (margin * 2));
            doc.text(recText, margin, y + 4);
            y += (recText.length * 5) + 5;

            const notes = doc.splitTextToSize(`Notes: ${helper.val(recommendation.notes)}`, pageWidth - (margin * 2));
            doc.text(notes, margin, y);
            y += (notes.length * 5) + 10;

            // --- TREATING DOCTORS ---
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.text("TREATING DOCTORS", margin, y);
            y += 6;
            doc.setFont("helvetica", "normal");

            if (treatingDoctors.length) {
                doc.setFont("helvetica", "bold");
                treatingDoctors.forEach((d: any) => {
                    const suffix = d.isMain ? ' (Main Treating Doctor)' : '';
                    doc.text(`• ${d.name}${suffix}`, margin + 5, y);
                    y += 5;
                });
            } else {
                doc.text("No doctors recorded.", margin + 5, y);
                y += 5;
            }

            // --- COMMENTS ---
            if (comments.length > 0) {
                if (y > 230) { doc.addPage(); y = 20; }
                y += 5;
                doc.setFont("helvetica", "bold");
                doc.text("COMMENTS", margin, y);
                y += 6;
                doc.setFont("helvetica", "normal");

                comments.forEach((comment: any) => {
                    const dateStr = helper.formatDate(comment.createdAt);
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(dateStr, margin, y);
                    y += 4;

                    doc.setFontSize(10);
                    doc.setTextColor(0);
                    const commentLines = doc.splitTextToSize(comment.commentText, pageWidth - (margin * 2));
                    doc.text(commentLines, margin, y);
                    y += (commentLines.length * 5) + 5;

                    if (y > 270) { doc.addPage(); y = 20; }
                });
            }

            // --- FOOTER ---
            if (y + 60 > 280) {
                doc.addPage();
                y = 30;
            } else {
                y += 20;
            }

            const sigY = y;
            doc.setLineWidth(0.5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            const managerName = registration.managerOnDuty ?
                (registration.managerOnDuty.fullName || registration.managerOnDuty.nickName || 'Unknown') :
                '______________________';

            doc.setFont("helvetica", "bold");
            doc.text("ON BEHALF of TREATING DOCTOR", pageWidth - margin - 10, sigY, { align: 'right' });

            doc.line(pageWidth - margin - 70, sigY + 20, pageWidth - margin - 10, sigY + 20);

            doc.setFont("helvetica", "normal");
            doc.text(managerName, pageWidth - margin - 10, sigY + 25, { align: 'right' });

            doc.setFont("helvetica", "bold");
            doc.text("(Manager on Duty)", pageWidth - margin - 10, sigY + 30, { align: 'right' });

            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(
                    `Printed on ${dayjs().format('DD MMM YYYY HH:mm')} | ${helper.val(org?.name) || 'RIPAC HIS'} | Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            if (preview) {
                if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value);
                pdfPreviewUrl.value = URL.createObjectURL(doc.output('blob'));

                // Trigger modal opening logic here or let caller handle it?
                // The caller needs to know it's ready.
                // We just set the URL.
            } else {
                doc.save(`Medical_Resume_${registration.registrationNumber || 'Doc'}.pdf`);
            }

        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF');
        } finally {
            isGeneratingPdf.value = false;
        }
    }

    const closePreview = () => {
        if (pdfPreviewUrl.value) {
            URL.revokeObjectURL(pdfPreviewUrl.value);
            pdfPreviewUrl.value = null;
        }
    };

    return {
        isGeneratingPdf,
        pdfPreviewUrl,
        generatePdf,
        closePreview
    };
};
