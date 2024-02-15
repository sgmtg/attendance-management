const admin = require('firebase-admin');
admin.initializeApp();

const functions = require('firebase-functions');

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // 関数を呼び出すユーザーの認証を確認します。
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // 管理者ロールを設定したいユーザーのUIDを指定します。
  const uid = data.uid;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return {
      message: `Success! The user with UID ${uid} has been granted the admin role.`,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
