"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./modules/dashboard/app.controller");
const app_service_1 = require("./modules/dashboard/app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const project_module_1 = require("./modules/projects/project.module");
const board_module_1 = require("./modules/boards/board.module");
const membership_module_1 = require("./modules/membership/membership.module");
const collaboration_module_1 = require("./modules/collaboration/collaboration.module");
const notification_module_1 = require("./modules/notifications/notification.module");
const common_module_1 = require("./com\u00FAn/common.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                expandVariables: true,
            }),
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            project_module_1.ProjectModule,
            board_module_1.BoardModule,
            membership_module_1.MembershipModule,
            collaboration_module_1.CollaborationModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map