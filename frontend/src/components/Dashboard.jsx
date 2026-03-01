import React from 'react';
import {
    BarChart2, TrendingUp, AlertTriangle, PackagePlus, Info
} from 'lucide-react';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import InsightsPanel from './InsightsPanel';
import RestockPanel from './RestockPanel';
import ProductSalesTable from './ProductSalesTable';

const Dashboard = ({ loading, forecastData, insightsData, recommendData }) => {

    if (loading) {
        return (
            <div className="dashboard-grid has-sidebar">
                <div className="glass" style={{ padding: '2rem', minHeight: '400px' }}>
                    <div className="skeleton" style={{ height: '30px', width: '200px', marginBottom: '20px' }}></div>
                    <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
                </div>
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="skeleton" style={{ height: '30px', width: '150px' }}></div>
                    <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
                    <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
                </div>
            </div>
        );
    }

    if (!forecastData || !recommendData) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>No data available for the selected SKU.</div>;
    }

    // Calculate Expected Revenue (Assume average unit price = $45 for demo purposes)
    const totalForecastedDemand = forecastData.forecast.predictions.reduce((a, b) => a + b, 0);
    const expectedRevenue = totalForecastedDemand * 45;

    // Combine historical and forecast data for chart
    const histDates = forecastData.historical.dates;
    const histVals = forecastData.historical.values;
    const futureDates = forecastData.forecast.dates;
    const futureVals = forecastData.forecast.predictions;
    const lowers = forecastData.forecast.lower_bound;
    const uppers = forecastData.forecast.upper_bound;

    const chartData = [];
    const decompData = [];

    // Show last 30 days of history
    const historyStartIdx = Math.max(0, histDates.length - 30);
    for (let i = historyStartIdx; i < histDates.length; i++) {
        chartData.push({
            date: histDates[i],
            historical: histVals[i],
            forecast: null,
            confidence: null,
        });
    }

    // Decomposition Data
    const trend = forecastData.decomposition?.trend || [];
    const seasonality = forecastData.decomposition?.seasonality || [];
    const residual = forecastData.decomposition?.residual || [];

    for (let i = 0; i < histDates.length; i++) {
        if (i >= histDates.length - 60) { // Limit to 60 days
            decompData.push({
                date: histDates[i],
                trend: trend[i],
                seasonality: seasonality[i],
                residual: residual[i]
            });
        }
    }

    // Future Forecast (next 30 days usually)
    for (let i = 0; i < futureDates.length; i++) {
        chartData.push({
            date: futureDates[i],
            historical: null,
            forecast: futureVals[i],
            confidence: [lowers[i], uppers[i]]
        });
    }

    // To connect the line smoothly, we can add the last historical point to forecast
    if (chartData.length > 0 && histVals.length > 0) {
        const lastHistIdx = histDates.length - 1;
        const matchingIdx = chartData.findIndex(d => d.date === histDates[lastHistIdx]);
        if (matchingIdx !== -1) {
            chartData[matchingIdx].forecast = histVals[lastHistIdx];
            chartData[matchingIdx].confidence = [histVals[lastHistIdx], histVals[lastHistIdx]];
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="kpi-grid">
                <div className="glass kpi-card hover-scale dark-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Total predicted unit sales for the next 30 days across all models">
                            Forecasted Demand (30d) <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <TrendingUp size={20} color="var(--success)" />
                    </div>
                    <div className="kpi-value">{totalForecastedDemand.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>units</span></div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Driven by <strong>{forecastData.best_model}</strong> model</div>
                </div>

                <div className="glass kpi-card hover-scale gradient-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Projected gross revenue based on $45 unit price proxy">
                            Expected Revenue <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <BarChart2 size={20} color="rgba(255,255,255,0.8)" />
                    </div>
                    <div className="kpi-value">${expectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Estimated proxy ($45/unit)</div>
                </div>

                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Statistical probability of running out of inventory before lead time">
                            Stockout Risk <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <AlertTriangle size={20} color={recommendData.stockout_risk_pct > 30 ? "var(--danger)" : "var(--accent-primary)"} />
                    </div>
                    <div className="kpi-value" style={{ color: 'var(--text-main)' }}>{recommendData.stockout_risk_pct}%</div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>For estimated lead time: {recommendData.lead_time} days</div>
                </div>

                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Calculated replenishment order size to cover demand and safety margins">
                            Recommended Restock <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <PackagePlus size={20} color="var(--accent-primary)" />
                    </div>
                    <div className="kpi-value" style={{ color: 'var(--text-main)' }}>{recommendData.recommended_restock} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>units</span></div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Calculated Safety Stock: {recommendData.safety_stock} units</div>
                </div>
            </div>

            <div className="dashboard-grid has-sidebar">
                <div className="glass chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                            Demand Forecast
                            <span style={{ fontSize: '0.8rem', background: 'rgba(124, 58, 237, 0.1)', padding: '4px 8px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                                {forecastData.best_model} (RMSE: {forecastData.rmse.toFixed(2)})
                            </span>
                        </h3>
                        <button
                            className="btn btn-primary hover-scale"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => {
                                const rows = [
                                    ["Date", "Historical_Sales", "Forecast", "Lower_Bound", "Upper_Bound"]
                                ];
                                chartData.forEach(d => {
                                    rows.push([d.date, d.historical || '', d.forecast || '', (d.confidence ? d.confidence[0] : ''), (d.confidence ? d.confidence[1] : '')]);
                                });
                                const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", `forecast_${forecastData.sku}.csv`);
                                document.body.appendChild(link);
                                link.click();
                            }}
                        >
                            Export CSV
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted)"
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                tickFormatter={(val) => val.substring(5)}
                                minTickGap={20}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}
                                itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                                labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="confidence" stroke="none" fill="rgba(124, 58, 237, 0.1)" name="95% Confidence" />
                            <Line type="monotone" dataKey="historical" stroke="var(--text-muted)" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} name="Historical Sales" />
                            <Line type="monotone" dataKey="forecast" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} name="Predicted Demand" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {decompData.length > 0 && (
                    <div className="glass chart-container" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Seasonal Decomposition</h3>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Trend</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <ComposedChart data={decompData}>
                                        <Line type="monotone" dataKey="trend" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
                                        <XAxis dataKey="date" hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: '1 1 300px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Seasonality</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <ComposedChart data={decompData}>
                                        <Line type="monotone" dataKey="seasonality" stroke="var(--accent-secondary)" strokeWidth={2} dot={false} />
                                        <XAxis dataKey="date" hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: '1 1 300px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Residual</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <ComposedChart data={decompData}>
                                        <Line type="monotone" dataKey="residual" stroke="var(--danger)" strokeWidth={2} dot={false} />
                                        <XAxis dataKey="date" hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <InsightsPanel insightsData={insightsData} />
                    <RestockPanel recommendData={recommendData} />
                </div>
            </div>

            {/* Product Recommendations Table */}
            <div style={{ marginTop: '1.5rem' }}>
                <ProductSalesTable />
            </div>
        </div>
    );
};

export default Dashboard;
