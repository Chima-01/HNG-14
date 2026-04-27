import { FilterOptions } from './features.js';
import { supabase } from './supabase.js';

export interface ProfileSchema {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

// Insert a new profile
export async function saveProfile(profile: ProfileSchema) {
  console.log('Saving profile to database:', profile);

  try {
  const { status, error } = await supabase
    .from('profiles')
    .insert([profile]);
  
  if (error) {
    console.log('Error saving profile:', error);
    throw error;
  }
  return status;
} catch (error) { 
  console.log('Error in saveProfile:', error);
  return 'error';
}
}

// Get profile by name
export async function getProfileByName(name: string): Promise<ProfileSchema | null> {
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
export async function getProfileById(id: string | string[]): Promise<ProfileSchema | null> {
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
export async function getProfiles(filters: FilterOptions): Promise<ProfileSchema[]> {
  const { gender, age_group, country_id, min_age, max_age, min_gender_probability, min_country_probability, sort_by, order, page, limit } = filters;
  const pageNumber = page ?? 1;
  const limitNumber = limit ?? 10;

  let query = supabase
    .from('profiles')
    .select('*');

    if (gender) { query = query.eq ('gender', gender) }

    if (age_group) { query = query.eq ('age_group', age_group) }

    if (country_id) { query = query.eq ('country_id', country_id) }

    if (min_age) { query = query.gte('age', min_age) }

    if (max_age) { query = query.lte('age', max_age) }

    if (min_gender_probability) { query = query.gte('gender_probability', min_gender_probability) }

    if (min_country_probability) { query = query.gte('country_probability', min_country_probability) }

    const { data, error } = await query.order(sort_by || 'created_at', { ascending: order === 'asc' })
    .range((pageNumber - 1) * limitNumber, pageNumber * limitNumber - 1);
    
  
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    
    return data;
  }

// Update a profile
async function updateProfile(id: string, updates: Partial<ProfileSchema>) {
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

export const getTotalNumberOFProfiles = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error fetching total profiles:', error);
    throw error;
  }
  
  return count ?? 0;
}