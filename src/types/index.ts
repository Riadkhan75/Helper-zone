export type UserRole = 'student' | 'moderator' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  collegeName: string;
  department: string;
  academicYear: string;
  bio?: string;
  phoneNumber?: string;
  showPhonePublicly?: boolean;
  role: UserRole;
  isBanned?: boolean;
  isSuspended?: boolean;
  emailVerified?: boolean;
  // Student ID Verification
  verificationStatus?: VerificationStatus;
  studentIdNumber?: string;
  idCardImageUrl?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationRejectionReason?: string;
  // Points & Contributions (Leaderboard)
  points?: number;
  completedTasksCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PostCategory = 
  | 'help'
  | 'question'
  | 'study_partner'
  | 'tuition'
  | 'club'
  | 'general';

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  replies?: CommentReply[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorCollege: string;
  authorAvatar?: string;
  category: PostCategory;
  title: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // user IDs
  commentCount: number;
  poll?: {
    question: string;
    options: PollOption[];
  };
  isUrgent?: boolean;
  status: 'active' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  id: string;
  uploaderId: string;
  uploaderName: string;
  title: string;
  description: string;
  subject: string;
  department: string;
  academicYear: string;
  category: 'handnote' | 'question_bank' | 'suggestion' | 'slides' | 'lab_report' | 'book_pdf';
  fileUrl: string;
  fileName: string;
  fileSizeMb: number;
  fileType: string;
  downloadCount: number;
  isApproved: boolean; // Must be approved by admin
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookCondition = 'brand_new' | 'like_new' | 'good' | 'acceptable';
export type BookListingType = 'sell' | 'exchange' | 'free';
export type BookStatus = 'available' | 'reserved' | 'sold';

export interface BookListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerCollege: string;
  sellerPhone?: string;
  title: string;
  author: string;
  edition?: string;
  subjectDepartment: string;
  condition: BookCondition;
  listingType: BookListingType;
  price: number; // 0 if free or exchange
  imageUrl?: string;
  description: string;
  status: BookStatus;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LostFoundType = 'lost' | 'found';
export type LostFoundStatus = 'active' | 'returned';

export interface LostFoundItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterCollege: string;
  reporterPhone?: string;
  type: LostFoundType;
  title: string;
  category: 'id_card' | 'electronics' | 'books_notes' | 'accessories' | 'keys' | 'money_wallet' | 'other';
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  status: LostFoundStatus;
  isApproved: boolean;
  hasSensitiveWarning?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'comment' | 'approval' | 'rejection' | 'lost_found' | 'announcement';
  linkTab?: 'home' | 'study' | 'community' | 'books' | 'lostfound' | 'profile' | 'academic' | 'leaderboard' | 'chat';
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'post' | 'study' | 'book' | 'lostfound' | 'user';
  targetTitle: string;
  reason: 'spam' | 'harassment' | 'copyright' | 'fake_info' | 'inappropriate' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  createdAt: string;
}

export interface CollegeNotice {
  id: string;
  title: string;
  content: string;
  priority: 'emergency' | 'important' | 'general';
  category: string;
  isActive: boolean;
  publishedBy: string;
  date: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  bannerNotice: string;
  isNoticeActive: boolean;
  isMaintenanceMode: boolean;
  maxFileUploadMb: number;
  allowedFileTypes: string[];
  logoUrl?: string;
  categories?: string[];
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

// Student ID Verification Request
export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCollege: string;
  userDepartment: string;
  academicYear: string;
  studentIdNumber: string;
  idCardImageUrl: string;
  status: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

// CGPA & Academic Calculator Types
export interface CGPACourse {
  id: string;
  name: string;
  credit: number;
  gradePoint: number;
  gradeLetter: string;
}

export interface CGPASemester {
  id: string;
  semesterName: string;
  courses: CGPACourse[];
}

export interface SavedCGPARecord {
  id: string;
  title: string;
  degreeName: string;
  totalCredits: number;
  cgpa: number;
  semesters: CGPASemester[];
  updatedAt: string;
}

// Routine & Exam Countdown Tracker Types
export type DayOfWeek = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface ClassRoutineSlot {
  id: string;
  day: DayOfWeek;
  subject: string;
  startTime: string; // e.g. "10:00 AM"
  endTime: string;   // e.g. "11:30 AM"
  roomNumber: string;
  teacherName?: string;
  type?: 'theory' | 'lab';
}

export interface SyllabusTopic {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ExamCountdownItem {
  id: string;
  subject: string;
  examTitle: string;
  examDate: string; // YYYY-MM-DDTHH:mm
  roomNumber?: string;
  syllabusTopics: SyllabusTopic[];
  notes?: string;
  createdAt: string;
}

// Bookmarks & Saved Items
export interface SavedBookmarks {
  materialIds: string[];
  postIds: string[];
  bookIds: string[];
}

// Direct 1-on-1 & Campus Group Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderCollege?: string;
  senderIsVerified?: boolean;
  content: string;
  contextItem?: {
    type: 'book' | 'study';
    id: string;
    title: string;
    price?: number;
    imageUrl?: string;
  };
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participants: {
    uid: string;
    displayName: string;
    photoURL?: string;
    collegeName?: string;
    department?: string;
    isVerified?: boolean;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  contextItem?: {
    type: 'book' | 'study';
    id: string;
    title: string;
    price?: number;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampusGroupRoom {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  departmentTag: string;
  memberCount: number;
}

