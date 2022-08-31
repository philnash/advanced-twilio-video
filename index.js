import app from "./server/server.js";
import { port } from "./server/config.js";

app.listen(port, () =>
  console.log(`Application is running on http://localhost:${port}`)
);
