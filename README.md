# 画面
## ログイン画面
- Emailとパスワードでログイン可能
```
管理者権限のあるユーザ：
Email：　admin@gmail.com
パスワード：admin@

管理者権限のないユーザ2：
Email：　hogehoge@gmail.com
パスワード：hogehoge@

管理者権限のないユーザ3：
Email：　hogehoge2@gmail.com
パスワード：hogehoge2@
```
<img src="https://github.com/sgmtg/attendance-management/assets/72187839/fd1e17ff-fa49-4152-8c00-44f58adfb3b0" width="500px">


## 打刻画面
- 出勤、退勤を報告できる
- 暫定の残業時間などを表示
<img src="https://github.com/sgmtg/attendance-management/assets/72187839/59b9938a-eb06-480f-bb43-9653babcf063" width="500px">
  

## 管理画面
- 管理者権限があるユーザのみアクセス可能
- 本日の勤怠状況を確認できる（ステータスが3つ）
- 従業員idをクリックすると、各従業員について1ヶ月ごとの勤怠状況が確認できる
<img src="https://github.com/sgmtg/attendance-management/assets/72187839/c59ce266-15de-4d15-a8fe-c10893767301" width="500px">
<img src="https://github.com/sgmtg/attendance-management/assets/72187839/9d0b195f-8c0d-4ce5-94bc-cdf79fffaf0e" width="500px">






# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
