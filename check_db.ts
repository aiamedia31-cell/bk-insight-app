import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const { data, error } = await supabase.from('assessment_responses').select('*');
  console.log("All responses in DB:");
  data?.forEach(d => {
    console.log(`Student: ${d.student_id}, Assessment: ${d.assessment_id}`);
    const keys = Object.keys(d.jawaban || {});
    console.log(`Answers count: ${keys.length}`);
    let sum = 0;
    for(const k in d.jawaban) sum += Number(d.jawaban[k]);
    console.log(`Sum of answers: ${sum}`);
  });
}

checkDB();
