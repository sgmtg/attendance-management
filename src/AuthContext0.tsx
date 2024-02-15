import { Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { Attendance } from './Attendance';
import { Notfound } from './Notfound';
import { useAuth } from './AuthContext';
import { AdminPage } from './AdminPage';

export const AuthContext0 = () => {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser ? (
        <>
          <Routes>
            <Route path="/" element={<Login />} /> {/*RouteにHomeを設定する*/}
            <Route path="/login" element={<Login />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/adminpage" element={<AdminPage />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </>
      ) : (
        <Login />
      )}
      {/* currentUserが存在する場合はHomeを表示する。存在しない場合はAuthを表示する。*/}
    </>
  );
};
