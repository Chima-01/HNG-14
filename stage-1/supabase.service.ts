import { supabase } from './supabase.js';

export interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

// Insert a new profile
export async function saveProfile(profile: Profile) {
  console.log('Saving profile to database:', profile);

  try {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile]);
  
  if (error) {
    console.log('Error saving profile:', error);
    throw error;
  }
  return data;
} catch (error) { 
  console.log('Error in saveProfile:', error);
}
}

// Get profile by name
export async function getProfileByName(name: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('name', name.toLowerCase())
    .single(); // Get one record
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  return data || null;
}

// Get profile by ID
export async function getProfileById(id: string | string[]): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  return data || null;
}

// Get all profiles
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
  
  return data;
}

// Update a profile
export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  
  return data;
}

// Delete a profile
export async function deleteProfile(id: string  | string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
  
  return data;
}