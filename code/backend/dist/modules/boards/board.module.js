"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModule = void 0;
const common_1 = require("@nestjs/common");
const board_controller_1 = require("./board.controller");
const board_test_controller_1 = require("./board-test.controller");
const board_service_1 = require("./board.service");
const collaboration_module_1 = require("../collaboration/collaboration.module");
const membership_module_1 = require("../membership/membership.module");
const common_module_1 = require("../../com\u00FAn/common.module");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
let BoardModule = class BoardModule {
};
exports.BoardModule = BoardModule;
exports.BoardModule = BoardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            (0, common_1.forwardRef)(() => collaboration_module_1.CollaborationModule),
            membership_module_1.MembershipModule,
        ],
        controllers: [board_controller_1.BoardController, board_test_controller_1.BoardTestController],
        providers: [
            board_service_1.BoardService,
            prisma_service_1.PrismaService,
            {
                provide: 'IBoardService',
                useClass: board_service_1.BoardService,
            },
        ],
        exports: [board_service_1.BoardService, 'IBoardService'],
    })
], BoardModule);
//# sourceMappingURL=board.module.js.map