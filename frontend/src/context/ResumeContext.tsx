import React, { createContext, useContext, useState } from 'react';
import type { ParsedResumeResponse } from '../types/resume';
import type { CybersecurityRole } from '../types/role';

interface ResumeContextType {
  parsedData: ParsedResumeResponse | null;
  targetRole: CybersecurityRole | null;
  setParsedData: (data: ParsedResumeResponse | null) => void;
  setTargetRole: (role: CybersecurityRole | null) => void;
  resetAll: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const STORAGE_KEY_DATA = 'careerpilot_parsed_data';
const STORAGE_KEY_ROLE = 'careerpilot_target_role';

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parsedData, setParsedDataState] = useState<ParsedResumeResponse | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [targetRole, setTargetRoleState] = useState<CybersecurityRole | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setParsedData = (data: ParsedResumeResponse | null) => {
    setParsedDataState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY_DATA);
    }
  };

  const setTargetRole = (role: CybersecurityRole | null) => {
    setTargetRoleState(role);
    if (role) {
      localStorage.setItem(STORAGE_KEY_ROLE, JSON.stringify(role));
    } else {
      localStorage.removeItem(STORAGE_KEY_ROLE);
    }
  };

  const resetAll = () => {
    setParsedDataState(null);
    setTargetRoleState(null);
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_ROLE);
  };

  return (
    <ResumeContext.Provider value={{ parsedData, targetRole, setParsedData, setTargetRole, resetAll }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
