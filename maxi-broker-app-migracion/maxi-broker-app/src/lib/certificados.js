import { supabase } from './supabase';

export const certificatesService = {
  async createCertificate(userId, courseId) {
    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    const coursePrefix = course?.title 
      ? course.title.substring(0, 3).toUpperCase() 
      : 'CUR';
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateNumber = `${coursePrefix}-${year}-${random}`;

    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        user_id: userId,
        course_id: courseId,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserCertificates(userId) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses(
          id,
          title,
          thumbnail_url,
          has_certificate
        )
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async hasCertificate(userId, courseId) {
    const { data, error } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return !!data;
  },

  async getCertificateByCourse(userId, courseId) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses(
          id,
          title,
          thumbnail_url,
          has_certificate
        )
      `)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async incrementDownloadCount(certificateId) {
    const { data, error } = await supabase
      .from('certificates')
      .update({ 
        download_count: supabase.raw('download_count + 1') 
      })
      .eq('id', certificateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default certificatesService;
