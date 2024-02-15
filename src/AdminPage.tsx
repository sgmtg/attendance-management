import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase/Firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const AdminPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<DocumentData[]>(
    []
  );

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().isAdmin);
          if (docSnap.data().isAdmin) {
            // 従業員の出退勤データを取得
            const today = format(new Date(), 'yyyy-MM-dd');
            const attendanceRef = collection(db, 'test');
            const q = query(attendanceRef, where('date', '==', today));
            const querySnapshot = await getDocs(q);
            const records = querySnapshot.docs.map((doc) => ({
              uid: doc.id,
              ...doc.data(),
            }));
            setAttendanceRecords(records);
          }
        } else {
          console.log('No such document!');
        }
      }
      setIsLoading(false);
    };

    document.body.style.backgroundColor = '#ddcccc';

    checkAdminStatus();
    // クリーンアップ関数で背景色を削除
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access Denied. You are not an admin.</div>;
  }

  return (
    <div>
      <h1>
        管理画面
        <Button onClick={() => navigate('/attendance')}>ユーザーページ</Button>
      </h1>
      <h3>本日の勤務状況</h3>
      <TableContainer component={Paper} sx={{ bgcolor: 'grey.400' }}>
        {/* 全体の背景色を薄いピンクに設定 */}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.300' }}>
              {' '}
              {/* ヘッダの背景色を濃いピンクに設定 */}
              <TableCell>従業員ID</TableCell>
              <TableCell align="right">出勤時間</TableCell>
              <TableCell align="right">退勤時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.uid}>
                <TableCell component="th" scope="row">
                  {record.uid}
                </TableCell>
                <TableCell align="right">
                  {record.attended
                    ? format(record.attended.toDate(), 'HH:mm:ss')
                    : '---'}
                </TableCell>
                <TableCell align="right">
                  {record.left
                    ? format(record.left.toDate(), 'HH:mm:ss')
                    : '---'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
