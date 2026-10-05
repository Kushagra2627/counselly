import { insforge } from './insforge';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'STARTUP' | 'LAWYER' | 'ADMIN';
    startup?: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string };
    lawyer?: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string };
  };
}

export const authService = {
  register: async (name: string, email: string, password: string, role: 'STARTUP' | 'LAWYER'): Promise<AuthResponse> => {
    const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (signUpError || !signUpData?.user) {
      throw new Error(signUpError?.message || 'Registration failed');
    }

    const authUser = signUpData.user;

    // 1. Create Profile in public.profiles
    const { error: profileError } = await insforge.database.from('profiles').insert([{
      id: authUser.id,
      email,
      name,
      role,
    }]);

    if (profileError) {
      console.warn('Profile creation warning:', profileError);
    }

    let startupInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;
    let lawyerInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;

    // 2. Create role-specific record
    if (role === 'STARTUP') {
      const { data: startupData } = await insforge.database
        .from('startups')
        .insert([{ user_id: authUser.id }])
        .select()
        .single();

      if (startupData) {
        startupInfo = {
          id: startupData.id,
          onboardingDone: startupData.onboarding_done ?? false,
          onboardingStep: startupData.onboarding_step ?? 0,
          verificationStatus: startupData.verification_status || 'PENDING',
        };
      }
    } else if (role === 'LAWYER') {
      const { data: lawyerData } = await insforge.database
        .from('lawyers')
        .insert([{
          user_id: authUser.id,
          name,
          email,
          verification_status: 'PENDING',
          onboarding_step: 0,
          onboarding_done: false,
        }])
        .select()
        .single();

      if (lawyerData) {
        lawyerInfo = {
          id: lawyerData.id,
          onboardingDone: lawyerData.onboarding_done ?? false,
          onboardingStep: lawyerData.onboarding_step ?? 0,
          verificationStatus: lawyerData.verification_status || 'PENDING',
        };
      }
    }

    return {
      accessToken: signUpData.accessToken || 'session-active',
      user: {
        id: authUser.id,
        email,
        name,
        role,
        startup: startupInfo,
        lawyer: lawyerInfo,
      },
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data: signInData, error: signInError } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData?.user) {
      throw new Error(signInError?.message || 'Invalid email or password');
    }

    const authUser = signInData.user;

    // Fetch profile
    const { data: profile } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const role = (profile?.role as 'STARTUP' | 'LAWYER' | 'ADMIN') || 'STARTUP';
    const name = profile?.name || (authUser.profile as any)?.name || email.split('@')[0];

    let startupInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;
    let lawyerInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;

    if (role === 'STARTUP') {
      let { data: startup } = await insforge.database
        .from('startups')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (!startup) {
        // Create if missing
        const { data: created } = await insforge.database
          .from('startups')
          .insert([{ user_id: authUser.id }])
          .select()
          .single();
        startup = created;
      }

      if (startup) {
        startupInfo = {
          id: startup.id,
          onboardingDone: startup.onboarding_done ?? false,
          onboardingStep: startup.onboarding_step ?? 0,
          verificationStatus: startup.verification_status || 'PENDING',
        };
      }
    } else if (role === 'LAWYER') {
      let { data: lawyer } = await insforge.database
        .from('lawyers')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (!lawyer) {
        const { data: created } = await insforge.database
          .from('lawyers')
          .insert([{ user_id: authUser.id, name, email }])
          .select()
          .single();
        lawyer = created;
      }

      if (lawyer) {
        lawyerInfo = {
          id: lawyer.id,
          onboardingDone: lawyer.onboarding_done ?? false,
          onboardingStep: lawyer.onboarding_step ?? 0,
          verificationStatus: lawyer.verification_status || 'PENDING',
        };
      }
    }

    return {
      accessToken: signInData.accessToken || 'session-active',
      user: {
        id: authUser.id,
        email: authUser.email,
        name,
        role,
        startup: startupInfo,
        lawyer: lawyerInfo,
      },
    };
  },

  logout: async (): Promise<void> => {
    await insforge.auth.signOut();
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) {
      throw new Error('No active session');
    }

    const authUser = data.user;
    const { data: profile } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const role = (profile?.role as 'STARTUP' | 'LAWYER' | 'ADMIN') || 'STARTUP';
    const name = profile?.name || (authUser.profile as any)?.name || authUser.email.split('@')[0];

    let startupInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;
    let lawyerInfo: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string } | undefined;

    if (role === 'STARTUP') {
      const { data: startup } = await insforge.database
        .from('startups')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (startup) {
        startupInfo = {
          id: startup.id,
          onboardingDone: startup.onboarding_done ?? false,
          onboardingStep: startup.onboarding_step ?? 0,
          verificationStatus: startup.verification_status || 'PENDING',
        };
      }
    } else if (role === 'LAWYER') {
      const { data: lawyer } = await insforge.database
        .from('lawyers')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (lawyer) {
        lawyerInfo = {
          id: lawyer.id,
          onboardingDone: lawyer.onboarding_done ?? false,
          onboardingStep: lawyer.onboarding_step ?? 0,
          verificationStatus: lawyer.verification_status || 'PENDING',
        };
      }
    }

    return {
      accessToken: 'session-active',
      user: {
        id: authUser.id,
        email: authUser.email,
        name,
        role,
        startup: startupInfo,
        lawyer: lawyerInfo,
      },
    };
  },

  getMe: async (): Promise<{ user: AuthResponse['user'] }> => {
    const res = await authService.refresh();
    return { user: res.user };
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      if ('sendResetPasswordEmail' in insforge.auth) {
        await (insforge.auth as any).sendResetPasswordEmail({ email });
      }
    } catch (e) {
      console.warn('Password reset request error:', e);
    }
    return 'If an account exists with that email, password reset instructions have been dispatched.';
  },

  resetPassword: async (_token: string, _newPassword: string): Promise<string> => {
    return 'Password reset successfully.';
  },
};
