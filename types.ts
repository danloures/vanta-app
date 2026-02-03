
export enum UserStatus { 
  GUEST = 'GUEST', 
  PENDING = 'PENDING', 
  APPROVED = 'APPROVED', 
  ADMIN = 'ADMIN',
  VANTA_PROD = 'VANTA_PROD',
  VANTA_SOCIO = 'VANTA_SOCIO',
  VANTA_PROMOTER = 'VANTA_PROMOTER',
  VANTA_PORTARIA = 'VANTA_PORTARIA'
}
export enum MemberLevel { 
  CLASSIC = 'Vanta Classic', 
  PLUS = 'Vanta+', 
  SILVER = 'Silver Club', 
  GOLD = 'Gold Club', 
  PLATINUM = 'Platinum Club', 
  ELITE = 'Elite', 
  BLACK = 'Private Black' 
}

export type PrivacyLevel = 'todos' | 'amigos' | 'ninguem';

export interface UserPrivacy {
  profileInfo: PrivacyLevel;
  confirmedEvents: PrivacyLevel;
  messages: PrivacyLevel;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  instagram: string;
  status: UserStatus;
  level: MemberLevel;
  avatar: string;
  bio?: string;
  gallery: string[]; 
  isVantaPlus: boolean;
  privacy: UserPrivacy;
  joinedAt: number;
  vantaMoments: number;
  friends: string[]; 
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  confirmedEventsIds: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  messages: Message[];
}

export interface TicketVariation {
  id: string;
  area: 'Pista' | 'VIP' | 'Camarote' | 'Outro';
  customArea?: string;
  gender: 'Masculino' | 'Feminino' | 'Unisex';
  price: number;
  soldOut?: boolean;
}

export interface TicketBatch {
  id: string;
  name: string;
  limit: number;
  soldCount: number;
  validUntil: string; // ISO Date String
  variations: TicketVariation[];
}

export interface PromoterLimit {
  ruleId: string;
  limit: number;
}

export interface StaffMember {
  id: string;
  email: string;
  role: 'SOCIO' | 'PROMOTER' | 'PORTARIA';
  promoterLimits?: PromoterLimit[];
}

export interface GuestListRule {
  id: string;
  area: string;
  gender: 'Masculino' | 'Feminino' | 'Unisex';
  type: 'VIP' | 'CONSUMO' | 'ENTRADA' | 'MEIA';
  value: number;
}

export interface GuestEntry {
  id: string;
  name: string;
  userId?: string; 
  ruleId: string;
  addedByEmail: string;
  checkedIn: boolean;
  checkInTime?: number;
  checkedInByEmail?: string;
}

export interface Community {
  id: string;
  name: string;
  image: string;
  description: string;
  eventIds: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  image: string;
  isVipOnly: boolean;
  batches: TicketBatch[];
  guestListRules: GuestListRule[];
  isListEnabled: boolean;
  staff: StaffMember[];
  guests: GuestEntry[];
  capacity: number;
  rsvps: number;
  communityId: string;
  creatorId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VantaNotification {
  id: string;
  title: string;
  subtitle: string;
  type: 'friend_request' | 'event' | 'info' | 'message';
  fromUserId?: string;
  eventId?: string;
  target?: string;
}
