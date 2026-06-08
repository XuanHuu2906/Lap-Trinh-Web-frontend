import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Khởi tạo an toàn: Chỉ khởi tạo khi có đầy đủ cấu hình trong .env để tránh crash ứng dụng lúc khởi động
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export default supabase;
