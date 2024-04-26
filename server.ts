import express from "express";
import fs from "fs";

const port = 8500;

const app = express();
app.set("port", port);
app.use(express.json({ limit: "50mb" }));
app.use(express.text({ type: "text/*" }));

// add all controllers
const controllerPromises = fs.readdirSync("./controllers", { withFileTypes: true }).map(async (file) => {
    if (file.isFile()) {
      const [name] = file.name.split(".");
      const { default: routes, basePath = "/" + name } = await import("./controllers/" + name);
      app.use(basePath, routes);
    }
  });
  
// wait for all controller routes to be added
Promise.all(controllerPromises).then(() => {
  // catch-all route
  app.all("/*", (req, res) => res.status(404).send(req.method === "GET" ? "Not Found" : `Cannot ${req.method} ${req.url}`));
  // start server
  app.listen(port, () => console.log(`listening on port ${port}`));
});