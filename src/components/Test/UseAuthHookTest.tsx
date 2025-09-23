import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UseAuthHookTest: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('=== UseAuthHookTest: useAuth() called ===');
    console.log('UseAuthHookTest: user from useAuth():', user);
    
    if (user) {
      console.log('UseAuthHookTest: user.id:', user.id);
      console.log('UseAuthHookTest: user.name:', user.name);
      console.log('UseAuthHookTest: user.email:', user.email);
      console.log('UseAuthHookTest: user.phone:', user.phone);
      console.log('UseAuthHookTest: user.isActive:', user.isActive);
      console.log('UseAuthHookTest: user.kycVerified:', user.kycVerified);
      
      // Check for undefined fields
      const undefinedFields = [];
      if (user.id === undefined) undefinedFields.push('id');
      if (user.name === undefined) undefinedFields.push('name');
      if (user.email === undefined) undefinedFields.push('email');
      if (user.phone === undefined) undefinedFields.push('phone');
      if (user.isActive === undefined) undefinedFields.push('isActive');
      if (user.kycVerified === undefined) undefinedFields.push('kycVerified');
      
      if (undefinedFields.length > 0) {
        console.error('UseAuthHookTest: UNDEFINED FIELDS from useAuth():', undefinedFields);
        console.error('UseAuthHookTest: Full user object:', user);
      } else {
        console.log('UseAuthHookTest: All fields are defined in useAuth()!');
      }
    } else {
      console.log('UseAuthHookTest: user is null/undefined from useAuth()');
    }
    console.log('=== End UseAuthHookTest ===');
  }, [user]);

  return (
    <div>
      <h3>UseAuth Hook Test</h3>
      <p>Check console logs for useAuth() details</p>
      <p>User from useAuth(): {user ? 'Exists' : 'Null/Undefined'}</p>
      {user && (
        <div>
          <p>ID: {user.id || 'UNDEFINED'}</p>
          <p>Name: {user.name || 'UNDEFINED'}</p>
          <p>Email: {user.email || 'UNDEFINED'}</p>
          <p>Phone: {user.phone || 'UNDEFINED'}</p>
          <p>isActive: {user.isActive?.toString() || 'UNDEFINED'}</p>
          <p>kycVerified: {user.kycVerified?.toString() || 'UNDEFINED'}</p>
        </div>
      )}
    </div>
  );
};

export default UseAuthHookTest;
