import React, { createContext, useContext, useState } from 'react';
import { Student } from '@/types/student';

interface StudentContextType {
    students: Student[];
    setStudents: (students: Student[]) => void;
}

const StudentContext = createContext<StudentContextType>({
    students: [],
    setStudents: () => {}
});

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
    const [students, setStudents] = useState<Student[]>([]);

    return (
        <StudentContext.Provider value={{ students, setStudents }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudents = () => useContext(StudentContext);