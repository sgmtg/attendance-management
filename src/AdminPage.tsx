import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase/Firebase'; // Firebaseの初期化設定をインポート
import { doc, getDoc } from 'firebase/firestore';

export const AdminPage = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        // Firestoreの新しいAPIを使用してドキュメント参照を取得
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().isAdmin);
        } else {
          console.log('No such document!');
        }
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access Denied. You are not an admin.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* 管理者専用のコンテンツをここに追加 */}
      <p>Welcome to the admin dashboard!</p>
    </div>
  );
};
