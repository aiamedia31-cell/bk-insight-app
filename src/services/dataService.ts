// =======================================================
// BK INSIGHT MVP - SUPABASE DATA SERVICE MANAGER
// =======================================================
import { StudentImportRecord } from './excelImporter';
import { generateDSSAnalysis, DSSIntegratedAnalysis } from './engine/dssEngine';
import { supabase } from './supabase';
import {
  calculateAKPD,
  calculateAUM,
  calculateBullying,
  calculateMotivasi,
  calculateSelfEsteem,
  calculateSociometry,
  calculateMI,
  AKPDResult,
  AUMResult,
  BullyingResult,
  MotivasiResult,
  SelfEsteemResult,
  SociometricResult,
  MIResult,
} from './engine/ruleEngine';
import { AKPD_INTERPRETATION_BANK } from './engine/akpdInterpretation';
import { AUM_INTERPRETATION_BANK, BULLYING_INTERPRETATION_BANK, MOTIVASI_INTERPRETATION_BANK, SELF_ESTEEM_INTERPRETATION_BANK } from './engine/instrumentInterpretations';

export interface ClassData {
  id: string;
  nama: string; // e.g. "VII A"
}

export interface StudentData {
  id: string;
  nama: string;
  kelas_id: string;
  kelas_nama: string;
  tanggal_lahir: string; // YYYY-MM-DD
  gender: 'L' | 'P';
}

export interface ActiveAssessment {
  id: string;
  instrument_id: string; // 'akpd_7', 'aum', 'bullying', 'motivasi', 'self_esteem', 'sosiometri', 'multiple_intelligence'
  instrument_nama: string;
  assigned_classes: string[]; // List of class IDs that have access
}

export interface StudentResponseRecord {
  assessment_id: string;
  student_id: string;
  instrument_id: string;
  jawaban: Record<number, number>; // question_id -> answer_value
  submitted_at: string;
}

export interface SociometricChoiceRecord {
  assessment_id: string;
  student_id: string;
  chosen_student_id: string;
  peringkat: number;
}

export class DataService {

  // GURU AUTH
  static async loginGuru(email: string, password?: string): Promise<boolean> {
    let query = supabase.from('users_guru').select('*').eq('email', email);
    if (password) {
      query = query.eq('password', password);
    }
    const { data, error } = await query.single();
    if (error || !data) return false;
    return true;
  }

  // QUESTIONS
  static async getQuestions(instrumentId: string): Promise<any[]> {
    const { data, error } = await supabase.from('questions').select('*').eq('instrument_id', instrumentId).order('no_urut', { ascending: true });
    if (error || !data) return [];
    // Format options from JSONB to object
    return data.map(q => ({
      id: q.no_urut,
      pernyataan: q.pernyataan,
      bidang: q.bidang,
      pilihan: typeof q.pilihan_jawaban === 'string' ? JSON.parse(q.pilihan_jawaban) : q.pilihan_jawaban,
    }));
  }

  // 1. Classes API
  static async getClasses(): Promise<ClassData[]> {
    const { data, error } = await supabase.from('classes').select('*').order('nama_kelas');
    if (error || !data) {
      console.error('Error fetching classes:', error);
      return [];
    }
    return data.map(d => ({
      id: d.id,
      nama: d.nama_kelas,
    }));
  }

  static async addClass(nama: string): Promise<ClassData | null> {
    const { data, error } = await supabase.from('classes').insert([{ nama_kelas: nama, tingkat: 'VII' }]).select().single();
    if (error || !data) {
      console.error('Error adding class:', error);
      return null;
    }
    return { id: data.id, nama: data.nama_kelas };
  }

  // 2. Students API
  static async getStudents(): Promise<StudentData[]> {
    const { data, error } = await supabase.from('students').select('*, classes(nama_kelas)').order('nama');
    if (error || !data) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data.map(d => ({
      id: d.id,
      nama: d.nama,
      kelas_id: d.kelas_id,
      kelas_nama: d.classes?.nama_kelas || '',
      tanggal_lahir: d.tanggal_lahir,
      gender: d.gender as 'L' | 'P',
    }));
  }

