<ResponsiveContainer width="80%" height="80%">
                <LineChart
                    width={500}
                    height={300}
                    data={masterStats.weeklyData}
                    margin={{
                        top: 25,
                        right: 25,
                        left: 25,
                        bottom: 25,
                    }}
                >
                    <CartesianGrid />
                    <XAxis dataKey="dateRange" dy={5} interval={0} angle={60} textAnchor="start" />
                    <YAxis allowDecimals={false} ticks={["","1","2","3","4","5","6","7","8","9","10","11","12"]} tickCount={13} />
                    <Tooltip />
                    <Line 
                        type="linear"
                        dataKey="H"
                        stroke="#82ca9d"
                        activeDot={{r:12}}
                        dot={{strokeWidth: 8}}
                    />
                </LineChart>
            </ResponsiveContainer>