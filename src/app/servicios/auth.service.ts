import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  

  constructor() {
    
  }

  public async logIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  public async logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  public async getUserUid(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id || null;
  }

  public getSupabaseInstance(): SupabaseClient {
    return supabase;
  }

  public async signUp(email: string, password: string): Promise<string> {
    console.log('Email:', `"${email}"`);
  console.log('Password:', `"${password}"`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log('Supabase signUp response:', data);
  console.log('Supabase signUp error:', error);

  if (error) throw error;

  return data.user?.id ?? ''; 
}
}
