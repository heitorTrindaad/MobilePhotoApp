import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://virstxgvkdtjtjhcvyeu.supabase.co";
const SUPABASE_KEY = "sb_publishable_849cpl1wWRxK6EFpOBjcmg_etZa2Qgr";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);