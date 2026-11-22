import "./styles/base.css";
import { Application } from "@hotwired/stimulus";
import TabsController from "./controllers/tabs_controller.js";

const application = Application.start();
application.register("tabs", TabsController);
