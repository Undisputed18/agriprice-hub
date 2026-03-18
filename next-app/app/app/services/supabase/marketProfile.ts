// app/services/supabase/marketProfile.ts
// app/services/supabase/marketProfile.ts
import { createClient as createServerClient } from '@/components/lib/supabase/server'
import { createClient as createBrowserClient } from '@/components/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// ... rest of your code remains the same

// ============ Type Definitions ============

export interface MarketProfile {
  id?: string;
  user_id: string;
  full_name: string;
  email: string;
  market_name: string;
  market_type: 'retail' | 'wholesale' | 'both' | '';
  location: string;
  phone: string;
  description: string;
  open_time: string;
  close_time: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PriceSubmission {
  id?: string;
  market_profile_id: string;
  commodity: string;
  price: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_date: string;
  approved_at?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MarketReport {
  id?: string;
  market_profile_id: string;
  title: string;
  content: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  report_date: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileStats {
  totalSubmissions: number;
  recentPrices: number;
  reportsSubmitted: number;
  weeklyChange: number;
  pendingApprovals?: number;
  approvedSubmissions?: number;
  rejectedSubmissions?: number;
}

// ============ Helper Functions ============

/**
 * Get the appropriate Supabase client based on environment
 * @param client Optional pre-configured client
 * @returns Supabase client
 */
async function getClient(client?: SupabaseClient) {
  if (client) return client;
  
  // Check if we're in a server component
  if (typeof window === 'undefined') {
    return await createServerClient();
  }
  
  // Browser environment
  return createBrowserClient();
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Handle Supabase errors consistently
 */
function handleError(error: any, customMessage: string): never {
  console.error(`${customMessage}:`, error);
  throw new Error(`${customMessage}: ${error.message || 'Unknown error'}`);
}

// ============ Market Profile Services ============

export const marketProfileService = {
  /**
   * Get profile by user ID
   * @param userId - The user ID to fetch profile for
   * @param client - Optional Supabase client (for server components)
   */
  async getProfileByUserId(userId: string, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('market_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      return { 
        data, 
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 'error' as const,
        message: 'Failed to fetch profile'
      };
    }
  },

  /**
   * Create new profile
   * @param profile - Profile data to create
   * @param client - Optional Supabase client
   */
  async createProfile(
    profile: Omit<MarketProfile, 'id' | 'created_at' | 'updated_at'>, 
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('market_profiles')
        .insert([{
          ...profile,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const,
        message: 'Profile created successfully'
      };
    } catch (error) {
      handleError(error, 'Failed to create profile');
    }
  },

  /**
   * Update profile
   * @param userId - User ID to update
   * @param updates - Profile fields to update
   * @param client - Optional Supabase client
   */
  async updateProfile(
    userId: string, 
    updates: Partial<MarketProfile>, 
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('market_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      handleError(error, 'Failed to update profile');
    }
  },

  /**
   * Check if user has a profile
   */
  async hasProfile(userId: string, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      const { count, error } = await supabase
        .from('market_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      
      return {
        data: (count || 0) > 0,
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: false,
        error: error as Error,
        status: 'error' as const
      };
    }
  },

  /**
   * Get profile statistics
   */
  async getProfileStats(profileId: string, client?: SupabaseClient): Promise<ProfileStats> {
    try {
      const supabase = await getClient(client);
      
      // Get date ranges
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Run all queries in parallel for better performance
      const [
        totalSubmissionsResult,
        recentPricesResult,
        reportsCountResult,
        lastWeekCountResult,
        pendingApprovalsResult,
        approvedSubmissionsResult,
        rejectedSubmissionsResult
      ] = await Promise.allSettled([
        // Total submissions
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId),
        
        // Recent approved prices (last 7 days)
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId)
          .eq('status', 'approved')
          .gte('submitted_date', formatDate(sevenDaysAgo)),
        
        // Reports count
        supabase
          .from('market_reports')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId),
        
        // Last week submissions (for weekly change)
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId)
          .gte('submitted_date', formatDate(fourteenDaysAgo))
          .lt('submitted_date', formatDate(sevenDaysAgo)),
        
        // Pending approvals
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId)
          .eq('status', 'pending'),
        
        // Approved submissions (last 30 days)
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId)
          .eq('status', 'approved')
          .gte('submitted_date', formatDate(thirtyDaysAgo)),
        
        // Rejected submissions (last 30 days)
        supabase
          .from('price_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('market_profile_id', profileId)
          .eq('status', 'rejected')
          .gte('submitted_date', formatDate(thirtyDaysAgo))
      ]);

      // Extract counts from results
      const totalSubmissions = totalSubmissionsResult.status === 'fulfilled' 
        ? totalSubmissionsResult.value.count || 0 
        : 0;
      
      const recentPrices = recentPricesResult.status === 'fulfilled' 
        ? recentPricesResult.value.count || 0 
        : 0;
      
      const reportsCount = reportsCountResult.status === 'fulfilled' 
        ? reportsCountResult.value.count || 0 
        : 0;
      
      const lastWeekCount = lastWeekCountResult.status === 'fulfilled' 
        ? lastWeekCountResult.value.count || 0 
        : 0;
      
      const pendingApprovals = pendingApprovalsResult.status === 'fulfilled' 
        ? pendingApprovalsResult.value.count || 0 
        : 0;
      
      const approvedSubmissions = approvedSubmissionsResult.status === 'fulfilled' 
        ? approvedSubmissionsResult.value.count || 0 
        : 0;
      
      const rejectedSubmissions = rejectedSubmissionsResult.status === 'fulfilled' 
        ? rejectedSubmissionsResult.value.count || 0 
        : 0;

      // Calculate weekly change
      const weeklyChange = lastWeekCount > 0 
        ? Number(((totalSubmissions - lastWeekCount) / lastWeekCount * 100).toFixed(1))
        : 0;

      return {
        totalSubmissions,
        recentPrices,
        reportsSubmitted: reportsCount,
        weeklyChange,
        pendingApprovals,
        approvedSubmissions,
        rejectedSubmissions
      };
    } catch (error) {
      handleError(error, 'Failed to fetch profile stats');
    }
  },

  /**
   * Get recent price submissions with optional filters
   */
  async getRecentPrices(
    profileId: string, 
    options?: {
      limit?: number;
      status?: 'pending' | 'approved' | 'rejected';
      days?: number;
    },
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      const limit = options?.limit || 5;
      
      let query = supabase
        .from('price_submissions')
        .select('*')
        .eq('market_profile_id', profileId);

      // Apply status filter if provided
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      // Apply date filter if provided
      if (options?.days) {
        const date = new Date();
        date.setDate(date.getDate() - options.days);
        query = query.gte('submitted_date', formatDate(date));
      }

      const { data, error } = await query
        .order('submitted_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return {
        data: data || [],
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: [],
        error: error as Error,
        status: 'error' as const,
        message: 'Failed to fetch recent prices'
      };
    }
  },

  /**
   * Get all profiles (admin only)
   */
  async getAllProfiles(options?: {
    isActive?: boolean;
    marketType?: 'retail' | 'wholesale' | 'both';
    limit?: number;
    offset?: number;
  }, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      let query = supabase
        .from('market_profiles')
        .select('*');

      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      if (options?.marketType) {
        query = query.eq('market_type', options.marketType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error as Error,
        status: 'error' as const
      };
    }
  }
};

