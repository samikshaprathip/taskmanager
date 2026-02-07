import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, Filler)

function getLastNDays(n){
  const arr = []
  for(let i = n-1; i >= 0; i--){
    const d = new Date()
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() - i)
    arr.push(d)
  }
  return arr
}

export default function DailyActivityChart({ tasks = [], days = 14 }){
  // use completedAt if present, else fallback to createdAt for completed tasks
  const dates = getLastNDays(days)
  const labels = dates.map(d => d.toISOString())

  const counts = dates.map(d => {
    const start = new Date(d)
    const end = new Date(d)
    end.setDate(end.getDate()+1)
    return tasks.filter(t => {
      if(!t.completed) return false
      const when = t.completedAt ? new Date(t.completedAt) : (t.createdAt ? new Date(t.createdAt) : null)
      if(!when) return false
      return when >= start && when < end
    }).length
  })

  const data = {
    labels,
    datasets: [{
      label: 'Tasks completed',
      data: counts,
      fill: true,
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.15)'
    }]
  }

  const options = {
    scales: {
      x: { type: 'time', time: { unit: 'day', tooltipFormat: 'PP' } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  }

  return (
    <div className="bg-transparent shadow-none border-0 p-0">
      <h4 className="font-semibold mb-3" style={{ letterSpacing: '-0.01em' }}>Daily Activity</h4>
      <div style={{height: 180}}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
