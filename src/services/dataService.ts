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
  calculateRisikoPerilaku,
  AKPDResult,
  AUMResult,
  BullyingResult,
  MotivasiResult,
  SelfEsteemResult,
  SociometricResult,
  MIResult,
  RisikoPerilakuResult,
} from './engine/ruleEngine';
import { AKPD_INTERPRETATION_BANK } from './engine/akpdInterpretation';
import { AUM_INTERPRETATION_BANK, BULLYING_INTERPRETATION_BANK, MOTIVASI_INTERPRETATION_BANK, SELF_ESTEEM_INTERPRETATION_BANK, RISIKO_PERILAKU_INTERPRETATION_BANK } from './engine/instrumentInterpretations';

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
    let risikoPerilakuRes: RisikoPerilakuResult | undefined;

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
      if (r.instrument_id === 'risiko_perilaku') {
        risikoPerilakuRes = calculateRisikoPerilaku(r.jawaban);
        // Populate detailMasalah dari interpretation bank
        // Domain A regular: berisiko jika dijawab >= 3
        const A_REGULAR_IDS = [1,3,5,8,9,11,14,16,17,20,22,24,27,28,29,31,33,36,38,41,43,44,48,49,51,59];
        // Domain A reverse: berisiko jika jawaban asli <= 2 (risk score = 6-val >= 4)
        const A_REVERSE_IDS = [7,12,19,26,35,39,46,53,54,56];
        // Domain B negative: berisiko jika dijawab >= 3
        const B_NEGATIVE_IDS = [10];
        const concerningIds: number[] = [
          ...A_REGULAR_IDS.filter(id => (r.jawaban[id] || 1) >= 2),           // Skala 1-3: >= Kadang-kadang
          ...A_REVERSE_IDS.filter(id => (r.jawaban[id] || 3) <= 2),           // Reverse: jawaban rendah = risiko
          ...B_NEGATIVE_IDS.filter(id => (r.jawaban[id] || 1) >= 2),          // B negatif: >= Kadang-kadang
        ];
        risikoPerilakuRes.detailMasalah = concerningIds
          .map(id => RISIKO_PERILAKU_INTERPRETATION_BANK[id])
          .filter(Boolean)
          .slice(0, 5) as string[];
      }
    });

    const mappedChoices = allSociometric.map(c => ({
      studentId: c.student_id,
      chosenStudentId: c.chosen_student_id,
      peringkat: c.peringkat,
    }));

    if (allSociometric.length > 0) {
      sociometricRes = calculateSociometry(studentId, classStudents.length, mappedChoices);
    }

    const dss = generateDSSAnalysis(akpdRes, aumRes, bullyingRes, motivasiRes, selfEsteemRes, sociometricRes, miRes, risikoPerilakuRes);

    return {
      student,
      akpd: akpdRes,
      aum: aumRes,
      bullying: bullyingRes,
      motivasi: motivasiRes,
      selfEsteem: selfEsteemRes,
      sosiometri: sociometricRes,
      mi: miRes,
      risikoPerilaku: risikoPerilakuRes,
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
      classes: classes,
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
      miDomains: {} as Record<string, number>,
      // NEW: Motivasi & Self-Esteem distributions
      motivasiLevels: {
        'Sangat Tinggi': 0, 'Tinggi': 0, 'Sedang': 0, 'Rendah': 0, 'Sangat Rendah': 0
      } as Record<string, number>,
      selfEsteemLevels: {
        'Tinggi': 0, 'Sedang': 0, 'Rendah': 0
      } as Record<string, number>,
      risikoPerilakuLevels: {
        'Tinggi': 0, 'Sedang': 0, 'Rendah': 0
      } as Record<string, number>,
      // NEW: List of high-risk students
      highRiskStudents: [] as Array<{
        id: string;
        nama: string;
        kelas_nama: string;
        kelas_id: string;
        tingkatRisiko: string;
        flags: string[];
      }>,
      // Per-student breakdown — used for client-side filtering by class
      studentBreakdown: [] as Array<{
        id: string;
        nama: string;
        kelas_id: string;
        kelas_nama: string;
        tingkatRisiko: string;
        akpdPrioritas: string | null;
        aumLevel: string | null;
        bullyingPeran: string | null;
        motivasiLevel: string | null;
        selfEsteemLevel: string | null;
        miTopDomain: string | null;
        risikoPerilakuLevel: string | null;
        hasSociometri: boolean;
        kondisiKeluargaLabels: string[];
        flags: string[];
      }>,
      // Kondisi keluarga aggregate
      kondisiKeluargaCounts: {
        'BROKEN HOME': 0,
        'YATIM PIATU': 0,
        'YATIM': 0,
        'PIATU': 0,
      } as Record<string, number>,
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
        let risikoPerilakuRes: RisikoPerilakuResult | undefined;

        studentResponses.forEach(r => {
          if (r.instrument_id === 'akpd_7') akpdRes = calculateAKPD(r.jawaban);
          if (r.instrument_id === 'aum') aumRes = calculateAUM(r.jawaban);
          if (r.instrument_id === 'bullying') bullyingRes = calculateBullying(r.jawaban);
          if (r.instrument_id === 'motivasi') motivasiRes = calculateMotivasi(r.jawaban);
          if (r.instrument_id === 'self_esteem') selfEsteemRes = calculateSelfEsteem(r.jawaban);
          if (r.instrument_id === 'multiple_intelligence') miRes = calculateMI(r.jawaban);
          if (r.instrument_id === 'risiko_perilaku') risikoPerilakuRes = calculateRisikoPerilaku(r.jawaban);
        });

        const sociometricRes = calculateSociometry(student.id, classStudents.length, mappedChoices);
        // Hanya kirim sosiometri ke DSS jika ada siswa di kelas yang sudah mengisi
        // (jika tidak ada pilihan sosiometri di kelas ini, jangan hukum siswa sbg "terisolasi")
        const classHasSociometriData = classStudents.some(cs =>
          mappedChoices.some(c => c.studentId === cs.id)
        );
        const sociometricForDSS = classHasSociometriData ? sociometricRes : undefined;
        const dss = generateDSSAnalysis(akpdRes, aumRes, bullyingRes, motivasiRes, selfEsteemRes, sociometricForDSS, miRes, risikoPerilakuRes);

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
        // NEW: Motivasi levels
        if (motivasiRes?.tingkatMotivasi) {
          summary.motivasiLevels[motivasiRes.tingkatMotivasi] = (summary.motivasiLevels[motivasiRes.tingkatMotivasi] || 0) + 1;
        }
        // NEW: Self-Esteem levels
        if (selfEsteemRes?.tingkat) {
          summary.selfEsteemLevels[selfEsteemRes.tingkat] = (summary.selfEsteemLevels[selfEsteemRes.tingkat] || 0) + 1;
        }
        // NEW: Risiko Perilaku levels
        if (risikoPerilakuRes?.levelRisikoPerilaku) {
          summary.risikoPerilakuLevels[risikoPerilakuRes.levelRisikoPerilaku] = (summary.risikoPerilakuLevels[risikoPerilakuRes.levelRisikoPerilaku] || 0) + 1;
        }
        // Build student breakdown entry (for all students)
        const flags: string[] = [];
        if (aumRes?.tingkatMasalah === 'Tinggi') flags.push('AUM Berat');
        if (bullyingRes && bullyingRes.peran !== 'Aman') flags.push(`Bullying: ${bullyingRes.peran}`);
        if (motivasiRes && (['Rendah', 'Sangat Rendah'] as string[]).includes(motivasiRes.tingkatMotivasi as string)) flags.push('Motivasi Rendah');
        if (selfEsteemRes?.tingkat === 'Rendah') flags.push('Self-Esteem Rendah');
        if (risikoPerilakuRes?.levelRisikoPerilaku === 'Tinggi') flags.push('Risiko Perilaku Tinggi');
        if (akpdRes?.prioritasUtama) flags.push(`AKPD: ${akpdRes.prioritasUtama}`);
        const kondisiKeluargaLabels = risikoPerilakuRes?.labelSituasiKeluarga || [];

        const hasSociometri = mappedChoices.some(c => c.studentId === student.id);

        summary.studentBreakdown.push({
          id: student.id,
          nama: student.nama,
          kelas_id: student.kelas_id,
          kelas_nama: student.kelas_nama,
          tingkatRisiko: dss?.tingkatRisikoGlobal || 'Rendah',
          akpdPrioritas: akpdRes?.prioritasUtama || null,
          aumLevel: aumRes?.tingkatMasalah || null,
          bullyingPeran: bullyingRes?.peran || null,
          motivasiLevel: motivasiRes?.tingkatMotivasi || null,
          selfEsteemLevel: selfEsteemRes?.tingkat || null,
          miTopDomain: miRes?.topDomains?.[0] || null,
          risikoPerilakuLevel: risikoPerilakuRes?.levelRisikoPerilaku || null,
          hasSociometri,
          kondisiKeluargaLabels,
          flags,
        });

        // Kondisi keluarga aggregate
        if (kondisiKeluargaLabels.includes('BROKEN HOME')) summary.kondisiKeluargaCounts['BROKEN HOME']++;
        if (kondisiKeluargaLabels.includes('YATIM PIATU') || kondisiKeluargaLabels.includes('YATIM / PIATU')) {
          summary.kondisiKeluargaCounts['YATIM PIATU']++;
        } else if (kondisiKeluargaLabels.includes('YATIM')) {
          summary.kondisiKeluargaCounts['YATIM']++;
        } else if (kondisiKeluargaLabels.includes('PIATU')) {
          summary.kondisiKeluargaCounts['PIATU']++;
        }

        // NEW: High-risk students list
        const isHighRisk = dss?.tingkatRisikoGlobal === 'Sangat Tinggi' || dss?.tingkatRisikoGlobal === 'Tinggi';
        if (isHighRisk) {
          summary.highRiskStudents.push({
            id: student.id,
            nama: student.nama,
            kelas_nama: student.kelas_nama,
            kelas_id: student.kelas_id,
            tingkatRisiko: dss.tingkatRisikoGlobal,
            flags,
          });
        }
      } catch (err) {
        console.error(`Error calculating analytics for student ${student.id}:`, err);
      }
    }

    // Sort high-risk students: Sangat Tinggi first
    summary.highRiskStudents.sort((a, b) => {
      if (a.tingkatRisiko === 'Sangat Tinggi' && b.tingkatRisiko !== 'Sangat Tinggi') return -1;
      if (b.tingkatRisiko === 'Sangat Tinggi' && a.tingkatRisiko !== 'Sangat Tinggi') return 1;
      return a.nama.localeCompare(b.nama);
    });

    return summary;
  }

  static async clearAllData() {
    // Implement delete for students and classes. It cascades to assessments and responses.
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
