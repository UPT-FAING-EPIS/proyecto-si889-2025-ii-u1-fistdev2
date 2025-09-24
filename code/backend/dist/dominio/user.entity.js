"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertSeverity = exports.DeployStatus = exports.TestStatus = exports.DiagramType = exports.Priority = exports.TaskStatus = exports.ProjectStatus = void 0;
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["ON_HOLD"] = "on_hold";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["CANCELLED"] = "cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["BACKLOG"] = "backlog";
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["IN_REVIEW"] = "in_review";
    TaskStatus["TESTING"] = "testing";
    TaskStatus["DONE"] = "done";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
})(Priority || (exports.Priority = Priority = {}));
var DiagramType;
(function (DiagramType) {
    DiagramType["CLASS"] = "class";
    DiagramType["SEQUENCE"] = "sequence";
    DiagramType["ACTIVITY"] = "activity";
    DiagramType["USE_CASE"] = "use_case";
    DiagramType["STATE"] = "state";
    DiagramType["COMPONENT"] = "component";
    DiagramType["DEPLOYMENT"] = "deployment";
})(DiagramType || (exports.DiagramType = DiagramType = {}));
var TestStatus;
(function (TestStatus) {
    TestStatus["PENDING"] = "pending";
    TestStatus["RUNNING"] = "running";
    TestStatus["PASSED"] = "passed";
    TestStatus["FAILED"] = "failed";
    TestStatus["SKIPPED"] = "skipped";
    TestStatus["ERROR"] = "error";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
var DeployStatus;
(function (DeployStatus) {
    DeployStatus["PENDING"] = "pending";
    DeployStatus["BUILDING"] = "building";
    DeployStatus["DEPLOYING"] = "deploying";
    DeployStatus["SUCCESS"] = "success";
    DeployStatus["FAILED"] = "failed";
    DeployStatus["CANCELLED"] = "cancelled";
    DeployStatus["ROLLBACK"] = "rollback";
})(DeployStatus || (exports.DeployStatus = DeployStatus = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
//# sourceMappingURL=user.entity.js.map