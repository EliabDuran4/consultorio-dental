const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));
// Configuración conexión PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente 🚀');
});

// Ruta para ver pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener pacientes');
    }
});

app.post('/pacientes', async (req, res) => {
    const { nombre, telefono, email } = req.body;

    try {
        await pool.query(
            'INSERT INTO pacientes (nombre, telefono, email) VALUES ($1, $2, $3)',
            [nombre, telefono, email]
        );
        res.send('Paciente registrado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar paciente');
    }
});

app.get('/citas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT citas.id, pacientes.nombre, citas.fecha, citas.hora, citas.motivo, citas.estado
            FROM citas
            JOIN pacientes ON citas.paciente_id = pacientes.id
            ORDER BY citas.fecha, citas.hora
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener citas');
    }
});

app.post('/citas', async (req, res) => {
    const { paciente_id, fecha, hora, motivo } = req.body;

    try {
        await pool.query(
            'INSERT INTO citas (paciente_id, fecha, hora, motivo) VALUES ($1, $2, $3, $4)',
            [paciente_id, fecha, hora, motivo]
        );

        res.send('Cita registrada');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar cita');
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});