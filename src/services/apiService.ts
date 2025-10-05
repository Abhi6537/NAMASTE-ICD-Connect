import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'https://namaste-icd-api.vercel.app';

export interface SearchParams {
  q: string;
  source?: 'namaste' | 'icd11' | 'both';
  ayush_system?: 'ayurveda' | 'yoga' | 'unani' | 'siddha' | 'homeopathy';
}

export interface SearchResult {
  id?: string;
  term: string;
  term_hindi?: string;
  confidence?: number;
  description?: string;
  synonyms?: string[];
  source: string;
  namaste_id?: string;
  icd11_code?: string;
  category?: string;
  subcategory?: string;
  ayush_system?: string;
  code?: string;
  system?: string;
  system_name?: string;
  uri?: string;
  icd11_foundation_uri?: string;
}

interface SearchApiResponse {
  query: string;
  source: string;
  namaste_results?: SearchResult[];
  icd11_results?: SearchResult[];
}

export interface ApiStats {
  total_requests: number;
  average_response_time: number;
  min_response_time: number;
  max_response_time: number;
  success_rate: number;
  uptime_seconds: number;
  recent_response_times: number[];
  endpoint_counts: Record<string, number>;
  status_code_distribution: Record<string, number>;
  timestamp: string;
}

export interface MapParams {
  namaste_id: string;
  include_fhir?: boolean;
}

export interface MappingResult {
  namaste_term: string;
  icd11_code: string;
  icd11_title: string;
  confidence: number;
  fhir_condition?: any;
}

export interface BulkMapRequest {
  terms: Array<{
    namaste_id: string;
    patient_id?: string;
  }>;
}

export interface FHIRConditionParams {
  namaste_id: string;
  patient_id: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  version?: string;
  services?: {
    icd11?: string;
    namaste?: string;
    fhir?: string;
  };
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private requestCount: number = 0;
  private responseTimes: number[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: new Date().getTime() };
        this.requestCount++;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        const endTime = new Date().getTime();
        const startTime = response.config.metadata?.startTime || endTime;
        const duration = endTime - startTime;
        this.responseTimes.push(duration);
        if (this.responseTimes.length > 100) {
          this.responseTimes.shift();
        }
        return response;
      },
      (error) => {
        if (error.config?.metadata?.startTime) {
          const endTime = new Date().getTime();
          const duration = endTime - error.config.metadata.startTime;
          this.responseTimes.push(duration);
        }
        return Promise.reject(error);
      }
    );
  }

  async getStats(): Promise<ApiStats> {
    try {
      const response = await this.axiosInstance.get<ApiStats>('/api/v1/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await this.axiosInstance.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      const response = await this.axiosInstance.get<SearchApiResponse>('/api/v1/search', {
        params: {
          q: params.q,
          source: params.source || 'both',
          ayush_system: params.ayush_system,
        },
      });

      const results: SearchResult[] = [];
      
      if (response.data.namaste_results && Array.isArray(response.data.namaste_results)) {
        response.data.namaste_results.forEach(result => {
          results.push({
            ...result,
            source: 'NAMASTE',
            namaste_id: result.id || result.namaste_id,
          });
        });
      }

      if (response.data.icd11_results && Array.isArray(response.data.icd11_results)) {
        response.data.icd11_results.forEach(result => {
          results.push({
            ...result,
            source: 'ICD-11',
            icd11_code: result.id || result.icd11_code,
          });
        });
      }

      return results;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchRaw(params: SearchParams): Promise<SearchApiResponse> {
    try {
      const response = await this.axiosInstance.get<SearchApiResponse>('/api/v1/search', {
        params: {
          q: params.q,
          source: params.source || 'both',
          ayush_system: params.ayush_system,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async mapTerminology(params: MapParams): Promise<MappingResult> {
    try {
      const response = await this.axiosInstance.post<MappingResult>(
        '/api/v1/map',
        null,
        {
          params: {
            namaste_id: params.namaste_id,
            include_fhir: params.include_fhir || false,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkMap(request: BulkMapRequest): Promise<MappingResult[]> {
    try {
      const response = await this.axiosInstance.post<MappingResult[]>(
        '/api/v1/bulk-map',
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFHIRCondition(params: FHIRConditionParams): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/v1/fhir/condition', {
        params: {
          namaste_id: params.namaste_id,
          patient_id: params.patient_id,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.responseTimes.length);
  }

  getResponseTimes(): number[] {
    return [...this.responseTimes];
  }

  resetStats(): void {
    this.requestCount = 0;
    this.responseTimes = [];
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return new Error(
          `API Error: ${axiosError.response.status} - ${
            JSON.stringify(axiosError.response.data) || axiosError.message
          }`
        );
      } else if (axiosError.request) {
        return new Error('Network Error: No response received from server');
      }
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export const apiService = new ApiService();

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}