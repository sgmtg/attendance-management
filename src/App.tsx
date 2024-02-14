import { AuthProvider } from './AuthContext'; // Homeだけimport
import { AuthContext0 } from './AuthContext0';

function App() {
  return (
    <>
      <AuthProvider>
        <AuthContext0 />
      </AuthProvider>
    </>
  );
}

export default App;
