export type UserRole = 'student' | 'moderator' | 'admin';

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
  linkTab?: 'home' | 'study' | 'community' | 'books' | 'lostfound';
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
