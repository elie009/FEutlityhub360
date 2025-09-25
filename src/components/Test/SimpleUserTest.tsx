import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SimpleUserTest: React.FC = () => {
  const { user } = useAuth();

  // This will run every time the component renders
  console.log('SimpleUserTest: Component rendered');
  console.log('SimpleUserTest: user object:', user);
  console.log('SimpleUserTest: user type:', typeof user);
  console.log('SimpleUserTest: user is null?', user === null);
  console.log('SimpleUserTest: user is undefined?', user === undefined);
  
  if (user) {
    console.log('SimpleUserTest: user.id:', user.id);
    console.log('SimpleUserTest: user.name:', user.name);
    console.log('SimpleUserTest: user.email:', user.email);
    console.log('SimpleUserTest: user.phone:', user.phone);
    console.log('SimpleUserTest: user.isActive:', user.isActive);
    console.log('SimpleUserTest: user.kycVerified:', user.kycVerified);
    console.log('SimpleUserTest: user.createdAt:', user.createdAt);
    console.log('SimpleUserTest: user.updatedAt:', user.updatedAt);
    
    // Check if any field is undefined
    const undefinedFields = [];
    if (user.id === undefined) undefinedFields.push('id');
    if (user.name === undefined) undefinedFields.push('name');
    if (user.email === undefined) undefinedFields.push('email');
    if (user.phone === undefined) undefinedFields.push('phone');
    if (user.isActive === undefined) undefinedFields.push('isActive');
    if (user.kycVerified === undefined) undefinedFields.push('kycVerified');
    if (user.createdAt === undefined) undefinedFields.push('createdAt');
    if (user.updatedAt === undefined) undefinedFields.push('updatedAt');
    
    if (undefinedFields.length > 0) {
      console.error('SimpleUserTest: UNDEFINED FIELDS:', undefinedFields);
    } else {
      console.log('SimpleUserTest: All fields are defined!');
    }
  }

  return (
    <div>
      <h3>Simple User Test</h3>
      <p>Check console logs for user data details</p>
      <p>User exists: {user ? 'Yes' : 'No'}</p>
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

export default SimpleUserTest;
