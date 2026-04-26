const router = require('express').Router();

// GET dashboard statistics
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Run all aggregate queries in parallel
    const [
      [countRows],
      [revenueRows],
      [claimStatusRows],
      [planTypeRows],
      [topAgentRows],
      [recentClaimRows]
    ] = await Promise.all([
      // Total counts
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM Customer) AS total_customers,
          (SELECT COUNT(*) FROM Policy) AS total_policies,
          (SELECT COUNT(*) FROM Policy WHERE status = 'Active') AS active_policies,
          (SELECT COUNT(*) FROM Claim WHERE status = 'Pending') AS pending_claims,
          (SELECT COUNT(*) FROM Agent) AS total_agents
      `),
      // Total revenue
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM Payment`),
      // Claims by status
      pool.query(`
        SELECT status, COUNT(*) AS count, COALESCE(SUM(claim_amount), 0) AS total_amount
        FROM Claim GROUP BY status
      `),
      // Policies by plan type
      pool.query(`
        SELECT ip.plan_type, COUNT(*) AS count
        FROM Policy p JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
        GROUP BY ip.plan_type
      `),
      // Top agents by commission earned
      pool.query(`
        SELECT a.agent_id, a.name, a.commission AS commission_pct,
               COUNT(p.policy_id) AS policies_sold,
               COALESCE(SUM(ip.premium * a.commission / 100), 0) AS total_commission
        FROM Agent a
        LEFT JOIN Policy p ON a.agent_id = p.agent_id
        LEFT JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
        GROUP BY a.agent_id, a.name, a.commission
        ORDER BY total_commission DESC
        LIMIT 5
      `),
      // Recent claims
      pool.query(`
        SELECT cl.claim_id, c.name AS customer_name, ip.plan_name,
               cl.claim_amount, cl.claim_date, cl.status
        FROM Claim cl
        JOIN Policy p ON cl.policy_id = p.policy_id
        JOIN Customer c ON p.customer_id = c.customer_id
        JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
        ORDER BY cl.claim_date DESC LIMIT 5
      `)
    ]);

    res.json({
      counts: countRows[0],
      total_revenue: revenueRows[0].total_revenue,
      claims_by_status: claimStatusRows,
      policies_by_plan_type: planTypeRows,
      top_agents: topAgentRows,
      recent_claims: recentClaimRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
