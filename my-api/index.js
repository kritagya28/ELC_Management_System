const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Os2644962.@", // Check your password
  database: "elc_system",
  port: 3306,
});

// --- HELPER: Fix Date Format for MySQL ---
const formatDateForMySQL = (isoDate) => {
  return new Date(isoDate).toISOString().slice(0, 19).replace("T", " ");
};

// --- HELPER: Create Notification ---
async function createNotification(recipientEmail, message) {
  if (!recipientEmail) return;
  try {
    console.log(`[NOTIFICATION] Sending to ${recipientEmail}: "${message}"`);
    await pool.query(
      "INSERT INTO notifications (recipient_email, message) VALUES (?, ?)",
      [recipientEmail, message]
    );
  } catch (err) {
    console.error("Notification Error:", err);
  }
}

// --- ROUTES ---

// 1. Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    if (rows.length > 0) {
      const user = rows[0];
      delete user.password;
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 2. Get Activities
app.get("/activities", async (req, res) => {
  try {
    const query = `
      SELECT activities.*, users.name AS teacher_name 
      FROM activities 
      LEFT JOIN users ON activities.teacher_email = users.email 
      ORDER BY activities.id DESC
    `;
    const [activities] = await pool.query(query);
    const [attendance] = await pool.query("SELECT * FROM activity_attendance");

    const results = activities.map((activity) => {
      const students = attendance
        .filter((a) => a.activity_id === activity.id)
        .map((a) => a.student_email);

      return {
        ...activity,
        teacher_name: activity.teacher_name || "Unknown Teacher",
        attendance: students,
      };
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3. Get Venues
app.get("/venues", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM venues");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Templates
app.get("/templates", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activity_templates");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Notifications
app.get("/notifications", async (req, res) => {
  const { email } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE recipient_email = ? ORDER BY created_at DESC",
      [email]
    );
    const formatted = rows.map((n) => ({
      ...n,
      read: !!n.is_read,
      timestamp: n.created_at,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Create Activity
app.post("/activities", async (req, res) => {
  try {
    const {
      title,
      teacher_email,
      venue,
      time,
      description,
      material_request,
      software_requirements,
    } = req.body;
    const mysqlTime = formatDateForMySQL(time);

    const sql = `INSERT INTO activities (title, teacher_email, venue, time, description, material_request, software_requirements, status, materials_arranged) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending HOD', 0)`;
    const [result] = await pool.query(sql, [
      title,
      teacher_email,
      venue,
      mysqlTime,
      description,
      material_request,
      software_requirements,
    ]);

    await createNotification(
      "hod@thapar.edu",
      `New activity request from ${teacher_email}: "${title}"`
    );

    res
      .status(201)
      .json({ message: "Created", newActivityId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update Status
app.put("/activities/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE activities SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    const [act] = await pool.query("SELECT * FROM activities WHERE id = ?", [
      req.params.id,
    ]);

    if (act.length > 0) {
      const activity = act[0];

      if (status === "Pending DOAA") {
        await createNotification(
          "doaa@thapar.edu",
          `HOD Approved: "${activity.title}". Pending your review.`
        );
        await createNotification(
          activity.teacher_email,
          `HOD Approved "${activity.title}". Sent to DOAA.`
        );
      } else if (status === "Approved") {
        await createNotification(
          activity.teacher_email,
          `Congratulations! "${activity.title}" is fully APPROVED.`
        );
        if (
          activity.material_request &&
          activity.material_request.trim().length > 0
        ) {
          const [techs] = await pool.query(
            "SELECT email FROM users WHERE role = 'Technician'"
          );
          for (const tech of techs) {
            await createNotification(
              tech.email,
              `ACTION REQUIRED: Materials for "${activity.title}". Request: ${activity.material_request}`
            );
          }
        }
      } else if (status === "Rejected") {
        await createNotification(
          activity.teacher_email,
          `Update: "${activity.title}" was Rejected.`
        );
      }
    }
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 8. Mark Materials
app.put("/activities/:id/materials", async (req, res) => {
  try {
    await pool.query(
      "UPDATE activities SET materials_arranged = 1 WHERE id = ?",
      [req.params.id]
    );
    const [act] = await pool.query("SELECT * FROM activities WHERE id = ?", [
      req.params.id,
    ]);
    if (act.length > 0) {
      await createNotification(
        act[0].teacher_email,
        `Materials for "${act[0].title}" have been arranged.`
      );
    }
    res.json({ message: "Materials marked arranged" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 9. Mark Attendance
app.post("/activities/:id/attendance", async (req, res) => {
  try {
    const { student_email } = req.body;
    await pool.query(
      "INSERT IGNORE INTO activity_attendance (activity_id, student_email) VALUES (?, ?)",
      [req.params.id, student_email]
    );
    res.json({ message: "Attendance marked" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 10. DELETE ACTIVITY (NEW!)
app.delete("/activities/:id", async (req, res) => {
  try {
    // Because we set ON DELETE CASCADE in MySQL, this will also delete attendance records automatically
    await pool.query("DELETE FROM activities WHERE id = ?", [req.params.id]);
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
