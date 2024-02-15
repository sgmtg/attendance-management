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
import { AdminIndividual } from './AdminIndividual';

export const AdminToday = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState<DocumentData[]>([]);

  // 選択された従業員の情報を管理するステートを追加
  const [selectedEmployee, setSelectedEmployee] = useState<DocumentData>([]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().isAdmin);
          if (docSnap.data().isAdmin) {
            const fetchEmployeesAttendance = async () => {
              // usersコレクションから従業員の基本情報を取得
              const usersRef = collection(db, 'users');
              const usersSnapshot = await getDocs(usersRef);
              const usersData = usersSnapshot.docs.map((doc) => ({
                uid: doc.id,
                name: doc.data().name,
                attended: null, // 初期値はnullまたはundefined
                left: null,
              }));

              // 今日の日付を取得
              const today = format(new Date(), 'yyyy-MM-dd');

              // 各従業員に対して出退勤情報を取得
              for (const user of usersData) {
                const attendanceRef = collection(db, 'test');
                const q = query(
                  attendanceRef,
                  where('date', '==', today),
                  where('employee_id', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                  const attendanceData = querySnapshot.docs[0].data();
                  user.attended = attendanceData.attended;
                  user.left = attendanceData.left;
                }
              }

              setEmployees(usersData);
            };

            fetchEmployeesAttendance();
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
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access Denied. You are not an admin.</div>;
  }
  console.log(selectedEmployee);

  return (
    <div>
      <h1>
        管理画面
        <Button onClick={() => navigate('/attendance')}>ユーザーページ</Button>
      </h1>
      <h3>本日の勤務状況</h3>
      <TableContainer component={Paper} sx={{ bgcolor: 'grey.200' }}>
        {/* 全体の背景色を薄いピンクに設定 */}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.300' }}>
              {' '}
              {/* ヘッダの背景色を濃いピンクに設定 */}
              <TableCell>従業員ID</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>勤務状況</TableCell>
              <TableCell align="right">出勤時間</TableCell>
              <TableCell align="right">退勤時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((record) => (
              <TableRow key={record.uid}>
                <TableCell component="th" scope="row">
                  <Button
                    onClick={() => {
                      setSelectedEmployee(record);
                    }}
                  >
                    {record.uid}
                  </Button>
                </TableCell>{' '}
                <TableCell>{record.name}</TableCell>
                <TableCell
                  sx={{
                    //テキストの色を変える
                    color:
                      record.attended && record.left
                        ? 'blue'
                        : record.attended
                        ? 'green'
                        : 'red',
                  }}
                >
                  {
                    //勤務状況の表示
                    record.attended && record.left
                      ? '出勤済み、退勤済み'
                      : record.attended
                      ? '出勤済み、未退勤'
                      : '未出勤'
                  }
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
      {/* 選択された従業員の情報を表示するセクション */}
      {selectedEmployee && (
        <h2 style={{ marginTop: '20px' }}>個人の勤務状況を表示</h2>
      )}
      <h3>氏名：{selectedEmployee.name}</h3>
      <AdminIndividual employee_uid={selectedEmployee.uid?.toString()} />
    </div>
  );
};
