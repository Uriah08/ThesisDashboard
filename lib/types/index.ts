// ================= USERS =================
export interface UsersCustomUser {
  id: bigint
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  role: string
  address: string
  mobile_number: string
  birthday?: Date | null
  profile_picture?: string | null
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  is_complete: boolean
  date_joined: Date
  last_login?: Date | null
  _count: number

  // relations
  announcements_announcementmodel?: AnnouncementsAnnouncementModel[]
  farms_farmmodel?: FarmsFarmModel[]
  trays_sessiontraymodel?: TraysSessionTrayModel[]
  trays_traystepmodel?: TraysTrayStepModel[]
  notifications_recipient?: NotificationsRecipient[]
}

// ================= FARMS =================
export interface FarmsFarmModel {
  id: bigint
  name: string
  description?: string | null
  image_url?: string | null
  password: string
  owner_id: bigint
  create_at: Date
  memberCount: number
  trayCount: number

  // relations
  users_customuser?: UsersCustomUser
  announcements_announcementmodel?: AnnouncementsAnnouncementModel[]
  farm_sessions_farmsessionmodel?: FarmSessionsFarmSessionModel[]
  farm_trays_farmtraymodel?: FarmTraysFarmTrayModel[]
  farms_farmmodel_blocked?: FarmsFarmModelBlocked[]
  farms_farmmodel_members?: FarmsFarmModelMembers[]
  production_farmproductionmodel?: ProductionFarmProductionModel[]
}

// ================= ANNOUNCEMENTS =================
export interface AnnouncementsAnnouncementModel {
  id: bigint
  title: string
  content: string
  status: string
  created_at: Date
  created_by_id: bigint
  farm_id: bigint
  expires_at?: Date | null

  // relations
  users_customuser?: UsersCustomUser
  farms_farmmodel?: FarmsFarmModel
}

// ================= FARM SESSIONS =================
export interface FarmSessionsFarmSessionModel {
  id: bigint
  name: string
  description?: string | null
  status: string
  start_time?: Date | null
  end_time?: Date | null
  created_at: Date
  farm_id: bigint

  farms_farmmodel?: FarmsFarmModel
}

// ================= FARM TRAYS =================
export interface FarmTraysFarmTrayModel {
  id: bigint
  name: string
  description?: string | null
  status: string
  created_at: Date
  farm_id: bigint

  farms_farmmodel?: FarmsFarmModel
  trays_sessiontraymodel?: TraysSessionTrayModel[]
}

// ================= TRAY SESSION =================
export interface TraysSessionTrayModel {
  id: bigint
  created_at: Date
  finished_at?: Date | null
  created_by_id: bigint
  tray_id: bigint

  users_customuser?: UsersCustomUser
  farm_trays_farmtraymodel?: FarmTraysFarmTrayModel
  trays_traystepmodel?: TraysTrayStepModel[]
}

// ================= TRAY STEPS =================
export interface TraysTrayStepModel {
  id: bigint
  title: string
  description?: string | null
  image?: string | null
  datetime: Date
  tray_id: bigint
  created_by_id: bigint
  detected?: number | null
  rejects?: number | null

  users_customuser?: UsersCustomUser
  trays_sessiontraymodel?: TraysSessionTrayModel
}

// ================= PRODUCTION =================
export interface ProductionFarmProductionModel {
  id: bigint
  title: string
  notes?: string | null
  satisfaction: number
  quantity: number
  total: number
  landing?: string | null
  created_at: Date
  farm_id: bigint

  farms_farmmodel?: FarmsFarmModel
}

// ================= FARM MEMBERS =================
export interface FarmsFarmModelMembers {
  id: bigint
  farmmodel_id: bigint
  customuser_id: bigint

  farms_farmmodel?: FarmsFarmModel
  users_customuser?: UsersCustomUser
}

// ================= FARM BLOCKED =================
export interface FarmsFarmModelBlocked {
  id: bigint
  farmmodel_id: bigint
  customuser_id: bigint

  farms_farmmodel?: FarmsFarmModel
  users_customuser?: UsersCustomUser
}

// ================= NOTIFICATIONS =================
export interface NotificationsNotification {
  id: bigint
  title: string
  type: string
  body: string
  data: unknown
  created_at: Date
  updated_at: Date

  notifications_recipient?: NotificationsRecipient[]
}

export interface NotificationsRecipient {
  id: bigint
  read: boolean
  read_at?: Date | null
  created_at: Date
  notification_id: bigint
  user_id: bigint

  notifications_notification?: NotificationsNotification
  users_customuser?: UsersCustomUser
}