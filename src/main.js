import "./sheet/sheet.css";
import "./styles/base.css";
import "./styles/themes.css";
import { Application } from "@hotwired/stimulus";
import ChimeController from "./controllers/chime_controller.js";
import HistoryController from "./controllers/history_controller.js";
import LanguageController from "./controllers/language_controller.js";
import InstallController from "./controllers/install_controller.js";
import SheetController from "./sheet/sheet_controller.js";
import TabsController from "./controllers/tabs_controller.js";
import ThemeController from "./controllers/theme_controller.js";
import TimerController from "./controllers/timer_controller.js";

const application = Application.start();
application.register("language", LanguageController);
application.register("tabs", TabsController);
application.register("timer", TimerController);
application.register("chime", ChimeController);
application.register("history", HistoryController);
application.register("theme", ThemeController);
application.register("sheet", SheetController);
// The install guide's sheet: the same sheet as Settings, under its own name.
application.register("guide", SheetController);
application.register("install", InstallController);
