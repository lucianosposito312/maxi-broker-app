import { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle, Circle, Clock } from 'lucide-react';

const CourseSidebar = ({ course, currentLesson, onLessonSelect, progress }) => {
  const [expandedModules, setExpandedModules] = useState(new Set([course?.modules?.[0]?.id]));

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const isLessonCompleted = (lessonId) => {
    if (!progress || !progress.completedLessonIds) return false;
    return progress.completedLessonIds.includes(lessonId);
  };

  const handleLessonClick = (lesson, module) => {
    onLessonSelect(lesson, module);
  };

  return (
    <div className="p-3">
      {course?.modules?.map((module, moduleIndex) => {
        const moduleCompleted = module.lessons?.every(l => isLessonCompleted(l.id));
        const isExpanded = expandedModules.has(module.id);
        
        return (
          <div key={module.id} className="mb-2">
            <button
              onClick={() => toggleModule(module.id)}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left
                ${isExpanded 
                  ? 'bg-gradient-to-r from-[#3d6a9e] to-[#2d5a8e] text-white shadow-lg' 
                  : 'bg-white/10 hover:bg-white/20 text-white/90'
                }
              `}
            >
              <div className="flex items-center gap-2 pr-2">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${moduleCompleted ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}
                `}>
                  {moduleCompleted ? <CheckCircle size={14} /> : moduleIndex + 1}
                </div>
                <span className="font-semibold text-sm leading-tight truncate">
                  {module.title}
                </span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-white/70 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </button>

            <div className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
            `}>
              <div className="ml-2 space-y-1">
                {module.lessons?.map((lesson, lessonIndex) => {
                  const isCurrent = currentLesson?.id === lesson.id;
                  const completed = isLessonCompleted(lesson.id);
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson, module)}
                      className={`
                        w-full flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200 text-left
                        ${isCurrent 
                          ? 'bg-gold-500 text-white shadow-md transform scale-[1.02]' 
                          : 'hover:bg-white/10 text-white/80 hover:translate-x-1'
                        }
                      `}
                    >
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : isCurrent ? (
                          <PlayCircle size={16} className="text-white" />
                        ) : (
                          <Circle size={16} className="text-white/40" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                        {lesson.duration_minutes && (
                          <p className="text-xs text-white/50 flex items-center gap-1">
                            <Clock size={10} />
                            {lesson.duration_minutes} min
                          </p>
                        )}
                      </div>
                      
                      {completed && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {(!course?.modules || course.modules.length === 0) && (
        <div className="text-center py-8 text-white/50">
          <p className="text-sm">No hay módulos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default CourseSidebar;