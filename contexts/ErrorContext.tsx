import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppError } from '../types';
import { errorUtils } from '../utils';

interface ErrorState {
  errors: AppError[];
  isLoading: boolean;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LOADING'; payload: boolean };

interface ErrorContextType {
  state: ErrorState;
  addError: (error: any, context?: string) => void;
  removeError: (timestamp: string) => void;
  clearErrors: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: ErrorState = {
  errors: [],
  isLoading: false,
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [action.payload, ...state.errors.slice(0, 4)], // Keep max 5 errors
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.timestamp !== action.payload),
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error: any, context?: string) => {
    const appError = errorUtils.createError(
      error?.code || 'UNKNOWN_ERROR',
      errorUtils.getErrorMessage(error),
      error
    );
    
    dispatch({ type: 'ADD_ERROR', payload: appError });
    errorUtils.logError(error, context);
  };

  const removeError = (timestamp: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: timestamp });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  return (
    <ErrorContext.Provider
      value={{
        state,
        addError,
        removeError,
        clearErrors,
        setLoading,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};