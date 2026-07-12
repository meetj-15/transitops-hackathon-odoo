import pool from "../../config/db.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. KPI Counts
    const tripsRes = await pool.query("SELECT COUNT(*) as active_trips FROM trips WHERE status = 'Dispatched'");
    const vehiclesRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Available') as available_vehicles,
        COUNT(*) FILTER (WHERE status = 'In Shop') as shop_vehicles,
        COUNT(*) as total_vehicles
      FROM vehicles
    `);
    
    const revRes = await pool.query("SELECT COALESCE(SUM(revenue), 0) as total_revenue FROM trips WHERE status = 'Completed'");
    const expRes = await pool.query("SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses");

    const totalRevenue = Number(revRes.rows[0].total_revenue);
    const totalExpenses = Number(expRes.rows[0].total_expenses);
    const netProfit = totalRevenue - totalExpenses;

    // 2. Vehicle ROI Analysis
    const roiRes = await pool.query(`
      SELECT 
        v.id, v.registration_no, v.vehicle_name, v.acquisition_cost,
        COALESCE(SUM(t.revenue), 0) as generated_revenue,
        COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.vehicle_id = v.id), 0) as operational_costs
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
      GROUP BY v.id
    `);

    const vehicleROI = roiRes.rows.map(v => {
      const cost = Number(v.acquisition_cost);
      const rev = Number(v.generated_revenue);
      const ops = Number(v.operational_costs);
      const profit = rev - ops;
      const roi = cost > 0 ? ((profit / cost) * 100).toFixed(2) : 0;
      return { 
        ...v, 
        net_profit: profit,
        roi_percentage: `${roi}%` 
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          active_trips: Number(tripsRes.rows[0].active_trips),
          available_vehicles: Number(vehiclesRes.rows[0].available_vehicles),
          in_shop_vehicles: Number(vehiclesRes.rows[0].shop_vehicles),
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_profit: netProfit
        },
        vehicle_roi: vehicleROI
      }
    });
  } catch (error) { next(error); }
};