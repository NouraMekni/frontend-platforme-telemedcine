import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  {name: 'Jan', patients: 40},
  {name: 'Feb', patients: 45},
  {name: 'Mar', patients: 50},
  {name: 'Apr', patients: 60},
  {name: 'May', patients: 70},
]

export default function StatsCard({ title='Patients' }){
  return (
    <div className="card">
      <h4 className="font-medium mb-2">{title}</h4>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="patients" stroke="#06b6d4" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
