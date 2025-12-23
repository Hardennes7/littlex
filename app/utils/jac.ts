// app/utils/jac.ts
// Fix for "JacClient is not a constructor" error in Next.js

// Solution: Use lazy loading and client-side only execution

type JacClientType = new (url: string) => any;

// Global cache (client-side only)
const globalForJac = globalThis as unknown as { jac?: any };

let jacInstance: any = null;
let jacModule: any = null;

export const getJacClient = async (): Promise<any> => {
  // Server-side rendering: return null
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Already have instance
  if (jacInstance) {
    return jacInstance;
  }
  
  // Try to get from global cache
  if (globalForJac.jac) {
    jacInstance = globalForJac.jac;
    return jacInstance;
  }
  
  try {
    // Dynamically import ONLY on client side
    // REPLACE 'jac-client-library' with your actual package name
    jacModule = await import('jac-client-library');
    
    const JacClient: JacClientType = jacModule.default || jacModule.JacClient;
    
    if (JacClient && typeof JacClient === 'function') {
      jacInstance = new JacClient('http://localhost:8000');
      
      // Cache for development
      if (process.env.NODE_ENV !== 'production') {
        globalForJac.jac = jacInstance;
      }
      
      return jacInstance;
    } else {
      console.error('JacClient is not a valid constructor');
      return null;
    }
  } catch (error) {
    console.error('Failed to load JacClient:', error);
    return null;
  }
};

// Export a promise for backward compatibility
export const jac = (async () => {
  return await getJacClient();
})();
