
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tiny-base-2323twf0api.rksuccessor.workers.dev';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bmtwc2F4eGRiZG5ya3h0dmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE3OTgsImV4cCI6MjA4NDU2Nzc5OH0.mCEbcvs0gucOC2IBoYxS8CLAWfwDVDRdsaiD8G4dWrs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
