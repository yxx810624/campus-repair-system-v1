export type Role = 'student' | 'admin'

export type TicketStatus = 'pending' | 'processing' | 'done' | 'rejected'

export interface RepairUser {
  id: string
  username: string
  password: string
  role: Role
  createdAt: string
}

export interface RepairTicket {
  ticketNo: string
  studentId: string
  studentName: string
  building: string
  room: string
  faultType: string
  description: string
  status: TicketStatus
  adminNote: string
  handledBy: string
  createdAt: string
  updatedAt: string
}

export interface RepairSession {
  userId: string
  username: string
  role: Role
}
