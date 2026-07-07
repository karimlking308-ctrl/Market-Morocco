import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { Order, Product } from '../types';
import { Sparkles, TrendingUp, BarChart3, CalendarDays, Award } from 'lucide-react';

interface SellerAnalyticsChartsProps {
  language: 'ar' | 'fr';
  orders: Order[];
  products: Product[];
  commissionPercent: number;
}

export default function SellerAnalyticsCharts({
  language,
  orders,
  products,
  commissionPercent
}: SellerAnalyticsChartsProps) {
  const isRtl = language === 'ar';

  // Toggle states
  const [salesTrendMode, setSalesTrendMode] = useState<'daily' | 'cumulative'>('daily');
  const [productMetric, setProductMetric] = useState<'revenue' | 'quantity'>('revenue');

  // Filter delivered orders
  const deliveredOrders = useMemo(() => {
    return orders.filter(o => o.status === 'delivered');
  }, [orders]);

  // Check if we need demonstration data
  const isDemoData = deliveredOrders.length === 0;

  // 1. Generate/Process Sales Growth Trends Data
  const salesTrendData = useMemo(() => {
    if (isDemoData) {
      // Demonstration Data (7 days back from 2026-07-07)
      const demoDays = [
        { date: '2026-07-01', gross: 400, net: 380, count: 1 },
        { date: '2026-07-02', gross: 950, net: 902, count: 2 },
        { date: '2026-07-03', gross: 600, net: 570, count: 1 },
        { date: '2026-07-04', gross: 1200, net: 1140, count: 3 },
        { date: '2026-07-05', gross: 850, net: 807, count: 2 },
        { date: '2026-07-06', gross: 1800, net: 1710, count: 4 },
        { date: '2026-07-07', gross: 2200, net: 2090, count: 5 }
      ];

      if (salesTrendMode === 'cumulative') {
        let cumGross = 0;
        let cumNet = 0;
        return demoDays.map(d => {
          cumGross += d.gross;
          cumNet += d.net;
          return {
            label: d.date,
            [language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes']: cumGross,
            [language === 'ar' ? 'صافي الأرباح' : 'Revenus Nets']: cumNet,
            gross: cumGross,
            net: cumNet
          };
        });
      } else {
        return demoDays.map(d => ({
          label: d.date,
          [language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes']: d.gross,
          [language === 'ar' ? 'صافي الأرباح' : 'Revenus Nets']: d.net,
          gross: d.gross,
          net: d.net
        }));
      }
    }

    // Process real delivered orders
    // Group by date
    const dailyGroups: { [date: string]: { gross: number; net: number } } = {};
    
    // Sort orders by date
    const sortedOrders = [...deliveredOrders].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedOrders.forEach(o => {
      const dateStr = o.createdAt.substring(0, 10);
      if (!dailyGroups[dateStr]) {
        dailyGroups[dateStr] = { gross: 0, net: 0 };
      }
      dailyGroups[dateStr].gross += o.total;
      dailyGroups[dateStr].net += (o.total - o.commissionFee);
    });

    const dates = Object.keys(dailyGroups).sort();
    
    // Fill in intermediate dates if there are gaps (simple version just renders active dates)
    const processedDays = dates.map(d => ({
      date: d,
      gross: dailyGroups[d].gross,
      net: dailyGroups[d].net
    }));

    if (salesTrendMode === 'cumulative') {
      let cumGross = 0;
      let cumNet = 0;
      return processedDays.map(d => {
        cumGross += d.gross;
        cumNet += d.net;
        return {
          label: d.date,
          [language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes']: cumGross,
          [language === 'ar' ? 'صافي الأرباح' : 'Revenus Nets']: cumNet,
          gross: cumGross,
          net: cumNet
        };
      });
    } else {
      return processedDays.map(d => ({
        label: d.date,
        [language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes']: d.gross,
        [language === 'ar' ? 'صافي الأرباح' : 'Revenus Nets']: d.net,
        gross: d.gross,
        net: d.net
      }));
    }
  }, [deliveredOrders, salesTrendMode, isDemoData, language]);


  // 2. Process Top-performing Products Data
  const topProductsData = useMemo(() => {
    if (isDemoData) {
      // Demonstration products data
      const demoProducts = [
        { name: language === 'ar' ? 'قفطان مغربي مطرز بالذهب' : 'Caftan Marocain Brodé', revenue: 4995, quantity: 5 },
        { name: language === 'ar' ? 'مصباح نحاسي أندلسي يدوي' : 'Lanterne Cuivre Andalous', revenue: 2392, quantity: 8 },
        { name: language === 'ar' ? 'زيت أركان التجميلي النقي 250مل' : 'Huile d Argan Pure 250ml', revenue: 1560, quantity: 12 },
        { name: language === 'ar' ? 'بلغة جلدية فاس كلاسيك' : 'Babouches Cuir Fès Classique', revenue: 1200, quantity: 6 },
        { name: language === 'ar' ? 'طاجين فخار سلاوي مزخرف' : 'Tajine Poterie Salé', revenue: 840, quantity: 7 }
      ];

      return demoProducts.map(p => ({
        name: p.name,
        value: productMetric === 'revenue' ? p.revenue : p.quantity,
        revenue: p.revenue,
        quantity: p.quantity,
        displayLabel: p.name.length > 25 ? `${p.name.substring(0, 22)}...` : p.name
      }));
    }

    // Process real product sales
    const productSales: { [productId: string]: { name: string; quantity: number; revenue: number } } = {};
    
    deliveredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += (item.price * item.quantity);
      });
    });

    const processed = Object.values(productSales).map(p => ({
      name: p.name,
      value: productMetric === 'revenue' ? p.revenue : p.quantity,
      revenue: p.revenue,
      quantity: p.quantity,
      displayLabel: p.name.length > 25 ? `${p.name.substring(0, 22)}...` : p.name
    }));

    return processed
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [deliveredOrders, productMetric, isDemoData, language]);


  // 3. Process Monthly Revenue Summaries
  const monthlyRevenueData = useMemo(() => {
    if (isDemoData) {
      // Demonstration monthly summary (last 4 months)
      return [
        {
          month: '2026-04',
          [language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes']: 4500,
          [language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets']: 4275,
          [language === 'ar' ? 'عمولة المنصة' : 'Commissions']: 225
        },
        {
          month: '2026-05',
          [language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes']: 7800,
          [language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets']: 7410,
          [language === 'ar' ? 'عمولة المنصة' : 'Commissions']: 390
        },
        {
          month: '2026-06',
          [language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes']: 9200,
          [language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets']: 8740,
          [language === 'ar' ? 'عمولة المنصة' : 'Commissions']: 460
        },
        {
          month: '2026-07',
          [language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes']: 12400,
          [language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets']: 11780,
          [language === 'ar' ? 'عمولة المنصة' : 'Commissions']: 620
        }
      ];
    }

    // Process real monthly summaries
    const monthlyGroups: { [month: string]: { gross: number; net: number; commission: number } } = {};
    
    deliveredOrders.forEach(o => {
      const monthKey = o.createdAt.substring(0, 7); // e.g. "2026-07"
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { gross: 0, net: 0, commission: 0 };
      }
      monthlyGroups[monthKey].gross += o.total;
      monthlyGroups[monthKey].commission += o.commissionFee;
      monthlyGroups[monthKey].net += (o.total - o.commissionFee);
    });

    const months = Object.keys(monthlyGroups).sort();
    return months.map(m => ({
      month: m,
      [language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes']: monthlyGroups[m].gross,
      [language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets']: monthlyGroups[m].net,
      [language === 'ar' ? 'عمولة المنصة' : 'Commissions']: monthlyGroups[m].commission
    }));
  }, [deliveredOrders, isDemoData, language]);

  // Color Palette Constants matching Morocco Red / Green theme
  const colors = {
    gross: '#3b82f6', // Bright Blue
    net: '#10b981', // Emerald Green
    commission: '#c1272d', // Morocco Red
    amber: '#f59e0b',
    purple: '#8b5cf6'
  };

  return (
    <div className="space-y-8" id="seller-charts-section">
      
      {/* Demo Data Header Indicator */}
      {isDemoData && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-400 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <p className="font-bold">
              {language === 'ar' 
                ? '📊 عرض البيانات التفاعلية التجريبية (لا توجد مبيعات حقيقية مستلمة بعد)' 
                : '📊 Mode démonstration actif (en attente de vos premières ventes livrées)'}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 font-black uppercase text-[9px]">
            Demo Mode
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sales Growth Trends */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'نمو المبيعات والأرباح' : 'Croissance des Ventes'}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {language === 'ar' ? 'متابعة وتيرة المداخيل الإجمالية والصافية' : 'Suivi du chiffre d affaires brut et net'}
                </p>
              </div>
            </div>

            {/* Toggle Modes */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-black self-end">
              <button
                onClick={() => setSalesTrendMode('daily')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  salesTrendMode === 'daily'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ar' ? 'يومي' : 'Quotidien'}
              </button>
              <button
                onClick={() => setSalesTrendMode('cumulative')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  salesTrendMode === 'cumulative'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ar' ? 'تراكمي' : 'Cumulé'}
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.gross} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={colors.gross} stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.net} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={colors.net} stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-slate-800" />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  dy={8}
                />
                <YAxis 
                  tickLine={false} 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  unit=" DH"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    direction: isRtl ? 'rtl' : 'ltr'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey={language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes'}
                  stroke={colors.gross}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey={language === 'ar' ? 'صافي الأرباح' : 'Revenus Nets'}
                  stroke={colors.net}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Performing Products */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Produits les Plus Vendus'}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {language === 'ar' ? 'ترتيب أفضل المنتجات حسب العوائد أو الوحدات المباعة' : 'Classement des meilleurs articles par rentabilité'}
                </p>
              </div>
            </div>

            {/* Toggle Metric */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-black self-end">
              <button
                onClick={() => setProductMetric('revenue')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  productMetric === 'revenue'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ar' ? 'حسب الأرباح' : 'Par Chiffre'}
              </button>
              <button
                onClick={() => setProductMetric('quantity')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  productMetric === 'quantity'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ar' ? 'حسب الكمية' : 'Par Quantité'}
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          {topProductsData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              {language === 'ar' ? 'لا توجد بيانات متاحة للمنتجات حالياً.' : 'Aucune donnée de produit disponible.'}
            </div>
          ) : (
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-gray-100 dark:stroke-slate-800" />
                  <XAxis 
                    type="number" 
                    tickLine={false} 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    unit={productMetric === 'revenue' ? ' DH' : ''}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="displayLabel" 
                    tickLine={false} 
                    stroke="#475569" 
                    fontSize={9} 
                    width={100}
                    orientation={isRtl ? 'right' : 'left'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [
                      productMetric === 'revenue' ? `${val} DH` : `${val} ${language === 'ar' ? 'وحدة' : 'unités'}`,
                      productMetric === 'revenue' ? (language === 'ar' ? 'المداخيل' : 'Chiffre d affaires') : (language === 'ar' ? 'الكمية المباعة' : 'Quantité vendue')
                    ]}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    barSize={16}
                  >
                    {topProductsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? colors.net : index === 1 ? colors.gross : index === 2 ? colors.amber : colors.purple} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Chart 3: Monthly Revenue Summary */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'التقرير الشهري المفصل للمبيعات' : 'Bilan Financier Mensuel'}
            </h4>
            <p className="text-[10px] text-gray-400">
              {language === 'ar' ? 'مقارنة العائد الإجمالي، الصافي القابل للسحب، ومبلغ عمولة المنصة المقتطع شهرياً' : 'Revenus bruts, nets et commissions prélevées'}
            </p>
          </div>
        </div>

        {/* Double Bar Chart */}
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyRevenueData}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-slate-800" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                stroke="#94a3b8" 
                fontSize={10} 
                dy={6}
              />
              <YAxis 
                tickLine={false} 
                stroke="#94a3b8" 
                fontSize={10} 
                unit=" DH"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              <Bar 
                dataKey={language === 'ar' ? 'المبيعات الإجمالية' : 'Ventes Brutes'} 
                fill={colors.gross} 
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey={language === 'ar' ? 'الأرباح الصافية' : 'Revenus Nets'} 
                fill={colors.net} 
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey={language === 'ar' ? 'عمولة المنصة' : 'Commissions'} 
                fill={colors.commission} 
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
