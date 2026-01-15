/**
 * Standard Success Response Helper
 * 
 * Usage: return successResponse(data, 'Saved successfully');
 */
export function successResponse(data: any, message = 'Success', code = 200) {
    return {
        success: true,
        statusCode: code,
        message,
        data
    };
}
