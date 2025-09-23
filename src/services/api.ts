import axios from 'axios';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MemberDetails,
  MemberDetailsForm,
  ArtistWork,
  MusicUploadForm,
  DocumentUploadForm,
  Company,
  Admin,
  LogSheet,
  Invoice,
  ArtistInvoiceReports,
  LegalEntity,
  NaturalPersonEntity,
  Title,
  MusicUsageTypes,
  SourceOfMusic,
  ArtistUploadType,
  ArtistWorkType,
  Status,
  PassportPhoto,
  DashboardStats,
  ArtistStats,
  CompanyStats,
  LicenseApplicationForm,
} from '../types';

// Determine API base URL
// Priority: Vite env -> window injected var -> production default.
// We intentionally do NOT default to the frontend dev server (localhost:8080),
// because that is the Vite server, not the backend.
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL)
  || (typeof window !== 'undefined' && (window as any)?.VITE_API_BASE_URL)
  || 'https://api.owellgraphics.com';

// Warn if base URL looks like the current origin (likely misconfigured in dev)
if (typeof window !== 'undefined') {
  const currentOrigin = window.location.origin;
  try {
    const apiOrigin = new URL(API_BASE_URL, currentOrigin).origin;
    if (apiOrigin === currentOrigin && !/owellgraphics\.com$/.test(apiOrigin)) {
      // eslint-disable-next-line no-console
      console.warn('[API] Base URL appears to point to the frontend origin. Check VITE_API_BASE_URL.');
    }
  } catch {}
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Do not attach auth header for public auth endpoints
  const url = `${config.baseURL || ''}${config.url || ''}`;
  const isAuthEndpoint = /\/api\/auth\//.test(url);
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API - Updated to match ApiGuide.md exactly
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const sanitized = {
      email: (data.email || '').trim().toLowerCase(),
      password: (data.password || '').trim(),
    };
    const response = await api.post('/api/auth/login', sanitized);
    return response.data;
  },

  registerArtist: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/api/auth/register/artist', data);
    return response.data;
  },

  registerCompany: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/api/auth/register/company', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/api/auth/verify?token=${token}`);
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

