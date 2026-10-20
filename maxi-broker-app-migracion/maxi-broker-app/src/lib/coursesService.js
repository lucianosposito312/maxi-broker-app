import { supabase } from './supabase.js';

const normalizeCourseNumber = (value, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractYoutubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
};

const sanitizeCoursePayload = (courseData = {}) => {
  let videoUrlValue = '';
  if (courseData.video_url) {
    const extracted = extractYoutubeVideoId(courseData.video_url);
    videoUrlValue = extracted || courseData.video_url;
  }
  
  return {
    title: courseData.title?.trim() || '',
    description: courseData.description?.trim() || '',
    short_description: courseData.short_description?.trim() || '',
    status: courseData.status || 'draft',
    thumbnail_url: courseData.thumbnail_url?.trim() || '',
    video_url: videoUrlValue,
    pdf_url: courseData.pdf_url?.trim() || '',
    price: courseData.is_free ? 0 : normalizeCourseNumber(courseData.price, 0),
    duration_hours: Math.max(0, Math.trunc(normalizeCourseNumber(courseData.duration_hours, 0))),
    level: courseData.level || 'principiante',
    has_certificate: Boolean(courseData.has_certificate),
    is_free: Boolean(courseData.is_free),
    learning_outcomes: Array.isArray(courseData.learning_outcomes) ? courseData.learning_outcomes : []
  };
};

// Servicios para gestionar cursos
export const coursesService = {
  // Obtener todos los cursos activos
  async getAllActiveCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  // Obtener un curso por ID
  async getCourseById(courseId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },

  // Crear un nuevo curso
  async createCourse(courseData) {
    try {
      const payload = sanitizeCoursePayload(courseData);

      const { data, error } = await supabase
        .from('courses')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Actualizar un curso
  async updateCourse(courseId, courseData) {
    try {
      const payload = sanitizeCoursePayload(courseData);

      const { data, error } = await supabase
        .from('courses')
        .update(payload)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Eliminar un curso
  async deleteCourse(courseId) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Obtener todos los cursos (para admin)
  async getAllCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  },

  // Crear módulo
  async createModule(moduleData) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  // Crear lección
  async createLesson(lessonData) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Actualizar módulo
  async updateModule(moduleId, moduleData) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  },

  // Actualizar lección
  async updateLesson(lessonId, lessonData) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  // Eliminar módulo
  async deleteModule(moduleId) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  },

  // Eliminar lección
  async deleteLesson(lessonId) {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }
};

// Servicios para gestionar inscripciones
export const enrollmentsService = {
  // Crear inscripción
  async createEnrollment(enrollmentData) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([enrollmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },

  // Obtener inscripciones de un usuario
  async getUserEnrollments(userId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  },

  // Verificar si un usuario está inscrito en un curso
  async isUserEnrolled(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('payment_status', 'paid')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  // Actualizar estado de pago
  async updatePaymentStatus(enrollmentId, paymentStatus, paymentId = null) {
    try {
      const updateData = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      if (paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
};

// Servicios para gestionar progreso
export const progressService = {
  // Marcar lección como completada
  async completeLesson(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert([{
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  // Obtener progreso de un usuario en un curso
  async getCourseProgress(userId, courseId) {
    try {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('payment_status', 'paid')
        .single();

      const isCompleted = !!enrollment?.completed_at;
      return {
        totalLessons: 1,
        completedLessons: isCompleted ? 1 : 0,
        completedLessonIds: [],
        progressPercentage: isCompleted ? 100 : 0,
        isCompleted
      };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return {
        totalLessons: 1,
        completedLessons: 0,
        completedLessonIds: [],
        progressPercentage: 0,
        isCompleted: false
      };
    }
  },

  // Verificar si una lección está completada
  async isLessonCompleted(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .eq('completed', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking lesson completion:', error);
      return false;
    }
  }
};
// Servicios para estadísticas administrativas
export const academyStatsService = {
  // Obtener estadísticas generales
  async getGeneralStats() {
    try {
      const [
        { count: totalStudents },
        { count: totalCourses },
        { count: activeEnrollments },
        { count: completedCourses }
      ] = await Promise.all([
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid').not('completed_at', 'is', null)
      ]);

      return {
        totalStudents: totalStudents || 0,
        totalCourses: totalCourses || 0,
        activeEnrollments: activeEnrollments || 0,
        completedCourses: completedCourses || 0
      };
    } catch (error) {
      console.error('Error fetching general stats:', error);
      return {
        totalStudents: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        completedCourses: 0
      };
    }
  },

  // Obtener estadísticas de un alumno específico
  async getUserStats(userId) {
    try {
      if (!userId) return { completedCourses: 0 };

      const { count: completedCourses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('payment_status', 'paid')
        .not('completed_at', 'is', null);

      return {
        completedCourses: completedCourses || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { completedCourses: 0 };
    }
  },

  // Obtener estadísticas por curso
  async getCourseStats() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          enrollments (count),
          paid_enrollments: enrollments(count)
        `)
        .eq('status', 'active');

      if (error) throw error;

      return data.map(course => ({
        ...course,
        totalEnrollments: course.enrollments?.length || 0,
        paidEnrollments: course.paid_enrollments?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return [];
    }
  }
};

// Servicios para gestionar configuraciones de la academia
export const academySettingsService = {
  // Obtener estado del modo Coming Soon
  async getComingSoonStatus() {
    try {
      const { data, error } = await supabase
        .from('academy_settings')
        .select('value')
        .eq('key', 'academy_coming_soon')
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          // PGRST116: No existe el registro
          // PGRST205: No existe la tabla
          return false;
        }
        throw error;
      }
      return data.value?.enabled || false;
    } catch (error) {
      console.error('Error fetching coming soon status:', error);
      return false;
    }
  },

  // Actualizar estado del modo Coming Soon
  async updateComingSoonStatus(enabled) {
    try {
      const { data, error } = await supabase
        .from('academy_settings')
        .upsert({
          key: 'academy_coming_soon',
          value: { enabled },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating coming soon status:', error);
      throw error;
    }
  }
};
