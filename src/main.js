import "./styles/base.css";
import { Application } from "@hotwired/stimulus";
import TabsController from "./controllers/tabs_controller.js";
import TimerController from "./controllers/timer_controller.js";

const application = Application.start();
application.register("tabs", TabsController);
application.register("timer", TimerController);
