import type { RepairTicket, TicketStatus } from '../types'
import { BUILDINGS, FAULT_TYPES } from './constants'
import { formatDateCompact } from './utils'

export function generateTicketNo(
  createdAt: string | Date,
  tickets: Array<Pick<RepairTicket, 'ticketNo'>>,
) {
  const prefix = `BX${formatDateCompact(createdAt)}`
  const used = new Set(tickets.map((ticket) => ticket.ticketNo))

  for (let serial = 1; serial <= 9999; serial += 1) {
    const ticketNo = `${prefix}${String(serial).padStart(4, '0')}`
    if (!used.has(ticketNo)) return ticketNo
  }

  throw new Error('当日工单号已用尽，请稍后再试')
}

const DEMO_NAMES = [
  '李明',
  '王小雨',
  '陈思远',
  '赵欣然',
  '周子航',
  '吴佳怡',
  '徐一鸣',
  '孙晓彤',
  '胡博文',
  '朱语晨',
]

const DEMO_DESCRIPTIONS: Record<string, string[]> = {
  水电: [
    '卫生间水龙头一直滴水，关紧后仍有明显漏水，希望尽快维修。',
    '宿舍插座突然没有电，插排和台灯都无法使用，请安排电工检查。',
    '洗手台下水管接口渗水，地面已经积水，需要尽快上门处理。',
  ],
  门窗: [
    '宿舍窗户把手松动，关窗后无法锁紧，晚上有漏风情况。',
    '房门合页异响且门体下垂，开关门比较困难，需要调整。',
    '阳台推拉门轨道卡顿，推到一半就推不动了，请帮忙检修。',
  ],
  网络: [
    '宿舍有线网络无法连接，重启路由后仍然没有网络信号。',
    '房间无线网络频繁掉线，影响线上课程，希望检查网络设备。',
    '墙上网口松动，网线插入后指示灯不亮，请安排检修。',
  ],
  家具: [
    '书桌抽屉滑轨损坏，抽屉无法正常推拉，需要更换配件。',
    '衣柜柜门脱落，目前只能斜靠在墙边，存在安全隐患。',
    '床梯有一处踏板松动，上下床不稳，请尽快加固。',
  ],
  空调: [
    '空调开启后只出风不制冷，遥控器显示正常，请安排检修。',
    '空调室内机运行时噪音很大，并且有轻微滴水现象。',
    '空调遥控器失灵，更换电池后仍无法控制，请协助排查。',
  ],
  其他: [
    '宿舍走廊公共照明灯不亮，夜间出行很不方便，请检修。',
    '阳台晾衣杆中间断裂，衣物无法正常晾晒，希望更换。',
    '宿舍门禁刷卡没有反应，需要多次尝试才能开门。',
  ],
}

const DEMO_ROOMS = ['101', '203', '305', '402', '506', 'B208', 'B312', 'A415']

const STATUS_PLAN: TicketStatus[] = [
  'pending',
  'pending',
  'processing',
  'done',
  'rejected',
  'pending',
  'done',
  'processing',
  'done',
  'pending',
  'rejected',
  'done',
  'processing',
  'done',
  'pending',
  'rejected',
  'done',
  'processing',
  'done',
  'rejected',
]

export function buildDemoTickets(
  existingTickets: RepairTicket[],
  adminName: string,
): RepairTicket[] {
  const generated: RepairTicket[] = []
  const now = new Date()

  STATUS_PLAN.forEach((status, index) => {
    const createdAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (index % 9) - 1,
      8 + ((index * 2) % 10),
      (index * 13) % 60,
    )
    const faultType = FAULT_TYPES[index % FAULT_TYPES.length]
    const descriptions = DEMO_DESCRIPTIONS[faultType]
    const description = descriptions[index % descriptions.length]
    const building = BUILDINGS[index % BUILDINGS.length]
    const room = DEMO_ROOMS[(index * 3) % DEMO_ROOMS.length]
    const baseTime = createdAt.getTime()
    const updatedAt = new Date(
      status === 'pending'
        ? baseTime
        : Math.min(baseTime + (3 + (index % 18)) * 60 * 60 * 1000, now.getTime()),
    ).toISOString()

    generated.push({
      ticketNo: generateTicketNo(createdAt, [...existingTickets, ...generated]),
      studentId: `demo-student-${String((index % 10) + 1).padStart(2, '0')}`,
      studentName: DEMO_NAMES[index % DEMO_NAMES.length],
      building,
      room,
      faultType,
      description,
      status,
      adminNote:
        status === 'done'
          ? '已安排维修人员上门处理，现场测试正常。'
          : status === 'rejected'
            ? '经核实，该问题不属于后勤维修范围，建议联系相关部门处理。'
            : status === 'processing'
              ? '维修人员已接单，正在准备配件并安排上门。'
              : '',
      handledBy: status === 'pending' ? '' : adminName,
      createdAt: createdAt.toISOString(),
      updatedAt,
    })
  })

  return generated
}
