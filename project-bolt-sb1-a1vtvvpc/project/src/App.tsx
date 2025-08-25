import React from 'react';
import AuthWrapper from './components/AuthWrapper';
import ChatComponent from './components/FormComponent';

function App() {
  return (
    <AuthWrapper>
      <ChatComponent />
    </AuthWrapper>
  );
}

export default App;