import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ServiceNow Configuration
const SN_HOST = process.env.SERVICENOW_HOST || "https://dev219817.service-now.com";
const SN_USER = process.env.SERVICENOW_USERNAME || "admin";
const SN_PASS = process.env.SERVICENOW_PASSWORD || "0F+vx/5eiUOY";
const SN_AUTH = Buffer.from(`${SN_USER}:${SN_PASS}`).toString('base64');

async function startServer() {
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/servicenow/stats", async (req, res) => {
    try {
      const endpoints = [
        `${SN_HOST}/api/now/table/incident?sysparm_fields=sys_id`,
        `${SN_HOST}/api/now/table/change_request?sysparm_fields=sys_id`,
        `${SN_HOST}/api/now/table/problem?sysparm_fields=sys_id`
      ];

      const [incRes, chgRes, prbRes] = await Promise.all(endpoints.map(url => 
        fetch(url, {
          headers: { 'Authorization': `Basic ${SN_AUTH}`, 'Accept': 'application/json' }
        }).then(r => r.json())
      ));

      res.json({
        incidents: incRes.result?.length || 0,
        changes: chgRes.result?.length || 0,
        problems: prbRes.result?.length || 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/servicenow/incidents", async (req, res) => {
    try {
      const response = await fetch(`${SN_HOST}/api/now/table/incident?sysparm_limit=20&sysparm_query=ORDERBYDESCsys_updated_on`, {
        headers: {
          'Authorization': `Basic ${SN_AUTH}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("ServiceNow Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/servicenow/changes", async (req, res) => {
    try {
      const response = await fetch(`${SN_HOST}/api/now/table/change_request?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_updated_on`, {
        headers: {
          'Authorization': `Basic ${SN_AUTH}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch changes" });
    }
  });

  app.get("/api/servicenow/problems", async (req, res) => {
    try {
      const response = await fetch(`${SN_HOST}/api/now/table/problem?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_updated_on`, {
        headers: {
          'Authorization': `Basic ${SN_AUTH}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch problems" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
