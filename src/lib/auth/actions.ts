'use server';

import { createClient } from './server';
import { redirect } from 'next/navigation';
import type { OAuthProvider, SignInInput, SignUpInput, AuthError } from '@/types/auth';
import { AUTH_ERRORS } from '@/types/auth';

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'kakao' | 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      queryParams: provider === 'kakao' ? { prompt: 'login' } : undefined,
    },
  });

  if (error) {
    throw error;
  }

  redirect(data.url);
}

export async function signIn(input: SignInInput): Promise<{ error?: AuthError }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: { code: 'AUTH_INVALID_CREDENTIALS', message: AUTH_ERRORS.AUTH_INVALID_CREDENTIALS } };
    }
    if (error.message === 'Email not confirmed') {
      return { error: { code: 'AUTH_EMAIL_NOT_CONFIRMED', message: AUTH_ERRORS.AUTH_EMAIL_NOT_CONFIRMED } };
    }
    if (error.message === 'User is banned') {
      return { error: { code: 'AUTH_USER_BANNED', message: AUTH_ERRORS.AUTH_USER_BANNED } };
    }
    return { error: { code: 'AUTH_UNKNOWN', message: error.message } };
  }

  redirect('/dashboard');
}

export async function signUp(input: SignUpInput): Promise<{ error?: AuthError }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: { code: 'AUTH_EMAIL_EXISTS', message: AUTH_ERRORS.AUTH_EMAIL_EXISTS } };
    }
    if (error.message.includes('Password should be at least')) {
      return { error: { code: 'AUTH_WEAK_PASSWORD', message: AUTH_ERRORS.AUTH_WEAK_PASSWORD } };
    }
    return { error: { code: 'AUTH_UNKNOWN', message: error.message } };
  }

  redirect('/auth/verify-email');
}

export async function signInAsDemo(): Promise<{ error?: AuthError }> {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.DEMO_ADMIN_PASSWORD;

  if (!email || !password) {
    return { error: { code: 'AUTH_UNKNOWN', message: '데모 모드가 설정되지 않았습니다' } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: { code: 'AUTH_UNKNOWN', message: error.message } };
  }

  redirect('/admin');
}

export async function resetPasswordRequest(email: string): Promise<{ error?: AuthError }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/confirm?next=/auth/reset-password`,
  });

  if (error) {
    return { error: { code: 'AUTH_UNKNOWN', message: error.message } };
  }

  return {};
}

export async function updatePassword(password: string): Promise<{ error?: AuthError }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.message.includes('Password should be at least')) {
      return { error: { code: 'AUTH_WEAK_PASSWORD', message: AUTH_ERRORS.AUTH_WEAK_PASSWORD } };
    }
    return { error: { code: 'AUTH_UNKNOWN', message: error.message } };
  }

  redirect('/auth/login?message=password_updated');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
