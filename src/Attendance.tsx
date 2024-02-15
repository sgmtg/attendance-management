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

  const table_attendance_records = 'test';

  useEffect(() => {
    const q_history = query(
      collection(db, table_attendance_records),
      where('employee_id', '==', employeeId),
      orderBy('date', 'desc')
    );

    const today = format(new Date(), 'yyyy-MM-dd');
    console.log('today0', today);

    const unsubscribe = onSnapshot(q_history, (querySnapshot) => {
      console.log('aaaaaa');
      const data = querySnapshot.docs.map((doc) => doc.data());
      setRecords(data);

      // 本日の記録が存在するかどうかを確認
      const todayRecord = data.find((record) => record.date === today);
      console.log('todayall', data);

      setAttended(!!todayRecord?.attended);
      // 退勤してるかどうかを確認
      setLeft(!!todayRecord?.left);
    });

    return () => unsubscribe();
  }, []);

  const postAttendance = async () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');

    const record = {
      employee_id: employeeId,
      date: dateStr,
      attended: now,
    };

    await addDoc(collection(db, table_attendance_records), record);

    setAttended(true); // 出勤か退勤かで状態を変更
  };

  const postLeaving = async () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');

    // 同じemployee_idとdateを持つレコードを検索するクエリを構築
    const q = query(
      collection(db, table_attendance_records),
      where('employee_id', '==', employeeId),
      where('date', '==', dateStr)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // 最初に見つかったレコードのみを更新
      const docToUpdate = querySnapshot.docs[0];
      const docRef = doc(db, table_attendance_records, docToUpdate.id);
      await updateDoc(docRef, {
        left: now,
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

  // 今月の累積残業時間を計算
  const totalOvertime = recordsToShow.reduce((acc, record) => {
    if (record.left) {
      const overtime =
        record.left.toDate() - record.attended.toDate() - 8 * 60 * 60 * 1000;
      return acc + Math.max(overtime, 0);
    }
    return acc;
  }, 0);

  const dayNames = [
    '（日）',
    '（月）',
    '（火）',
    '（水）',
    '（木）',
    '（金）',
    '（土）',
  ];

  const formatDuration = (milliseconds: number) => {
    let plus = true;
    if (milliseconds < 0) {
      plus = false;
      milliseconds = Math.abs(milliseconds);
    }
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return plus
      ? `${hours}時間${minutes}分${seconds}秒`
      : `-${hours}時間${minutes}分${seconds}秒`;
  };

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
      <div>当月の累積残業時間: {formatDuration(totalOvertime)}</div>
      <Button
        variant="outlined"
        onClick={showPreviousMonth}
        sx={{ marginTop: '0.5em', marginBottom: '0.5em' }}
      >
        前の月を表示
      </Button>
      <Button
        variant="outlined"
        onClick={showNextMonth}
        sx={{ marginLeft: '0.5em', marginTop: '0.5em', marginBottom: '0.5em' }}
      >
        次の月を表示
      </Button>
      <div>
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 800,
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
                <TableCell>勤務時間 （休憩含む）</TableCell>
                <TableCell>
                  所定労働時間時間（8時間）との差
                  <br />
                  （残業時間）
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordsToShow.map((record, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {record.date}
                    {dayNames[new Date(record.date).getDay()]}
                  </TableCell>
                  <TableCell>
                    {format(record.attended.toDate(), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {record.left
                      ? format(record.left.toDate(), 'HH:mm:ss')
                      : '--:--:--'}
                  </TableCell>
                  <TableCell>
                    {record.left
                      ? formatDuration(
                          record.left.toDate() - record.attended.toDate()
                        )
                      : '--:--:--'}
                  </TableCell>
                  <TableCell
                    sx={{
                      //テキストの色を変える
                      color: record.left
                        ? record.left.toDate() - record.attended.toDate() >
                          8 * 60 * 60 * 1000
                          ? 'blue'
                          : 'red'
                        : 'black',
                    }}
                  >
                    {record.left
                      ? formatDuration(
                          record.left.toDate() -
                            record.attended.toDate() -
                            8 * 60 * 60 * 1000
                        )
                      : '--:--:--'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
