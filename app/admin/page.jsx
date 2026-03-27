'use client';
import { useEffect, useState } from 'react';

const ADMIN_KEY = 'artifyai-admin-2025';

const STATUS_COLORS = {
  pending:                 'bg-yellow-100 text-yellow-700',
  paid:                    'bg-green-100 text-green-700',
  fulfilling:              'bg-blue-100 text-blue-700',
  shipped:                 'bg-purple-100 text-purple-700',
  returned:                'bg-gray-100 text-gray-600',
  failed:                  'bg-red-100 text-red-700',
  paid_fulfillment_failed: 'bg-orange-100 text-orange-700',
};

const STATUS_OPTIONS = ['pending','paid','fulfilling','shipped','returned','failed','paid_fulfillment_failed'];

export default function AdminPage() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('orders');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing]     = useState(null); // order being edited
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-key': ADMIN_KEY } });
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  async function saveOrder() {
    setSaving(true);
    await fetch('/api/admin/order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify({ orderId: editing, ...editFields }),
    });
    setSaving(false);
    setEditing(null);
    fetchData();
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, orders, revenueByDay, themeCounts, productCounts } = data;

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search) ||
      o.printfulId?.includes(search);
    return matchStatus && matchSearch;
  });

  const topThemes = Object.entries(themeCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const topProducts = Object.entries(productCounts).sort((a,b) => b[1]-a[1]);
  const revenueEntries = Object.entries(revenueByDay).sort((a,b) => a[0].localeCompare(b[0])).slice(-14);
  const maxRevenue = Math.max(...revenueEntries.map(([,v]) => v), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h1 className="font-bold text-lg">Maîtrepets Admin</h1>
            <p className="text-gray-400 text-xs">Operations Dashboard</p>
          </div>
        </div>
        <button onClick={fetchData} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
          ↻ Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            { label: 'Total Revenue',  value: `$${stats.totalRevenue.toFixed(2)}`, color: 'text-green-400', icon: '💰' },
            { label: 'Total Orders',   value: stats.totalOrders,   color: 'text-white',      icon: '📦' },
            { label: 'Paid Orders',    value: stats.paidOrders,    color: 'text-green-400',  icon: '✅' },
            { label: 'Printing',       value: stats.fulfillingOrders, color: 'text-blue-400', icon: '🖨️' },
            { label: 'Shipped',        value: stats.shippedOrders, color: 'text-purple-400', icon: '🚚' },
            { label: 'Errors',         value: stats.failedOrders,  color: 'text-red-400',    icon: '⚠️' },
            { label: 'Users',          value: stats.users,         color: 'text-yellow-400', icon: '👤' },
            { label: 'Posters Made',   value: stats.images,        color: 'text-pink-400',   icon: '🎨' },
          ].map((k) => (
            <div key={k.label} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
              <p className="text-lg mb-1">{k.icon}</p>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-gray-500 text-xs mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">

          {/* Revenue chart */}
          <div className="md:col-span-2 bg-gray-900 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-sm text-gray-400 mb-4">REVENUE — LAST 14 DAYS</h3>
            {revenueEntries.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No revenue data yet</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {revenueEntries.map(([day, val]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-purple-600 hover:bg-purple-500 rounded-sm transition-all cursor-pointer"
                        style={{ height: `${Math.max((val / maxRevenue) * 112, 4)}px` }}
                        title={`$${val.toFixed(2)}`}
                      />
                    </div>
                    <p className="text-gray-600 text-xs rotate-45 origin-left whitespace-nowrap" style={{fontSize:'9px'}}>
                      {day.slice(5)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme breakdown */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-sm text-gray-400 mb-4">TOP THEMES</h3>
            <div className="space-y-2">
              {topThemes.length === 0 ? <p className="text-gray-600 text-sm">No data yet</p> :
                topThemes.map(([theme, count]) => (
                  <div key={theme} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-300 capitalize">{theme}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(count / topThemes[0][1]) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            <h3 className="font-semibold text-sm text-gray-400 mt-5 mb-3">PRODUCTS</h3>
            <div className="space-y-1">
              {topProducts.map(([product, count]) => (
                <div key={product} className="flex justify-between text-xs">
                  <span className="text-gray-400 capitalize">{product?.replace(/-/g,' ')}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-xl w-fit">
          {['orders', 'users'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                type="text"
                placeholder="Search by email, name, order ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 w-72"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-gray-500 text-sm self-center">{filteredOrders.length} orders</span>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Poster</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Printful ID</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-600 py-12">No orders found</td></tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        {order.image?.generatedUrl
                          ? <img src={order.image.generatedUrl} alt="" className="w-12 h-16 object-cover rounded-lg" />
                          : <div className="w-12 h-16 bg-white/5 rounded-lg flex items-center justify-center text-gray-600 text-xs">—</div>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{order.user?.name || '—'}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                        {order.shippingCity && <p className="text-gray-600 text-xs">{order.shippingCity}, {order.shippingCountry}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{order.productType?.replace(/-/g,' ')}</td>
                      <td className="px-4 py-3 font-semibold text-green-400">${order.price?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{order.printfulId || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setEditing(order.id); setEditFields({ status: order.status, trackingNumber: order.trackingNumber || '', trackingUrl: order.trackingUrl || '' }); }}
                          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Orders</th>
                  <th className="text-left px-4 py-3">Spent</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(orders.reduce((acc, o) => {
                  const key = o.user?.email;
                  if (!key) return acc;
                  if (!acc[key]) acc[key] = { ...o.user, orders: 0, spent: 0 };
                  acc[key].orders++;
                  if (['paid','fulfilling','shipped'].includes(o.status)) acc[key].spent += o.price;
                  return acc;
                }, {})).sort((a,b) => b.spent - a.spent).map((u) => (
                  <tr key={u.email} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.orders}</td>
                    <td className="px-4 py-3 font-semibold text-green-400">${u.spent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Edit Order</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select
                  value={editFields.status}
                  onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tracking Number</label>
                <input
                  type="text"
                  value={editFields.trackingNumber}
                  onChange={e => setEditFields(f => ({ ...f, trackingNumber: e.target.value }))}
                  placeholder="e.g. 1Z999AA10123456784"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tracking URL</label>
                <input
                  type="text"
                  value={editFields.trackingUrl}
                  onChange={e => setEditFields(f => ({ ...f, trackingUrl: e.target.value }))}
                  placeholder="https://tools.usps.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveOrder} disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
