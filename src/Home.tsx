import { Link } from 'react-router-dom'; // 追加

// src/routes/Home.js
export const Home = () => {
  return (
    <div>
      <p>Home</p>
      <li>
        <Link to="/attendance">勤務報告をする</Link>
      </li>
      <li>
        <Link to="/login">ログイン</Link>
      </li>
    </div>
  );
};
