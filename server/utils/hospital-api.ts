/**
 * Hospital API Client
 * 
 * Utility for communicating with external hospital APIs (RSIA, BROS)
 * using Basic Auth authentication.
 */

// Types for Hospital API responses

export interface ParamedicItem {
    ParamedicID: number;
    ParamedicCode: string;
    Name: string;
    LicenseNo: string;
}

export interface PatientRegistrationItem {
    RegistrationNo: string;
    RegistrationDate: string;
    ServiceUnitCode: string;
    ServiceUnitName: string;
    BusinessPartnerCode: string;
    BusinessPartnerName: string;
    MedicalNo: string;
    PatientName: string;
    PatientAddress: string;
    NoTelp: string;
    ParamedicCode: string;
    ParamedicName: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface HospitalApiConfig {
    baseUrl: string;
    username: string;
    password: string;
}

/**
 * Hospital API Client class
 * Handles all communication with external hospital APIs
 */

// Global token cache: baseUrl -> { token, expiresAt }
// Assuming tokens last 24 hours, but we'll refresh if we get 401
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export class HospitalApiClient {
    constructor(private config: HospitalApiConfig) { }

    /**
     * Authenticate and get Bearer Token
     */
    private async getToken(): Promise<string> {
        const cached = tokenCache.get(this.config.baseUrl);
        const now = Date.now();

        // Used cached token if valid (buffer of 5 minutes)
        if (cached && cached.expiresAt > now + 300000) {
            return cached.token;
        }

        console.log(`Authenticating with Hospital API: ${this.config.baseUrl}`);

        try {
            const response = await fetch(`${this.config.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.config.username,
                    password: this.config.password
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Authentication failed (${response.status}): ${text}`);
            }

            const data = await response.json();
            const token = data.token || data.accessToken || data.data?.token;

            if (!token) {
                throw new Error('Authentication successful but no token received');
            }

            // Cache token (default 12 hours if can't detect)
            // JWT expiry could be parsed, but let's assume validity for now
            tokenCache.set(this.config.baseUrl, {
                token,
                expiresAt: now + (12 * 60 * 60 * 1000)
            });

            return token;
        } catch (error: any) {
            console.error('Hospital API Login Error:', error.message);
            throw error;
        }
    }

    /**
     * Generic fetch wrapper with auto-auth
     */
    private async fetchWithAuth(endpoint: string): Promise<any> {
        let token = await this.getToken();

        const makeRequest = async (authToken: string) => {
            const url = `${this.config.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response;
        };

        let response = await makeRequest(token);

        // If 401, try to refresh token once
        if (response.status === 401) {
            console.warn('Token expired or invalid, refreshing...');
            tokenCache.delete(this.config.baseUrl); // Clear cache
            token = await this.getToken(); // Re-login
            response = await makeRequest(token); // Retry
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No response body');
            throw new Error(`Hospital API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
        }

        return response.json();
    }

    /**
     * Get list of paramedics/doctors from hospital
     */
    async getParamedicList(page = 1, limit = 10, search = ''): Promise<PaginatedResponse<ParamedicItem>> {
        const query = `page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
        return this.fetchWithAuth(`/paramedic/list?${query}`);
    }

    /**
     * Search patients/registrations from hospital
     */
    async searchPatients(search: string, page = 1, limit = 10): Promise<PaginatedResponse<PatientRegistrationItem>> {
        return this.fetchWithAuth(`/registration/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    }

    /**
     * Get registrations for a specific patient by MR number
     */
    async getPatientRegistrations(mrNumber: string, page = 1, limit = 10): Promise<PaginatedResponse<PatientRegistrationItem>> {
        // Search by MR number to get all registrations for this patient
        return this.searchPatients(mrNumber, page, limit);
    }
}

/**
 * Create Hospital API client from organization settings
 * Returns null if hospital API is not configured for the organization
 */
export function createHospitalClient(baseUrl: string): HospitalApiClient | null {
    const config = useRuntimeConfig();

    if (!baseUrl) {
        return null;
    }

    if (!config.hospitalApi?.username || !config.hospitalApi?.password) {
        console.warn('Hospital API credentials not configured in environment');
        return null;
    }

    return new HospitalApiClient({
        baseUrl,
        username: config.hospitalApi.username,
        password: config.hospitalApi.password,
    });
}

/**
 * Helper to get hospital client from organization settings
 */
export function getHospitalClientFromOrgSettings(settings: {
    hospitalApi?: {
        enabled: boolean;
        baseUrl: string;
    };
}): HospitalApiClient | null {
    if (!settings.hospitalApi?.enabled || !settings.hospitalApi?.baseUrl) {
        return null;
    }

    return createHospitalClient(settings.hospitalApi.baseUrl);
}
