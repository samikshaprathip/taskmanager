import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const TasksChart = ({ tasks = [] }) => {
  const total = tasks.length || 1
  const completed = tasks.filter(t => t.completed).length
  const active = tasks.filter(t => !t.completed).length

  const data = {
    labels: ['Active', 'Completed'],
    datasets: [{
      data: [active, completed],
      backgroundColor: ['#60a5fa', '#7c3aed'],
      hoverOffset: 6,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 10,
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} tasks`,
        }
      }
    },
    layout: {
      padding: 0,
    }
  }

  return (
    <div className="card">
      <h4 className="font-semibold mb-3">Tasks</h4>
      <div style={{ height: 260 }} className="flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      <div className="text-center text-sm text-gray-500 mt-3">{Math.round((completed / total) * 100)}%</div>
    </div>
  )
}

export default TasksChart
