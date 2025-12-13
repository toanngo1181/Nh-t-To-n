import React from 'react';
import { Course } from '../types';
import { PlayCircle, FileText, BarChart, Trophy } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  userLevel?: number | null; // The user's current level in this specific course
  onClick: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, userLevel, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer flex flex-col h-full border border-gray-100"
      onClick={() => onClick(course.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-brand-blue shadow-sm">
          {userLevel ? `Đang học Level ${userLevel}` : `Tổng ${course.level} Level`}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
          {course.category}
        </div>
        <h3 className="text-lg font-heading font-bold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>
        
        <div className="mt-auto">
          {userLevel ? (
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div 
                className="h-2 rounded-full bg-brand-blue transition-all duration-500" 
                style={{ width: `${(userLevel / course.level) * 100}%` }}
              ></div>
              <p className="text-xs text-right mt-1 text-gray-500">Tiến độ Level {userLevel}/{course.level}</p>
            </div>
          ) : (
             <div className="flex items-center text-sm text-gray-500 gap-4">
                <div className="flex items-center gap-1"><PlayCircle size={14}/> Video</div>
                <div className="flex items-center gap-1"><FileText size={14}/> PDF</div>
             </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
        <span>{course.instructor}</span>
        <span className="flex items-center gap-1"><BarChart size={12}/> {course.totalStudents} học viên</span>
      </div>
    </div>
  );
};

export default CourseCard;