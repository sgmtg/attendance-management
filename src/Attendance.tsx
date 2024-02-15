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
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Attendance = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const [attended, setAttended] = useState(false);
  const [records, setRecords] = useState<DocumentData[]>([]);
  const employeeId = currentUser?.uid; // 従業員ID、実際には認証情報から取得する

  useEffect(() => {
    const q = query(
      collection(db, 'attendance_records'),
      where('employee_id', '==', employeeId),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => doc.data());
      setRecords(data);
    });

    return () => unsubscribe();
  }, []);

  const postAttendance = async () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    const timeStr = format(now, 'HH:mm:ss');

    const record = {
      employee_id: employeeId,
      date: dateStr,
      attended: timeStr,
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
        leaved: timeStr,
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

  return (
    <div>
      <h1>
        打刻
        <Button onClick={onLogout}>ログアウト</Button>
        <Button onClick={() => navigate('/adminpage')}>管理者ページ</Button>
      </h1>
      {!attended && <button onClick={() => postAttendance()}>出勤</button>}
      {attended && <button onClick={() => postLeaving()}>退勤</button>}
      <h2>過去の記録</h2>
      <ul>
        {records.map((record, index) => (
          <li
            key={index}
          >{`日付: ${record.date}, 出勤: ${record.attended}, 退勤: ${record.leaved}`}</li>
        ))}
      </ul>
    </div>
  );
};
