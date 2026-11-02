import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { TicketStatus } from '../types'
import { STATUS_META, STATUS_ORDER } from '../lib/constants'

interface StatusPieChartProps {
  pending: number
  processing: number
  done: number
  rejected: number
}

export function StatusPieChart({
  pending,
  processing,
  done,
  rejected,
}: StatusPieChartProps) {
  const total = pending + processing + done + rejected

  const option = useMemo<EChartsOption>(() => {
    const counts: Record<TicketStatus, number> = {
      pending,
      processing,
      done,
      rejected,
    }
    const data = STATUS_ORDER.map((status) => ({
      name: STATUS_META[status].label,
      value: counts[status],
      itemStyle: { color: STATUS_META[status].color },
    }))

    return {
      color: STATUS_ORDER.map((status) => STATUS_META[status].color),
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f172a',
        borderWidth: 0,
        padding: [10, 14],
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: '{b}<br/>{c} 单 · {d}%',
      },
      legend: {
        bottom: 2,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        textStyle: { color: '#64748b', fontSize: 12 },
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '34%',
          style: {
            text: String(total),
            fill: '#0f172a',
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '47%',
          style: {
            text: '工单总数',
            fill: '#94a3b8',
            fontSize: 12,
            textAlign: 'center',
          },
        },
      ],
      series: [
        {
          name: '工单状态',
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 4,
            borderRadius: 6,
          },
          label: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 6,
            label: { show: false },
            itemStyle: {
              shadowBlur: 18,
              shadowColor: 'rgba(15, 23, 42, 0.18)',
            },
          },
          data,
        },
      ],
    }
  }, [done, pending, processing, rejected, total])

  if (total === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[16px] border-slate-100">
          <span className="text-2xl font-bold text-slate-300">0</span>
        </div>
        <p className="mt-5 text-sm font-medium text-slate-500">暂无工单数据</p>
        <p className="mt-1 text-xs text-slate-400">
          生成示例数据后即可查看状态分布
        </p>
      </div>
    )
  }

  return (
    <PieCanvas
      option={option}
      label={`工单状态分布：待处理 ${pending} 单，处理中 ${processing} 单，已完成 ${done} 单，已驳回 ${rejected} 单`}
    />
  )
}

function PieCanvas({ option, label }: { option: EChartsOption; label: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<ReturnType<typeof echarts.init> | null>(null)

  useEffect(() => {
    const element = chartRef.current
    if (!element) return

    const chart = echarts.init(element)
    instanceRef.current = chart
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(element)

    return () => {
      observer.disconnect()
      chart.dispose()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    instanceRef.current?.setOption(option, true)
  }, [option])

  return (
    <div
      ref={chartRef}
      role="img"
      aria-label={label}
      className="h-[300px] w-full"
    />
  )
}
