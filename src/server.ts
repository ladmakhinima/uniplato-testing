import { config } from "./config";
import configApp from "./config/app.config";

const app = configApp();
app.listen(config.PORT, () => {
  console.log(`The server is running at ${config.PORT}`);
});
