import "./style.css";
import { Juris } from "juris";
import App from "./app.js";
import board from "./components/board.js";
import cell from "./components/cell.js";
import toolbar from "./components/toolbar.js";

const app = new Juris({
  components: { App, toolbar, board, cell },
  layout: {
    App: {},
  },
  logLevel: "error",
});
app.render("#app");
