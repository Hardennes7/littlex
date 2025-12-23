// app/utils/jac.ts - Fixed for Next.js server-side rendering

// Dynamic import for client-side only
let jacInstance: any = null;
let initializationPromise: Promise<any> | null = null;

const initializeJac = async (): Promise<any> => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        // Dynamically import the client (client-side only)
        const module = await import('jac-client');
        const JacClient = module.JacClient || module.default;
        
        if (JacClient && typeof JacClient === 'function') {
          const instance = new JacClient('http://localhost:8000');
          
          // Cache in development for hot reload
          if (process.env.NODE_ENV !== 'production') {
            (globalThis as any).jac = instance;
          }
          
          return instance;
        } else {
          console.error('JacClient is not a valid constructor');
          return null;
        }
      } catch (error) {
        console.error('Failed to initialize JacClient:', error);
        return null;
      }
    })();
  }
  
  return await initializationPromise;
};

// Export a function that gets the client
export const getJacClient = async (): Promise<any> => {
  if (!jacInstance) {
    jacInstance = await initializeJac();
  }
  return jacInstance;
};

// For backward compatibility
export const jac = getJacClient();
export default jac;
