import { useState, useEffect } from 'react';
import { auth, db } from './firebase/Firebase'; // Firebaseの設定をインポート
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { useAuth } from './AuthContext';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Attendance = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentViewMonth, setCurrentViewMonth] = useState(new Date());

  const [attended, setAttended] = useState(false);
  const [left, setLeft] = useState(false);

  const [records, setRecords] = useState<DocumentData[]>([]);
  const employeeId = currentUser?.uid; // 従業員ID、実際には認証情報から取得する

  useEffect(() => {
    const q_history = query(
      collection(db, 'attendance_records'),
      where('employee_id', '==', employeeId),
      where('date', '>=', format(subDays(new Date(), 2), 'yyyy-MM-dd')),
      orderBy('date', 'desc')
    );

    const today = format(new Date(), 'yyyy-MM-dd');

    const unsubscribe = onSnapshot(q_history, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => doc.data());
      setRecords(data);

      // 本日の記録が存在するかどうかを確認
      const todayRecord = data.find((record) => record.date === today);

      setAttended(!!todayRecord?.attended);
      // 退勤してるかどうかを確認
      setLeft(!!todayRecord?.left);
    });

    return () => unsubscribe();
  }, []);

  const postAttendance = async () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    const timeStr = format(now, 'HH:mm:ss');
    const yearMonthStr = format(now, 'yyyy-MM');

    const record = {
      employee_id: employeeId,
      date: dateStr,
      attended: timeStr,
      yearMonth: yearMonthStr,
    };

    await addDoc(collection(db, 'attendance_records'), record);

    setAttended(true); // 出勤か退勤かで状態を変更
  };

  const postLeaving = async () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    const timeStr = format(now, 'HH:mm:ss');

    // 同じemployee_idとdateを持つレコードを検索するクエリを構築
    const q = query(
      collection(db, 'attendance_records'),
      where('employee_id', '==', employeeId),
      where('date', '==', dateStr)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // 最初に見つかったレコードのみを更新
      const docToUpdate = querySnapshot.docs[0];
      const docRef = doc(db, 'attendance_records', docToUpdate.id);
      await updateDoc(docRef, {
        left: timeStr,
      });
    } else {
      // 該当するレコードがない場合の処理
      console.log('No matching record found to update');
    }
  };

  const onLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      alert('ログアウトに失敗しました');
    }
  };

  // 月ごとの記録をフィルタリングする関数
  const filterRecordsByMonth = (records: DocumentData[], month: Date) => {
    const startOfMonthStr = format(startOfMonth(month), 'yyyy-MM-dd');
    const endOfMonthStr = format(endOfMonth(month), 'yyyy-MM-dd');
    return records.filter(
      (record) => record.date >= startOfMonthStr && record.date <= endOfMonthStr
    );
  };

  const showPreviousMonth = () => {
    setCurrentViewMonth(subMonths(currentViewMonth, 1));
  };
  const showNextMonth = () => {
    setCurrentViewMonth(addMonths(currentViewMonth, 1));
  };

  const recordsToShow = filterRecordsByMonth(records, currentViewMonth);
  const dayNames = [
    '（日）',
    '（月）',
    '（火）',
    '（水）',
    '（木）',
    '（金）',
    '（土）',
  ];

  return (
    <div>
      <h1>
        打刻
        <Button onClick={onLogout}>ログアウト</Button>
        <Button onClick={() => navigate('/adminpage')}>管理者ページ</Button>
      </h1>
      {!attended && !left && (
        <button onClick={() => postAttendance()}>出勤</button>
      )}
      {attended && !left && <button onClick={() => postLeaving()}>退勤</button>}
      {left && <p>本日は退勤しました</p>}
      <h2>{format(currentViewMonth, 'yyyy-MM')}の出勤記録</h2>
      <Button variant="outlined" onClick={showPreviousMonth}>
        前の月を表示
      </Button>
      <Button variant="outlined" onClick={showNextMonth}>
        次の月を表示
      </Button>
      <div>
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 400,
            bgcolor: 'grey.100', // 背景色を薄いグレーに設定
            '& .MuiTableCell-head': {
              // ヘッダーセルのスタイルをカスタマイズ
              bgcolor: 'grey.400', // ヘッダーの背景色を少し濃いグレーに設定
            },
          }}
        >
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>出勤</TableCell>
                <TableCell>退勤</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordsToShow.map((record, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {record.date}
                    {dayNames[new Date(record.date).getDay()]}
                  </TableCell>
                  <TableCell>{record.attended}</TableCell>
                  <TableCell>{record.left}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