// Artist API - Updated to match ApiGuide.md exactly
export const artistAPI = {
  // Create Profile - full model support
  createProfile: async (data: MemberDetailsForm): Promise<MemberDetails> => {
    const response = await api.post('/api/artist/profile', data);
    return response.data;
  },

  // Upload Passport Photo - matches ApiGuide.md exactly
  uploadPassportPhoto: async (file: File, imageTitle: string): Promise<PassportPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageTitle', imageTitle);
    const response = await api.post('/api/artist/passport-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Proof of Payment - matches ApiGuide.md exactly
  uploadProofOfPayment: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/proof-of-payment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Bank Confirmation Letter - matches ApiGuide.md exactly
  uploadBankConfirmationLetter: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/bank-confirmation-letter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload ID Document - matches ApiGuide.md exactly
  uploadIdDocument: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/id-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Music - full model support
  uploadMusic: async (musicData: MusicUploadForm): Promise<ArtistWork> => {
    const formData = new FormData();
    formData.append('file', musicData.file);
    formData.append('title', musicData.title);
    
    // Append all other fields if they exist
    if (musicData.albumName) formData.append('albumName', musicData.albumName);
    if (musicData.artist) formData.append('artist', musicData.artist);
    if (musicData.groupOrBandOrStageName) formData.append('groupOrBandOrStageName', musicData.groupOrBandOrStageName);
    if (musicData.featuredArtist) formData.append('featuredArtist', musicData.featuredArtist);
    if (musicData.producer) formData.append('producer', musicData.producer);
    if (musicData.duration) formData.append('duration', musicData.duration);
    if (musicData.country) formData.append('country', musicData.country);
    if (musicData.artistUploadTypeId) formData.append('artistUploadTypeId', musicData.artistUploadTypeId.toString());
    if (musicData.artistWorkTypeId) formData.append('artistWorkTypeId', musicData.artistWorkTypeId.toString());
    if (musicData.composer) formData.append('composer', musicData.composer);
    if (musicData.author) formData.append('author', musicData.author);
    if (musicData.arranger) formData.append('arranger', musicData.arranger);
    if (musicData.publisher) formData.append('publisher', musicData.publisher);
    if (musicData.publishersName) formData.append('publishersName', musicData.publishersName);
    if (musicData.publisherAddress) formData.append('publisherAddress', musicData.publisherAddress);
    if (musicData.publisherTelephone) formData.append('publisherTelephone', musicData.publisherTelephone);
    if (musicData.recordedBy) formData.append('recordedBy', musicData.recordedBy);
    if (musicData.addressOfRecordingCompany) formData.append('addressOfRecordingCompany', musicData.addressOfRecordingCompany);
    if (musicData.recordingCompanyTelephone) formData.append('recordingCompanyTelephone', musicData.recordingCompanyTelephone);
    if (musicData.labelName) formData.append('labelName', musicData.labelName);
    if (musicData.dateRecorded) formData.append('dateRecorded', musicData.dateRecorded);
    if (musicData.notes) formData.append('notes', musicData.notes);
    
    const response = await api.post('/api/artist/music/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get My Music - matches ApiGuide.md exactly
  getMyMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/artist/music');
    return response.data;
  },

  // Get My Documents - matches ApiGuide.md exactly
  getDocuments: async (): Promise<{
    passportPhoto?: PassportPhoto;
    idDocument?: any;
    bankConfirmationLetter?: any;
    proofOfPayment?: any;
  }> => {
    const response = await api.get('/api/artist/documents');
    return response.data;
  },

  // Additional methods for profile management
  getProfile: async (): Promise<MemberDetails> => {
    const response = await api.get('/api/artist/profile');
    return response.data;
  },

  updateProfile: async (data: MemberDetailsForm): Promise<MemberDetails> => {
    const response = await api.put('/api/artist/profile', data);
    return response.data;
  },

  updateMusic: async (id: number, data: Partial<ArtistWork>): Promise<ArtistWork> => {
    const response = await api.put(`/api/artist/music/${id}`, data);
    return response.data;
  },

  deleteMusic: async (id: number): Promise<void> => {
    await api.delete(`/api/artist/music/${id}`);
  },

  getStats: async (): Promise<ArtistStats> => {
    const response = await api.get('/api/artist/stats');
    return response.data;
  },
};

// Company API - Updated to match ApiGuide.md exactly
export const companyAPI = {
  // Get Company Profile - matches ApiGuide.md exactly
  getProfile: async (): Promise<Company> => {
    const response = await api.get('/api/company/profile');
    return response.data;
  },

  // Get Approved Music - matches ApiGuide.md exactly
  getApprovedMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/company/approved-music');
    return response.data;
  },

  // Create LogSheet - matches ApiGuide.md exactly
  createLogSheet: async (title: string, musicIds: number[]): Promise<LogSheet> => {
    const response = await api.post('/api/company/logsheet', { title, musicIds });
    return response.data;
  },

  // Get LogSheets - matches ApiGuide.md exactly
  getLogSheets: async (): Promise<LogSheet[]> => {
    const response = await api.get('/api/company/logsheets');
    return response.data;
  },

  // Additional methods for profile management
  updateProfile: async (data: Partial<Company>): Promise<Company> => {
    const response = await api.put('/api/company/profile', data);
    return response.data;
  },

  getLogSheetById: async (id: number): Promise<LogSheet> => {
    const response = await api.get(`/api/company/logsheet/${id}`);
    return response.data;
  },

  getStats: async (): Promise<CompanyStats> => {
    const response = await api.get('/api/company/stats');
    return response.data;
  },
};

// Admin API - Updated to match ApiGuide.md exactly
export const adminAPI = {
  // Get Pending Profiles - matches ApiGuide.md exactly
  getPendingProfiles: async (): Promise<MemberDetails[]> => {
    const response = await api.get('/api/admin/pending-profiles');
    return response.data;
  },

  // Approve Profile - matches ApiGuide.md exactly
  approveProfile: async (memberId: number, ipiNumber: string): Promise<MemberDetails> => {
    const response = await api.post(`/api/admin/profile/approve/${memberId}`, { ipiNumber });
    return response.data;
  },

  // Reject Profile - matches ApiGuide.md exactly
  rejectProfile: async (memberId: number, notes: string): Promise<MemberDetails> => {
    const response = await api.post(`/api/admin/profile/reject/${memberId}`, { notes });
    return response.data;
  },

  // Get Pending Music - matches ApiGuide.md exactly
  getPendingMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/admin/pending-music');
    return response.data;
  },

  // Approve Music - matches ApiGuide.md exactly
  approveMusic: async (musicId: number, isrcCode: string): Promise<ArtistWork> => {
    const response = await api.post(`/api/admin/music/approve/${musicId}`, { isrcCode });
    return response.data;
  },

  // Reject Music - matches ApiGuide.md exactly
  rejectMusic: async (musicId: number, notes: string): Promise<ArtistWork> => {
    const response = await api.post(`/api/admin/music/reject/${musicId}`, { notes });
    return response.data;
  },

  // Create Company - matches ApiGuide.md exactly
  createCompany: async (data: {
    email: string;
    password: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    contactPerson: string;
  }): Promise<{ company: Company; user: User }> => {
    const response = await api.post('/api/admin/company/create', data);
    return response.data;
  },

  // User Management
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  },

  // Company Management
  getAllCompanies: async (): Promise<Company[]> => {
    const response = await api.get('/api/admin/getllcompanies');
    return response.data;
  },

  getCompanyById: async (id: number): Promise<Company> => {
    const response = await api.get(`/api/admin/getcompaniesbyid/${id}`);
    return response.data;
  },

  createCompany: async (data: {
    email: string;
    password: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    contactPerson: string;
    companyEmail: string;
  }): Promise<{ company: Company; user: User }> => {
    const response = await api.post('/api/admin/company/create', data);
    return response.data;
  },

  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/api/admin/company/update/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/deletecompany/${id}`);
  },

  // Admin Management
  getAllAdmins: async (): Promise<Admin[]> => {
    const response = await api.get('/api/admin/admins/all');
    return response.data;
  },

  getAdminById: async (id: number): Promise<Admin> => {
    const response = await api.get(`/api/admin/admins/${id}`);
    return response.data;
  },

  createAdmin: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<{ admin: Admin; user: User }> => {
    const response = await api.post('/api/admin/admins/create', data);
    return response.data;
  },

  updateAdmin: async (id: number, data: { name: string; role: string }): Promise<Admin> => {
    const response = await api.put(`/api/admin/admins/update/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/admins/delete/${id}`);
  },

  // LogSheet Management
  getAllLogSheets: async (): Promise<LogSheet[]> => {
    const response = await api.get('/api/admin/getallsheets');
    return response.data;
  },

  getLogSheetById: async (id: number): Promise<LogSheet> => {
    const response = await api.get(`/api/admin/logsheet/${id}`);
    return response.data;
  },

  deleteLogSheet: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/logsheet/delete/${id}`);
  },

  // Music Management
  getAllMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/admin/getllmusic');
    return response.data;
  },

  deleteMusic: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/music/delete/${id}`);
  },

  // Profile Management
  getAllProfiles: async (): Promise<MemberDetails[]> => {
    const response = await api.get('/api/admin/getallprofiles');
    return response.data;
  },

  getProfileById: async (id: number): Promise<MemberDetails> => {
    const response = await api.get(`/api/admin/getprofilebyid/${id}`);
    return response.data;
  },

  getUserDocuments: async (userId: number): Promise<{
    passportPhoto?: PassportPhoto;
    idDocument?: any;
    bankConfirmationLetter?: any;
    proofOfPayment?: any;
    memberDetails?: MemberDetails;
  }> => {
    const response = await api.get(`/api/admin/userdocumentsandprofiles/${userId}`);
    return response.data;
  },

  getUserMusic: async (userId: number): Promise<ArtistWork[]> => {
    const response = await api.get(`/api/admin/usermusic/${userId}`);
    return response.data;
  },

  // Statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
};

// License API
export const licenseAPI = {
  // Legal Entity
  createLegalEntity: async (data: Partial<LegalEntity>): Promise<LegalEntity> => {
    const response = await api.post('/api/legalentity/post', data);
    return response.data;
  },

  getAllLegalEntities: async (): Promise<LegalEntity[]> => {
    const response = await api.get('/api/legalentity/all');
    return response.data;
  },

  getLegalEntityById: async (id: number): Promise<LegalEntity> => {
    const response = await api.get(`/api/legalentity/${id}`);
    return response.data;
  },

  deleteLegalEntity: async (id: number): Promise<void> => {
    await api.delete(`/api/legalentity/${id}`);
  },

  // Natural Person
  createNaturalPerson: async (data: Partial<NaturalPersonEntity>): Promise<NaturalPersonEntity> => {
    const response = await api.post('/api/naturalperson/post', data);
    return response.data;
  },

  getAllNaturalPersons: async (): Promise<NaturalPersonEntity[]> => {
    const response = await api.get('/api/naturalperson/all');
    return response.data;
  },

  getNaturalPersonById: async (id: number): Promise<NaturalPersonEntity> => {
    const response = await api.get(`/api/naturalperson/${id}`);
    return response.data;
  },

  deleteNaturalPerson: async (id: number): Promise<void> => {
    await api.delete(`/api/naturalperson/${id}`);
  },
};

// Lookup APIs
export const lookupAPI = {
  getTitles: async (): Promise<Title[]> => {
    const response = await api.get('/api/tittle/all');
    return response.data;
  },
  getVatStatuses: async (): Promise<any[]> => {
    const response = await api.get('/api/vat/all');
    return response.data;
  },
  getBankNames: async (): Promise<any[]> => {
    const response = await api.get('/api/bankname/all');
    return response.data;
  },
  getMaritalStatuses: async (): Promise<any[]> => {
    const response = await api.get('/api/martial/all');
    return response.data;
  },
  getMemberCategories: async (): Promise<any[]> => {
    const response = await api.get('/api/members/all');
    return response.data;
  },
  getGenders: async (): Promise<any[]> => {
    const response = await api.get('/api/gender/all');
    return response.data;
  },

  getMusicUsageTypes: async (): Promise<MusicUsageTypes[]> => {
    const response = await api.get('/api/usagetypes/all');
    return response.data;
  },

  getSourceOfMusic: async (): Promise<SourceOfMusic[]> => {
    const response = await api.get('/api/sourceofmusic/all');
    return response.data;
  },

  getArtistUploadTypes: async (): Promise<ArtistUploadType[]> => {
    const response = await api.get('/api/uploadtype/all');
    return response.data;
  },

  getArtistWorkTypes: async (): Promise<ArtistWorkType[]> => {
    const response = await api.get('/api/worktype/all');
    return response.data;
  },

  getStatuses: async (): Promise<Status[]> => {
    const response = await api.get('/api/status/all');
    return response.data;
  },
};

// Invoice API
export const invoiceAPI = {
  sendInvoice: async (invoice: Partial<Invoice>, clientEmail: string): Promise<Invoice> => {
    const response = await api.post(`/api/invoices/send?clientEmail=${clientEmail}`, invoice);
    return response.data;
  },

  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/api/invoices/all');
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  // Artist Payments
  sendArtistPayment: async (payment: Partial<ArtistInvoiceReports>, clientEmail: string): Promise<ArtistInvoiceReports> => {
    const response = await api.post(`/api/artistpayments/send?clientEmail=${clientEmail}`, payment);
    return response.data;
  },

  getAllArtistPayments: async (): Promise<ArtistInvoiceReports[]> => {
    const response = await api.get('/api/artistpayments/all');
    return response.data;
  },
};

// File download helper
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export default api;