import { supabase } from './src/services/supabase.ts';

async function testFetch() {
  const { data, error } = await supabase.from('assessment_responses').select('*, assessments(instrument_id)');
  console.log("Responses:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

testFetch();
