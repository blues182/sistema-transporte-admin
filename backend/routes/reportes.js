const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Reporte semanal
router.get('/semanal', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Viajes completados
    const [viajes] = await db.query(
      `SELECT COUNT(*) as total_viajes, SUM(monto_cobrado) as ingresos_totales
       FROM viajes
       WHERE fecha_salida BETWEEN ? AND ?
       AND estado = 'completado'`,
      [fecha_inicio, fecha_fin]
    );

    // Gastos totales
    const [gastos] = await db.query(
      `SELECT SUM(gv.monto) as gastos_totales
       FROM gastos_viaje gv
       JOIN viajes v ON gv.viaje_id = v.id
       WHERE v.fecha_salida BETWEEN ? AND ?`,
      [fecha_inicio, fecha_fin]
    );

    // Mantenimientos
    const [mantenimientos] = await db.query(
      `SELECT COUNT(*) as total_mantenimientos, 
              SUM(costo_mano_obra) as costo_mano_obra
       FROM mantenimiento
       WHERE fecha BETWEEN ? AND ?`,
      [fecha_inicio, fecha_fin]
    );

    const ingresos = parseFloat(viajes[0].ingresos_totales || 0);
    const gastos_totales = parseFloat(gastos[0].gastos_totales || 0);
    const costo_mantenimiento = parseFloat(mantenimientos[0].costo_mano_obra || 0);
    const utilidad = ingresos - gastos_totales - costo_mantenimiento;

    res.json({
      periodo: { fecha_inicio, fecha_fin },
      viajes: {
        total: viajes[0].total_viajes,
        ingresos: ingresos
      },
      gastos: gastos_totales,
      mantenimiento: {
        total: mantenimientos[0].total_mantenimientos,
        costo: costo_mantenimiento
      },
      utilidad,
      margen: ingresos > 0 ? ((utilidad / ingresos) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte mensual
router.get('/mensual', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const fecha_inicio = `${anio}-${mes.padStart(2, '0')}-01`;
    const fecha_fin = `${anio}-${mes.padStart(2, '0')}-31`;

    // Viajes por semana
    const [viajes_semanales] = await db.query(
      `SELECT 
        WEEK(fecha_salida) as semana,
        COUNT(*) as total_viajes,
        SUM(monto_cobrado) as ingresos
       FROM viajes
       WHERE YEAR(fecha_salida) = ? AND MONTH(fecha_salida) = ?
       AND estado = 'completado'
       GROUP BY WEEK(fecha_salida)`,
      [anio, mes]
    );

    // Gastos por tipo
    const [gastos_por_tipo] = await db.query(
      `SELECT 
        gv.tipo_gasto,
        SUM(gv.monto) as total
       FROM gastos_viaje gv
       JOIN viajes v ON gv.viaje_id = v.id
       WHERE v.fecha_salida BETWEEN ? AND ?
       GROUP BY gv.tipo_gasto`,
      [fecha_inicio, fecha_fin]
    );

    // Clientes más activos
    const [top_clientes] = await db.query(
      `SELECT 
        cl.nombre,
        COUNT(v.id) as total_viajes,
        SUM(v.monto_cobrado) as total_facturado
       FROM viajes v
       JOIN clientes cl ON v.cliente_id = cl.id
       WHERE v.fecha_salida BETWEEN ? AND ?
       GROUP BY cl.id
       ORDER BY total_facturado DESC
       LIMIT 5`,
      [fecha_inicio, fecha_fin]
    );

    // Trailers más utilizados
    const [top_trailers] = await db.query(
      `SELECT 
        t.numero_economico,
        COUNT(v.id) as total_viajes,
        SUM(v.monto_cobrado) as ingresos_generados
       FROM viajes v
       JOIN trailers t ON v.trailer_id = t.id
       WHERE v.fecha_salida BETWEEN ? AND ?
       GROUP BY t.id
       ORDER BY total_viajes DESC`,
      [fecha_inicio, fecha_fin]
    );

    res.json({
      periodo: { mes, anio },
      viajes_semanales,
      gastos_por_tipo,
      top_clientes,
      top_trailers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte de utilidad por viaje
router.get('/utilidad-viajes', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const [resultado] = await db.query(
      `SELECT 
        v.id,
        v.folio,
        v.fecha_salida,
        v.origen,
        v.destino,
        cl.nombre as cliente,
        t.numero_economico,
        v.monto_cobrado,
        COALESCE(SUM(gv.monto), 0) as total_gastos,
        (v.monto_cobrado - COALESCE(SUM(gv.monto), 0)) as utilidad,
        ((v.monto_cobrado - COALESCE(SUM(gv.monto), 0)) / v.monto_cobrado * 100) as margen_porcentaje
       FROM viajes v
       JOIN clientes cl ON v.cliente_id = cl.id
       JOIN trailers t ON v.trailer_id = t.id
       LEFT JOIN gastos_viaje gv ON v.id = gv.viaje_id
       WHERE v.fecha_salida BETWEEN ? AND ?
       AND v.estado = 'completado'
       GROUP BY v.id
       ORDER BY v.fecha_salida DESC`,
      [fecha_inicio, fecha_fin]
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard - Resumen general
router.get('/dashboard', async (req, res) => {
  try {
    // Viajes activos
    const [viajes_activos] = await db.query(
      `SELECT COUNT(*) as total FROM viajes WHERE estado IN ('programado', 'en_ruta')`
    );

    // Trailers en mantenimiento
    const [trailers_mantenimiento] = await db.query(
      `SELECT COUNT(*) as total FROM trailers WHERE estado = 'mantenimiento'`
    );

    // Refacciones con stock bajo
    const [refacciones_bajo] = await db.query(
      `SELECT COUNT(*) as total FROM refacciones WHERE stock_actual <= stock_minimo`
    );

    // Ingresos del mes actual
    const [ingresos_mes] = await db.query(
      `SELECT SUM(monto_cobrado) as total
       FROM viajes
       WHERE MONTH(fecha_salida) = MONTH(CURRENT_DATE())
       AND YEAR(fecha_salida) = YEAR(CURRENT_DATE())
       AND estado = 'completado'`
    );

    // Gastos del mes actual
    const [gastos_mes] = await db.query(
      `SELECT SUM(gv.monto) as total
       FROM gastos_viaje gv
       JOIN viajes v ON gv.viaje_id = v.id
       WHERE MONTH(v.fecha_salida) = MONTH(CURRENT_DATE())
       AND YEAR(v.fecha_salida) = YEAR(CURRENT_DATE())`
    );

    const ingresos = parseFloat(ingresos_mes[0].total || 0);
    const gastos = parseFloat(gastos_mes[0].total || 0);

    res.json({
      viajes_activos: viajes_activos[0].total,
      trailers_mantenimiento: trailers_mantenimiento[0].total,
      refacciones_bajo_stock: refacciones_bajo[0].total,
      mes_actual: {
        ingresos,
        gastos,
        utilidad: ingresos - gastos
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
