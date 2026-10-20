import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, CheckCircle, Loader2 } from 'lucide-react';
import CourseCard from './CourseCard';
import CatalogCourseCard from './CatalogCourseCard';
import CourseDetailModal from './CourseDetailModal';
import { coursesService, enrollmentsService } from '../../lib/coursesService';
import { useUser } from '../../context/UserContext';

const CoursesGrid = ({ userId }) => {
  const navigate = useNavigate();
  const { academyUser } = useUser();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledCoursesData, setEnrolledCoursesData] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const courses = await coursesService.getAllActiveCourses();
        
        let enrollments = [];
        if (userId) {
          enrollments = await enrollmentsService.getUserEnrollments(userId);
          
          const progressData = {};
          for (const enrollment of enrollments) {
            try {
              const { progressService } = await import('../../lib/coursesService');
              const progress = await progressService.getCourseProgress(userId, enrollment.course_id);
              progressData[enrollment.course_id] = progress;
            } catch (e) {
              progressData[enrollment.course_id] = null;
            }
          }
          setCourseProgress(progressData);
        }
        
        setAllCourses(courses);
        setEnrolledCourses(enrollments);
        
        const enrolledIds = enrollments.map(e => e.course_id);
        const enrolledData = courses.filter(c => enrolledIds.includes(c.id));
        setEnrolledCoursesData(enrolledData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleEnroll = (course) => {
    setSelectedCourse(course);
  };

  const handleAccessCourse = async (course) => {
    if (!userId) {
      return;
    }
    
    try {
      const alreadyEnrolled = await enrollmentsService.isUserEnrolled(userId, course.id);
      
      if (!alreadyEnrolled) {
        alert('Debes comprar el curso para acceder');
        return;
      }
      
      navigate(`/academia/course/${course.id}`);
    } catch (error) {
      console.error('Error al acceder al curso:', error);
      alert('Error al acceder al curso');
    }
    setSelectedCourse(null);
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course_id === courseId);
  };

  const availableCourses = allCourses.filter(c => !isEnrolled(c.id));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-lg text-slate-600">
            Cargando cursos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {enrolledCoursesData.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-academy-blue-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            Mis Cursos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCoursesData.map((course, index) => (
              <CatalogCourseCard 
                key={course.id} 
                course={course}
                index={index}
                onSelectCourse={(c) => navigate(`/academia/course/${c.id}`)}
                isEnrolled={true}
                progress={courseProgress[course.id]}
                enlarged
              />
            ))}
          </div>
        </div>
      )}

      {availableCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-academy-blue-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-academy-blue-900 to-[#234b7a] rounded-lg flex items-center justify-center">
              <Play size={20} className="text-white" />
            </div>
            Cursos Disponibles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableCourses.map((course, index) => (
              <CatalogCourseCard
                key={course.id}
                course={course}
                index={index}
                onSelectCourse={handleEnroll}
                isEnrolled={false}
                enlarged
              />
            ))}
          </div>
        </div>
      )}

      {allCourses.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gold-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            No hay cursos disponibles
          </h3>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            ¡Pronto tendremos nuevos cursos para ti!
          </p>
        </div>
      )}

      <CourseDetailModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onAccess={handleAccessCourse}
        userId={userId}
        user={academyUser}
      />
    </div>
  );
};

const EnrolledCourseCard = ({ course, userId, onClick }) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (userId) {
        const { progressService } = await import('../../lib/coursesService');
        const progressData = await progressService.getCourseProgress(userId, course.id);
        setProgress(progressData);
      }
    };
    loadProgress();
  }, [userId, course.id]);

  const progressPercentage = progress?.progressPercentage || 0;

  return (
    <div 
      onClick={onClick}
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 bg-white border-2 border-transparent hover:border-academy-blue-900 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-academy-blue-900 to-[#12243d] flex items-center justify-center">
            <span className="text-white/50 text-4xl font-bold">{course.title?.charAt(0) || 'C'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle size={12} />
          Activo
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Progreso</span>
            <span className="text-xs font-bold text-green-600">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
            </div>
          </div>
          {progress && (
            <p className="text-xs text-gray-500 mt-1">
              {progress.completedLessons} de {progress.totalLessons} lecciones
            </p>
          )}
        </div>

        <button className="w-full py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-academy-blue-900 to-[#234b7a] text-white hover:shadow-lg transition-all">
          Continuar Curso
        </button>
      </div>
    </div>
  );
};

export default CoursesGrid;
