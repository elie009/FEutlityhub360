// Example: How to use getUserLoans() with current user ID

import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

// Example component showing how to fetch user loans
export const LoanExample = () => {
  const { user } = useAuth();

  const fetchUserLoans = async () => {
    if (user) {
      try {
        console.log('Fetching loans for user ID:', user.id);
        debugger
        // This will call: GET /api/Loans/{userId}
        const loans = await apiService.getUserLoans(user.id);
        
        console.log('User loans:', loans);
        return loans;
      } catch (error) {
        console.error('Failed to fetch user loans:', error);
      }
    } else {
      console.log('No user logged in');
    }
  };

  return {
    fetchUserLoans,
    userId: user?.id
  };
};

// Example usage in a component:
/*
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const MyComponent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    const loadLoans = async () => {
      if (user) {
        const loans = await apiService.getUserLoans(user.id);
        console.log('Loans:', loans);
      }
    };
    
    loadLoans();
  }, [user]);
  
  return <div>...</div>;
};
*/
