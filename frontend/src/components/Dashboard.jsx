import React from 'react';
import {
    BarChart2, TrendingUp, AlertTriangle, PackagePlus, Info, Sliders, FileText, Activity
} from 'lucide-react';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import InsightsPanel from './InsightsPanel';
import RestockPanel from './RestockPanel';
import ProductSalesTable from './ProductSalesTable';

const Dashboard = ({ loading, forecastData, insightsData, recommendData, skus = [] }) => {
    const [demandLift, setDemandLift] = React.useState(0);
    const [simulatedLeadTime, setSimulatedLeadTime] = React.useState(7);

    React.useEffect(() => {
        if (recommendData) {
            setSimulatedLeadTime(recommendData.lead_time);
            setDemandLift(0);
        }
    }, [recommendData, forecastData]);

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

    const baseTotalForecastedDemand = forecastData.forecast.predictions.reduce((a, b) => a + b, 0);
    const totalForecastedDemand = Math.round(baseTotalForecastedDemand * (1 + demandLift / 100));
    const expectedRevenue = totalForecastedDemand * 45;

    const currentStock = recommendData.current_stock;
    const avgDailyDemand = (recommendData.lead_time_demand / recommendData.lead_time) * (1 + demandLift / 100);
    const stdDailyDemandTerm = recommendData.safety_stock / Math.sqrt(recommendData.lead_time || 7);

    const leadTimeDemand = avgDailyDemand * simulatedLeadTime;
    const safetyStock = stdDailyDemandTerm * Math.sqrt(simulatedLeadTime) * (1 + demandLift / 100);
    const reorderPoint = leadTimeDemand + safetyStock;

    let recommendedRestock = 0;
    if (currentStock < reorderPoint) {
        recommendedRestock = Math.round(reorderPoint - currentStock);
    }

    let stockoutRisk = 0.0;
    if (currentStock < leadTimeDemand) {
        stockoutRisk = 80.0 + Math.min((leadTimeDemand - currentStock) / leadTimeDemand * 20, 20);
    } else if (currentStock < reorderPoint) {
        stockoutRisk = 40.0;
    } else {
        stockoutRisk = Math.max(0, 10 - (currentStock - reorderPoint) / reorderPoint * 10);
    }
    stockoutRisk = Math.round(stockoutRisk * 10) / 10;

    const histDates = forecastData.historical.dates;
    const histVals = forecastData.historical.values;
    const futureDates = forecastData.forecast.dates;
    const futureVals = forecastData.forecast.predictions;
    const lowers = forecastData.forecast.lower_bound;
    const uppers = forecastData.forecast.upper_bound;

    const chartData = [];
    const anomalies = forecastData.anomalies || [];
    const anomalyMap = {};
    anomalies.forEach(a => { anomalyMap[a.date] = a; });

    const historyStartIdx = Math.max(0, histDates.length - 30);
    for (let i = historyStartIdx; i < histDates.length; i++) {
        chartData.push({
            date: histDates[i],
            historical: histVals[i],
            forecast: null,
            confidence: null,
            isAnomaly: !!anomalyMap[histDates[i]]
        });
    }

    // Future Forecast (next 30 days usually)
    for (let i = 0; i < futureDates.length; i++) {
        const adjustedVal = futureVals[i] * (1 + demandLift / 100);
        chartData.push({
            date: futureDates[i],
            historical: null,
            forecast: adjustedVal,
            confidence: [lowers[i] * (1 + demandLift / 100), uppers[i] * (1 + demandLift / 100)]
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
                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Total predicted unit sales for the next 30 days across all models">
                            Forecasted Demand (30d) <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <TrendingUp size={20} color="var(--text-main)" />
                    </div>
                    <div className="kpi-value">{totalForecastedDemand.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>units</span></div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Driven by <strong>{forecastData.best_model}</strong> model</div>
                </div>

                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Projected gross revenue based on ₹45 unit price proxy">
                            Expected Revenue <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <BarChart2 size={20} color="var(--text-main)" />
                    </div>
                    <div className="kpi-value">₹{expectedRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Estimated proxy (₹45/unit)</div>
                </div>

                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Statistical probability of running out of inventory before lead time">
                            Stockout Risk <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <AlertTriangle size={20} color={stockoutRisk > 30 ? "var(--danger)" : "var(--accent-primary)"} />
                    </div>
                    <div className="kpi-value" style={{ color: 'var(--text-main)' }}>{stockoutRisk}%</div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>For estimated lead time: {simulatedLeadTime} days</div>
                </div>

                <div className="glass kpi-card hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="kpi-title" title="Calculated replenishment order size to cover demand and safety margins">
                            Recommended Restock <Info size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.6 }} />
                        </span>
                        <PackagePlus size={20} color="var(--accent-primary)" />
                    </div>
                    <div className="kpi-value" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{recommendedRestock} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>units</span></span>
                        <button className="btn btn-outline hover-scale" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--border-subtle)' }} onClick={() => {
                            const poContent = `PURCHASE ORDER\n\nDate: ${new Date().toLocaleDateString()}\nSKU: ${forecastData.sku}\n\nQuantity to Order: ${recommendedRestock} units\nRequired Lead Time: ${simulatedLeadTime} days\n\nGenerated by InventraCloud`;
                            const element = document.createElement("a");
                            const file = new Blob([poContent], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = `PO_${forecastData.sku}.txt`;
                            document.body.appendChild(element);
                            element.click();
                        }}>
                            <FileText size={12} /> Generate PO
                        </button>
                    </div>
                    <div className="kpi-subtitle" style={{ marginTop: 'auto' }}>Calculated Safety Stock: {Math.round(safetyStock)} units</div>
                </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--bg-card)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <Sliders size={18} /> What-If Scenario Simulator
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>Expected Demand Lift</span>
                            <span style={{ fontWeight: 600, color: demandLift > 0 ? 'var(--success)' : demandLift < 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                                {demandLift > 0 ? '+' : ''}{demandLift}%
                            </span>
                        </label>
                        <input
                            type="range"
                            min="-50" max="100" step="5"
                            value={demandLift}
                            onChange={(e) => setDemandLift(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--text-main)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <span>Supplier Lead Time</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{simulatedLeadTime} Days</span>
                        </label>
                        <input
                            type="range"
                            min="1" max="45" step="1"
                            value={simulatedLeadTime}
                            onChange={(e) => setSimulatedLeadTime(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--text-main)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="glass chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                            Demand Forecast
                            <span style={{ fontSize: '0.8rem', background: 'rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-subtle)', padding: '4px 8px', borderRadius: '12px', color: 'var(--text-main)' }}>
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
                                    <stop offset="5%" stopColor="var(--text-main)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--text-main)" stopOpacity={0} />
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
                            <Area type="monotone" dataKey="confidence" stroke="none" fill="rgba(0,0,0,0.05)" name="95% Confidence" />
                            <Line type="monotone" dataKey="historical" stroke="#ef4444" strokeWidth={2} dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (payload.isAnomaly) {
                                    return <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={5} fill="var(--warning)" stroke="#fff" strokeWidth={2} />;
                                }
                                return <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={3} fill="#fff" strokeWidth={2} stroke="#ef4444" />;
                            }} name="Historical Sales" />
                            <Line type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} name="Predicted Demand" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'var(--text-main)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>AI Copilot</span> Actionable Intelligence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

                    {/* Product Recommendations Table (moved up) */}
                    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
                        <ProductSalesTable />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <RestockPanel recommendData={recommendData} />
                        <InsightsPanel insightsData={insightsData} />
                    </div>
                </div>

                {/* Portfolio Health Summary feature (moved down) */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                            <Activity size={18} color="var(--text-main)" /> Portfolio Health Overview
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: 'auto', marginBottom: 'auto', width: '100%', maxWidth: '900px' }}>
                            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444' }}>{skus.filter(s => s.status === 'Stockout').length || 0}</div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Critical Stockouts</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#eab308' }}>{skus.filter(s => s.status === 'Low Stock').length || 0}</div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Low Inventory</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#22c55e' }}>{skus.filter(s => s.status === 'Healthy').length || 0}</div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Healthy SKUs</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px dashed var(--border-subtle)', width: '100%' }}>
                            Based on your global {skus.length} SKU portfolio
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
