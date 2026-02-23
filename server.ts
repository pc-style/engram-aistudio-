import express from "express";
import { createServer as createViteServer } from "vite";
import { addMemory, updateMemory, deleteMemory, searchMemories, getAllMemories } from './src/core/memory.js';
import { addEdge, deleteEdge, searchEdges, getAllEdges } from './src/core/graph.js';
import { generateBundle } from './src/core/bundle.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/memories", (req, res) => {
    res.json(getAllMemories());
  });

  app.post("/api/memories", (req, res) => {
    const { content, scope, importance, enforced } = req.body;
    const id = addMemory(content, scope, importance, enforced);
    res.json({ id });
  });

  app.delete("/api/memories/:id", (req, res) => {
    deleteMemory(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/edges", (req, res) => {
    res.json(getAllEdges());
  });

  app.post("/api/edges", (req, res) => {
    const { source, relation, target } = req.body;
    const id = addEdge(source, relation, target);
    res.json({ id });
  });

  app.delete("/api/edges/:id", (req, res) => {
    deleteEdge(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/bundle", (req, res) => {
    const topic = req.query.topic as string | undefined;
    const bundle = generateBundle(topic);
    res.json({ bundle });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