  static async getStudentsByClass(kelasId: string): Promise<StudentData[]> {
    const { data, error } = await supabase.from('students').select('*, classes(nama_kelas)').eq('kelas_id', kelasId).order('nama');
    if (error || !data) {
      console.error('Error fetching students by class:', error);
      return [];
    }
    return data.map(d => ({
      id: d.id,
      nama: d.nama,
      kelas_id: d.kelas_id,
      kelas_nama: d.classes?.nama_kelas || '',
      tanggal_lahir: d.tanggal_lahir,
      gender: d.gender as 'L' | 'P',
    }));
  }

  static async verifyStudentLogin(kelasId: string, studentId: string, birthDate: string): Promise<StudentData | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(nama_kelas)')
      .eq('id', studentId)
      .eq('kelas_id', kelasId)
      .eq('tanggal_lahir', birthDate)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      nama: data.nama,
      kelas_id: data.kelas_id,
      kelas_nama: data.classes?.nama_kelas || '',
      tanggal_lahir: data.tanggal_lahir,
      gender: data.gender as 'L' | 'P',
    };
  }

  static async importStudentsFromExcel(records: StudentImportRecord[]): Promise<number> {
    // Basic implementation for MVP. In production, do bulk upsert and handle transactions.
    let importedCount = 0;
    const currentClasses = await this.getClasses();

    for (const rec of records) {
      let targetClass: ClassData | null | undefined = currentClasses.find(c => c.nama.toLowerCase() === rec.kelas.toLowerCase());
      if (!targetClass) {
        targetClass = await this.addClass(rec.kelas);
        if (targetClass) currentClasses.push(targetClass);
      }

      if (targetClass) {
        // Check if student exists
        const { data: existing } = await supabase.from('students')
          .select('id')
          .eq('nama', rec.nama)
          .eq('kelas_id', targetClass.id)
          .maybeSingle();
        
        if (!existing) {
          const { error } = await supabase.from('students').insert([{
            nama: rec.nama,
            kelas_id: targetClass.id,
            tanggal_lahir: rec.tanggal_lahir,
            gender: rec.gender || 'L',
          }]);
          if (!error) importedCount++;
        }
      }
    }
    return importedCount;
  }

  // 3. Assessments API
  // In Supabase, instruments are static and assessments are created by teachers.
  // For MVP compatibility, we will fetch assessments and format them like active assessments.
  static async getAssessments(): Promise<ActiveAssessment[]> {
    const { data: instruments } = await supabase.from('instruments').select('*');
    const { data: assessments } = await supabase.from('assessments').select('*');
    
    if (!instruments) return [];

    return instruments.map(inst => {
      // Find all classes assigned to this instrument
      const assignedClasses = assessments
        ?.filter(a => a.instrument_id === inst.id && a.is_published)
        .map(a => a.kelas_id) || [];

      // We use the instrument ID as the assessment ID for backwards compatibility with UI
      return {
        id: `asm_${inst.id}`,
        instrument_id: inst.id,
        instrument_nama: inst.nama,
        assigned_classes: assignedClasses,
      };
    });
  }

  static async toggleAssessmentAssignment(instrumentId: string, kelasId: string): Promise<void> {
    // Clean up 'asm_' prefix if passed
    const cleanInstId = instrumentId.replace('asm_', '');
    
    // Check if assignment exists
    const { data: existing } = await supabase
      .from('assessments')
      .select('id')
      .eq('instrument_id', cleanInstId)
      .eq('kelas_id', kelasId)
      .maybeSingle();

    if (existing) {
      // Remove assignment
      await supabase.from('assessments').delete().eq('id', existing.id);
    } else {
      // Add assignment
      await supabase.from('assessments').insert([{
        instrument_id: cleanInstId,
        kelas_id: kelasId,
        judul: `Asesmen ${cleanInstId} Kelas ${kelasId}`,
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_published: true
      }]);
    }
  }

  // 4. Submit & Retrieve Responses
  static async submitResponse(assessmentId: string, studentId: string, instrumentId: string, jawaban: Record<number, number>): Promise<void> {
    const cleanInstId = instrumentId.replace(/^asm_/, '');
    
    // First, verify the assessment exists
    let assessment_db_id = assessmentId;
    if (assessmentId.startsWith('asm_')) {
      const { data: student } = await supabase.from('students').select('kelas_id').eq('id', studentId).maybeSingle();
      if (!student) throw new Error('Student not found');

      const { data: asm } = await supabase.from('assessments')
        .select('id')
        .eq('instrument_id', cleanInstId)
        .eq('kelas_id', student.kelas_id)
        .maybeSingle();

      if (asm) {
        assessment_db_id = asm.id;
      } else {
        throw new Error('Assessment not found for this class');
      }
    }

    // Upsert response
    const { data: existingResp, error: fetchErr } = await supabase.from('assessment_responses')
      .select('id')
      .eq('assessment_id', assessment_db_id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') { // Ignore "no rows returned"
      console.error('Error fetching existing response:', fetchErr);
    }

    if (existingResp) {
      const { error: updErr } = await supabase.from('assessment_responses')
        .update({ jawaban })
        .eq('id', existingResp.id);
      if (updErr) console.error('Error updating response:', updErr);
    } else {
      const { error: insErr } = await supabase.from('assessment_responses')
        .insert([{
          assessment_id: assessment_db_id,
          student_id: studentId,
          jawaban
        }]);
      if (insErr) console.error('Error inserting response:', insErr);
    }
  }

  static async resetStudentResponses(studentId: string): Promise<boolean> {
    try {
      const { error: err1 } = await supabase.from('assessment_responses').delete().eq('student_id', studentId);
      if (err1) throw err1;
      const { error: err2 } = await supabase.from('sociometric_responses').delete().eq('student_id', studentId);
      if (err2) throw err2;
      return true;
    } catch (e) {
      console.error('Error resetting responses:', e);
      return false;
    }
  }

  static async submitSociometricChoice(assessmentId: string, studentId: string, chosenStudentIds: string[]): Promise<void> {
    // Find assessment
    const { data: student } = await supabase.from('students').select('kelas_id').eq('id', studentId).single();
    if (!student) return;

    let assessment_db_id = '';
    const { data: asm } = await supabase.from('assessments')
      .select('id')
      .eq('instrument_id', 'sosiometri')
      .eq('kelas_id', student.kelas_id)
      .maybeSingle();
    
    if (asm) {
      assessment_db_id = asm.id;
    } else {
      const { data: newAsm } = await supabase.from('assessments').insert([{
        instrument_id: 'sosiometri',
        kelas_id: student.kelas_id,
        judul: `Asesmen sosiometri`,
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: new Date().toISOString().split('T')[0],
      }]).select().single();
      if (newAsm) assessment_db_id = newAsm.id;
    }

    if (!assessment_db_id) return;

    // Delete old choices
    await supabase.from('sociometric_responses')
      .delete()
      .eq('assessment_id', assessment_db_id)
      .eq('student_id', studentId);

    // Insert new choices
    const inserts = chosenStudentIds.map((chosenId, idx) => ({
      assessment_id: assessment_db_id,
      student_id: studentId,
      chosen_student_id: chosenId,
      peringkat: idx + 1
    }));

    await supabase.from('sociometric_responses').insert(inserts);

    // Add dummy response to assessment_responses to mark as completed
    const { data: existingResp } = await supabase.from('assessment_responses')
      .select('id')
      .eq('assessment_id', assessment_db_id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!existingResp) {
      await supabase.from('assessment_responses')
        .insert([{
          assessment_id: assessment_db_id,
          student_id: studentId,
          jawaban: {}
        }]);
    }
  }

  static async getStudentResponses(studentId?: string): Promise<StudentResponseRecord[]> {
    let query = supabase.from('assessment_responses').select('*, assessments(instrument_id)');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    const { data, error } = await query;

    if (error || !data) {
      console.error('Error fetching student responses:', error);
      return [];
    }

    return data.map(d => ({
      assessment_id: `asm_${d.assessments?.instrument_id}`, // UI uses this prefix
      student_id: d.student_id,
      instrument_id: d.assessments?.instrument_id,
      jawaban: d.jawaban as Record<number, number>,
      submitted_at: d.submitted_at
    }));
  }

  static async getSociometricChoices(): Promise<SociometricChoiceRecord[]> {
    const { data, error } = await supabase.from('sociometric_responses').select('*, assessments(instrument_id)');
    if (error || !data) return [];

    return data.map(d => ({
      assessment_id: `asm_${d.assessments?.instrument_id}`,
      student_id: d.student_id,
      chosen_student_id: d.chosen_student_id,
      peringkat: d.peringkat
    }));
  }

  // 5. Generate Integrated Profile for Student
  static async getIntegratedStudentProfile(studentId: string) {
    const studentInfo = await supabase.from('students').select('*, classes(nama_kelas)').eq('id', studentId).single();
    if (!studentInfo.data) return null;

    const student: StudentData = {
      id: studentInfo.data.id,
      nama: studentInfo.data.nama,
      kelas_id: studentInfo.data.kelas_id,
      kelas_nama: studentInfo.data.classes?.nama_kelas || '',
      tanggal_lahir: studentInfo.data.tanggal_lahir,
      gender: studentInfo.data.gender as 'L' | 'P',
    };

    const studentResponses = await this.getStudentResponses(studentId);
    const allSociometric = await this.getSociometricChoices();
    const classStudents = await this.getStudentsByClass(student.kelas_id);
    const akpdQuestions = await this.getQuestions('akpd_7');

    let akpdRes: AKPDResult | undefined;
    let aumRes: AUMResult | undefined;
    let bullyingRes: BullyingResult | undefined;
    let motivasiRes: MotivasiResult | undefined;
    let selfEsteemRes: SelfEsteemResult | undefined;
    let sociometricRes: SociometricResult | undefined;
    let miRes: MIResult | undefined;

    studentResponses.forEach(r => {
      if (r.instrument_id === 'akpd_7') {
        akpdRes = calculateAKPD(r.jawaban);
        if (akpdRes.prioritasUtamaIds && akpdRes.prioritasUtamaIds.length > 0) {
          akpdRes.detailMasalah = akpdRes.prioritasUtamaIds
            .map(id => AKPD_INTERPRETATION_BANK[id] || akpdQuestions.find(q => q.id === id)?.pernyataan)
            .filter(Boolean)
            .slice(0, 5) as string[];
        }
      }
      if (r.instrument_id === 'aum') {
        aumRes = calculateAUM(r.jawaban);
        if (aumRes.jawabanYaIds && aumRes.jawabanYaIds.length > 0) {
          aumRes.detailMasalah = aumRes.jawabanYaIds
            .map(id => AUM_INTERPRETATION_BANK[id])
            .filter(Boolean)
            .slice(0, 5) as string[];
        }
      }
      if (r.instrument_id === 'bullying') {
        bullyingRes = calculateBullying(r.jawaban);
        if (bullyingRes.jawabanBermasalahIds && bullyingRes.jawabanBermasalahIds.length > 0) {
          bullyingRes.detailMasalah = bullyingRes.jawabanBermasalahIds
            .map(id => BULLYING_INTERPRETATION_BANK[id])
            .filter(Boolean)
            .slice(0, 3) as string[];
        }
      }
      if (r.instrument_id === 'motivasi') {
        motivasiRes = calculateMotivasi(r.jawaban);
        if (motivasiRes.jawabanBermasalahIds && motivasiRes.jawabanBermasalahIds.length > 0) {
          motivasiRes.detailMasalah = motivasiRes.jawabanBermasalahIds
            .map(id => MOTIVASI_INTERPRETATION_BANK[id])
            .filter(Boolean)
            .slice(0, 3) as string[];
        }
      }
      if (r.instrument_id === 'self_esteem') {
        selfEsteemRes = calculateSelfEsteem(r.jawaban);
        if (selfEsteemRes.jawabanBermasalahIds && selfEsteemRes.jawabanBermasalahIds.length > 0) {
          selfEsteemRes.detailMasalah = selfEsteemRes.jawabanBermasalahIds
            .map(id => SELF_ESTEEM_INTERPRETATION_BANK[id])
            .filter(Boolean)
            .slice(0, 3) as string[];
        }
      }
      if (r.instrument_id === 'multiple_intelligence') miRes = calculateMI(r.jawaban);
    });

    const mappedChoices = allSociometric.map(c => ({
      studentId: c.student_id,
      chosenStudentId: c.chosen_student_id,
      peringkat: c.peringkat,
    }));

    if (allSociometric.length > 0) {
      sociometricRes = calculateSociometry(studentId, classStudents.length, mappedChoices);
    }

    const dss = generateDSSAnalysis(akpdRes, aumRes, bullyingRes, motivasiRes, selfEsteemRes, sociometricRes, miRes);

    return {
      student,
      akpd: akpdRes,
      aum: aumRes,
      bullying: bullyingRes,
      motivasi: motivasiRes,
      selfEsteem: selfEsteemRes,
      sosiometri: sociometricRes,
      mi: miRes,
      dss,
    };
  }

  static async getClassAnalyticsSummary() {
    const students = await this.getStudents();
    const classes = await this.getClasses();
    
    // Bulk fetch for analytics
    const allResponses = await this.getStudentResponses();
    const allSociometric = await this.getSociometricChoices();
    
    const summary = {
      totalSiswa: students.length,
      totalKelas: classes.length,
      riskLevels: {
        'Sangat Tinggi': 0,
        'Tinggi': 0,
        'Sedang': 0,
        'Rendah': 0
      } as Record<string, number>,
      akpdPrioritas: {
        'Pribadi': 0,
        'Sosial': 0,
        'Belajar': 0,
        'Karier': 0
      } as Record<string, number>,
      aumKedaruratan: {
        'Tinggi': 0,
        'Sedang': 0,
        'Rendah': 0
      } as Record<string, number>,
      bullyingRoles: {
        'Aman': 0,
        'Korban Ringan': 0,
        'Korban Sangat Rentan': 0
      } as Record<string, number>,
      miDomains: {} as Record<string, number>
    };

    const mappedChoices = allSociometric.map(c => ({
      studentId: c.student_id,
      chosenStudentId: c.chosen_student_id,
      peringkat: c.peringkat,
    }));

    // Calculate integrated profile for each student in-memory (bulk optimization)
    for (const student of students) {
      try {
        const studentResponses = allResponses.filter(r => r.student_id === student.id);
        const classStudents = students.filter(s => s.kelas_id === student.kelas_id);
        
        let akpdRes: AKPDResult | undefined;
        let aumRes: AUMResult | undefined;
        let bullyingRes: BullyingResult | undefined;
        let motivasiRes: MotivasiResult | undefined;
        let selfEsteemRes: SelfEsteemResult | undefined;
        let miRes: MIResult | undefined;

        studentResponses.forEach(r => {
          if (r.instrument_id === 'akpd_7') akpdRes = calculateAKPD(r.jawaban);
          if (r.instrument_id === 'aum') aumRes = calculateAUM(r.jawaban);
          if (r.instrument_id === 'bullying') bullyingRes = calculateBullying(r.jawaban);
          if (r.instrument_id === 'motivasi') motivasiRes = calculateMotivasi(r.jawaban);
          if (r.instrument_id === 'self_esteem') selfEsteemRes = calculateSelfEsteem(r.jawaban);
          if (r.instrument_id === 'multiple_intelligence') miRes = calculateMI(r.jawaban);
        });

        const sociometricRes = calculateSociometry(student.id, classStudents.length, mappedChoices);
        const dss = generateDSSAnalysis(akpdRes, aumRes, bullyingRes, motivasiRes, selfEsteemRes, sociometricRes, miRes);

        if (dss?.tingkatRisikoGlobal) {
          summary.riskLevels[dss.tingkatRisikoGlobal] = (summary.riskLevels[dss.tingkatRisikoGlobal] || 0) + 1;
        }
        if (akpdRes?.prioritasUtama) {
          summary.akpdPrioritas[akpdRes.prioritasUtama] = (summary.akpdPrioritas[akpdRes.prioritasUtama] || 0) + 1;
        }
        if (aumRes?.tingkatMasalah) {
          summary.aumKedaruratan[aumRes.tingkatMasalah] = (summary.aumKedaruratan[aumRes.tingkatMasalah] || 0) + 1;
        }
        if (bullyingRes?.peran) {
          summary.bullyingRoles[bullyingRes.peran] = (summary.bullyingRoles[bullyingRes.peran] || 0) + 1;
        }
        if (miRes?.topDomains && miRes.topDomains.length > 0) {
          const dom = miRes.topDomains[0];
          summary.miDomains[dom] = (summary.miDomains[dom] || 0) + 1;
        }
      } catch (err) {
        console.error(`Error calculating analytics for student ${student.id}:`, err);
      }
    }

    return summary;
  }

  static async clearAllData() {
    // Implement delete for students and classes. It cascades to assessments and responses.
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