// ============ Price Submission Services ============

export const priceSubmissionService = {
  /**
   * Create a new price submission
   */
  async create(
    submission: Omit<PriceSubmission, 'id' | 'created_at' | 'updated_at'>, 
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('price_submissions')
        .insert([{
          ...submission,
          status: submission.status || 'pending',
          submitted_date: submission.submitted_date || formatDate(new Date())
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const,
        message: 'Price submission created successfully'
      };
    } catch (error) {
      handleError(error, 'Failed to create price submission');
    }
  },

  /**
   * Get pending approvals for a profile
   */
  async getPendingApprovals(profileId: string, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('price_submissions')
        .select('*')
        .eq('market_profile_id', profileId)
        .eq('status', 'pending')
        .order('submitted_date', { ascending: false });

      if (error) throw error;
      
      return {
        data: data || [],
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: [],
        error: error as Error,
        status: 'error' as const
      };
    }
  },

  /**
   * Update submission status
   */
  async updateStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    approvedBy: string,
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('price_submissions')
        .update({ 
          status, 
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const,
        message: `Submission ${status} successfully`
      };
    } catch (error) {
      handleError(error, 'Failed to update submission status');
    }
  },

  /**
   * Get submissions with filters
   */
  async getSubmissions(
    profileId: string,
    filters?: {
      status?: 'pending' | 'approved' | 'rejected';
      startDate?: string;
      endDate?: string;
      commodity?: string;
      limit?: number;
      offset?: number;
    },
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      let query = supabase
        .from('price_submissions')
        .select('*', { count: 'exact' })
        .eq('market_profile_id', profileId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.commodity) {
        query = query.ilike('commodity', `%${filters.commodity}%`);
      }

      if (filters?.startDate) {
        query = query.gte('submitted_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('submitted_date', filters.endDate);
      }

      const { data, error, count } = await query
        .order('submitted_date', { ascending: false })
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10) - 1);

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error as Error,
        status: 'error' as const
      };
    }
  }
};

// ============ Market Report Services ============

export const marketReportService = {
  /**
   * Create a new market report
   */
  async create(
    report: Omit<MarketReport, 'id' | 'created_at' | 'updated_at'>, 
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('market_reports')
        .insert([{
          ...report,
          report_date: report.report_date || formatDate(new Date())
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const,
        message: 'Report created successfully'
      };
    } catch (error) {
      handleError(error, 'Failed to create report');
    }
  },

  /**
   * Get reports for a profile
   */
  async getReports(
    profileId: string, 
    options?: {
      reportType?: 'daily' | 'weekly' | 'monthly' | 'custom';
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
    client?: SupabaseClient
  ) {
    try {
      const supabase = await getClient(client);
      
      let query = supabase
        .from('market_reports')
        .select('*')
        .eq('market_profile_id', profileId);

      if (options?.reportType) {
        query = query.eq('report_type', options.reportType);
      }

      if (options?.startDate) {
        query = query.gte('report_date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('report_date', options.endDate);
      }

      const { data, error } = await query
        .order('report_date', { ascending: false })
        .limit(options?.limit || 50);

      if (error) throw error;
      
      return {
        data: data || [],
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: [],
        error: error as Error,
        status: 'error' as const
      };
    }
  },

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: string, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      const { data, error } = await supabase
        .from('market_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      
      return {
        data,
        error: null,
        status: 'success' as const
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 'error' as const
      };
    }
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string, client?: SupabaseClient) {
    try {
      const supabase = await getClient(client);
      
      const { error } = await supabase
        .from('market_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      return {
        success: true,
        error: null,
        status: 'success' as const,
        message: 'Report deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        status: 'error' as const
      };
    }
  }
};

// Export a combined object for convenience
export const marketServices = {
  profile: marketProfileService,
  submissions: priceSubmissionService,
  reports: marketReportService
};

export default marketServices;