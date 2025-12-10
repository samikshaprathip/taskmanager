import React from 'react'

const DayChip = ({ day, date, active }) => (
  <div className={`chip ${active ? 'active' : ''}`}>
    <div className="chip-day">{day}</div>
    <div className="chip-date">{date}</div>
  </div>
)

const CalendarStrip = ({ days = 7 }) => {
  const now = new Date()
  // produce an array for the current week starting today
  const arr = Array.from({length: days}).map((_,i)=>{
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    return d
  })

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div className="calendar-strip flex gap-3 mt-4">
      {arr.map((d, idx)=> (
        <DayChip key={idx} day={dayNames[d.getDay()]} date={d.getDate()} active={d.toDateString() === new Date().toDateString()} />
      ))}
    </div>
  )
}

export default CalendarStrip
