const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const ADMIN_EMAILS = [
  'nazrulpost75@gmail.com'
];

/**
 * 1. Automatically set Admin Custom Claim on user creation if email matches admin list
 * Prevents client-side privilege escalation.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      await admin.firestore().collection('users').doc(user.uid).set({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Successfully assigned admin role and custom claims to ${user.email}`);
    } catch (err) {
      console.error('Error setting custom claims:', err);
    }
  }
});

/**
 * 2. Secure Callable Cloud Function to grant/revoke admin role
 * Callable ONLY by an existing admin with verified custom claim.
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Ensure caller is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only existing administrators can assign roles.'
    );
  }

  const { targetUid, isAdminRole } = data;
  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'Target user ID is required.');
  }

  await admin.auth().setCustomUserClaims(targetUid, { admin: !!isAdminRole });
  await admin.firestore().collection('users').doc(targetUid).update({
    role: isAdminRole ? 'admin' : 'student',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Log action in audit log
  await admin.firestore().collection('activityLogs').add({
    adminEmail: context.auth.token.email,
    action: isAdminRole ? 'Granted Admin Role' : 'Revoked Admin Role',
    details: `User UID: ${targetUid}`,
    timestamp: new Date().toISOString()
  });

  return { success: true };
});

/**
 * 3. Trigger notification when study material is approved
 */
exports.onStudyMaterialStatusChanged = functions.firestore
  .document('studyMaterials/{materialId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Checked if newly approved
    if (!beforeData.isApproved && afterData.isApproved) {
      const uploaderId = afterData.uploaderId;
      await admin.firestore().collection('notifications').add({
        userId: uploaderId,
        title: 'স্টাডি মেটেরিয়াল অনুমোদিত',
        message: `আপনার আপলোডকৃত "${afterData.title}" এডমিন কর্তৃক অনুমোদিত হয়েছে।`,
        type: 'approval',
        linkTab: 'study',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  });
