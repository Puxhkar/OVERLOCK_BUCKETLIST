import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const mockProducts = [
    {
        id: 1,
        name: "Sleeved cardigan",
        category: "Outerwear",
        image: "/images/cardigan_1772393800302.png",
        stock: 18,
        price: "₹55.00",
        profitMargin: "45%",
        sales30d: 294,
        recommendation: "Increase Stock",
        action: "+150 units",
        status: "success"
    },
    {
        id: 2,
        name: "Womens' sweatshirt",
        category: "Activewear",
        image: "/images/sweatshirt_1772393813742.png",
        stock: 5,
        price: "₹45.00",
        profitMargin: "40%",
        sales30d: 412,
        recommendation: "Urgent Restock",
        action: "+200 units",
        status: "success"
    },
    {
        id: 3,
        name: "Relaxed fit linen shorts",
        category: "Bottoms",
        image: "/images/shorts_1772393834173.png",
        stock: 328,
        price: "₹35.00",
        profitMargin: "15%",
        sales30d: 12,
        recommendation: "Decrease Stock",
        action: "Clearance Sale",
        status: "danger"
    },
    {
        id: 4,
        name: "Basic cotton t-shirt",
        category: "Tops",
        image: "/images/tshirt_1772393850096.png",
        stock: 145,
        price: "₹20.00",
        profitMargin: "25%",
        sales30d: 150,
        recommendation: "Maintain",
        action: "No Action",
        status: "neutral"
    },
    {
        id: 5,
        name: "Classic Denim Jacket",
        category: "Outerwear",
        image: "/images/denim_1772393870070.png",
        stock: 12,
        price: "₹85.00",
        profitMargin: "50%",
        sales30d: 89,
        recommendation: "Increase Stock",
        action: "+50 units",
        status: "success"
    }
];

const ProductSalesTable = () => {
    return (
        <div className="glass chart-container" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>Inventory Recommendations (Cross-SKU)</h3>
                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View All</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>Item</th>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>Current Stock</th>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>Unit Price</th>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>Profit Margin</th>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>30d Sales</th>
                            <th style={{ padding: '1rem 0', fontWeight: 500 }}>AI Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockProducts.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover-scale-row">
                                <td style={{ padding: '1rem 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                product.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 0', color: product.stock < 20 ? 'var(--danger)' : 'var(--text-main)', fontWeight: product.stock < 20 ? 600 : 400 }}>
                                    {product.stock}
                                </td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{product.price}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{product.profitMargin}</td>
                                <td style={{ padding: '1rem 0', fontWeight: 500 }}>{product.sales30d}</td>
                                <td style={{ padding: '1rem 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {product.status === 'success' && <ArrowUpRight size={16} color="var(--success)" />}
                                        {product.status === 'danger' && <ArrowDownRight size={16} color="var(--danger)" />}
                                        {product.status === 'neutral' && <Minus size={16} color="var(--text-muted)" />}

                                        <div>
                                            <div style={{
                                                fontWeight: 600,
                                                color: product.status === 'success' ? 'var(--success)' :
                                                    (product.status === 'danger' ? 'var(--danger)' : 'var(--text-muted)')
                                            }}>
                                                {product.recommendation}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.action}</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductSalesTable;
