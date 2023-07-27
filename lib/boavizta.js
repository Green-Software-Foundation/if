"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoaviztaCpuImpactModel = exports.BoaviztaCloudImpactModel = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const axios_1 = require("axios");
class BoaviztaCloudImpactModel {
    constructor() {
        this.authCredentials = undefined;
    }
    modelIdentifier() {
        return "boavizta.cloud.sci";
    }
    configure(name, staticParams) {
        const staticParamCast = staticParams;
        if (staticParamCast?.hasOwnProperty('provider')) {
            this.provider = staticParamCast.provider;
        }
        this.name = name;
        return this;
    }
    configureTyped(name, staticParamCast) {
        if (staticParamCast?.hasOwnProperty('provider')) {
            this.provider = staticParamCast.provider;
        }
        this.name = name;
        return this;
    }
    authenticate(authParams) {
        this.authCredentials = authParams;
    }
    async usage(data) {
        const dataCast = data;
        if ('provider' in dataCast) {
            if (this.provider !== undefined) {
                dataCast.provider = this.provider;
            }
            else {
                throw new Error('Malformed Telemetry: Missing provider');
            }
        }
        if ('instance_type' in dataCast) {
            throw new Error('Malformed Telemetry: Missing instance_type');
        }
        const response = await axios_1.default.post('https://api.boavizta.org/v1/cloud/', dataCast);
        return response.data;
    }
}
exports.BoaviztaCloudImpactModel = BoaviztaCloudImpactModel;
_a = JSII_RTTI_SYMBOL_1;
BoaviztaCloudImpactModel[_a] = { fqn: "carbonql.BoaviztaCloudImpactModel", version: "1.0.0" };
class BoaviztaCpuImpactModel {
    constructor() {
        this.componentType = "cpu";
        this.verbose = false;
        this.allocation = "total";
        this.authCredentials = undefined;
    }
    modelIdentifier() {
        return "boavizta.component.sci";
    }
    authenticate(authParams) {
        this.authCredentials = authParams;
    }
    configure(name, staticParams) {
        const staticParamCast = staticParams;
        if ('verbose' in staticParamCast) {
            this.verbose = staticParamCast.verbose ?? false;
            staticParamCast.verbose = undefined;
        }
        if ('allocation' in staticParamCast) {
            this.allocation = staticParamCast.allocation ?? "total";
            staticParamCast.allocation = undefined;
        }
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }
    configureTyped(name, staticParamCast) {
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }
    async usage(data) {
        const usageCast = data;
        if (this.sharedParams === undefined) {
            throw new Error("Improper Initialization: Missing configuration parameters");
        }
        const dataCast = Object.assign(this.sharedParams);
        dataCast['usage'] = usageCast;
        const response = await axios_1.default.post(`https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`, dataCast);
        const m = response.data['gwp']['manufacture'] * 1000;
        // MJ to kWh , 1MJ eq 0.277778kWh
        const e = response.data['pe']['use'] / 3.6;
        return {
            "m": m,
            "e": e,
        };
    }
}
exports.BoaviztaCpuImpactModel = BoaviztaCpuImpactModel;
_b = JSII_RTTI_SYMBOL_1;
BoaviztaCpuImpactModel[_b] = { fqn: "carbonql.BoaviztaCpuImpactModel", version: "1.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9hdml6dGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJib2F2aXp0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLGlDQUEwQjtBQXlCMUIsTUFBYSx3QkFBd0I7SUFBckM7UUFHYyxvQkFBZSxHQUFRLFNBQVMsQ0FBQztLQTJDOUM7SUF6Q0csZUFBZTtRQUNYLE9BQU8sb0JBQW9CLENBQUE7SUFDL0IsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFZLEVBQUUsWUFBZ0M7UUFDcEQsTUFBTSxlQUFlLEdBQUcsWUFBcUMsQ0FBQztRQUM5RCxJQUFJLGVBQWUsRUFBRSxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFZLEVBQUUsZUFBc0M7UUFDL0QsSUFBSSxlQUFlLEVBQUUsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQztTQUM1QztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxZQUFZLENBQUMsVUFBa0I7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7SUFDdEMsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBWTtRQUNwQixNQUFNLFFBQVEsR0FBRyxJQUE4QixDQUFDO1FBQ2hELElBQUksVUFBVSxJQUFJLFFBQVEsRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUM3QixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDckM7aUJBQU07Z0JBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2FBQzVEO1NBQ0o7UUFDRCxJQUFJLGVBQWUsSUFBSSxRQUFRLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDOztBQTdDTCw0REE4Q0M7OztBQUVELE1BQWEsc0JBQXNCO0lBQW5DO1FBQ1ksa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFHdkIsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixlQUFVLEdBQVcsT0FBTyxDQUFDO1FBQzFCLG9CQUFlLEdBQVEsU0FBUyxDQUFDO0tBZ0Q5QztJQTdDRyxlQUFlO1FBQ1gsT0FBTyx3QkFBd0IsQ0FBQTtJQUNuQyxDQUFDO0lBRUQsWUFBWSxDQUFDLFVBQWtCO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBWSxFQUFFLFlBQWdDO1FBQ3BELE1BQU0sZUFBZSxHQUFHLFlBQWtDLENBQUE7UUFDMUQsSUFBSSxTQUFTLElBQUksZUFBZSxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUM7WUFDaEQsZUFBZSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7U0FDdkM7UUFDRCxJQUFJLFlBQVksSUFBSSxlQUFlLEVBQUU7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQztZQUN4RCxlQUFlLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztTQUMxQztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBWSxFQUFFLGVBQW1DO1FBQzVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVk7UUFDcEIsTUFBTSxTQUFTLEdBQUcsSUFBOEIsQ0FBQztRQUNqRCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQTtTQUMvRTtRQUNELE1BQU0sUUFBUSxHQUEyQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFBO1FBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsSUFBSSxDQUFDLGFBQWEsWUFBWSxJQUFJLENBQUMsT0FBTyxlQUFlLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqSyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNwRCxpQ0FBaUM7UUFDakMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDM0MsT0FBTztZQUNILEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxFQUFFLENBQUM7U0FDVCxDQUFDO0lBQ04sQ0FBQzs7QUFyREwsd0RBc0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJSW1wYWN0TW9kZWxJbnRlcmZhY2V9IGZyb20gXCIuL2ludGVyZmFjZXMvaW5kZXhcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuZXhwb3J0IHtcbiAgICBJSW1wYWN0TW9kZWxJbnRlcmZhY2Vcbn0gZnJvbSBcIi4vaW50ZXJmYWNlcy9pbmRleFwiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJvYXZpenRhU3RhdGljUGFyYW1zIHtcbiAgICBwcm92aWRlcj86IHN0cmluZztcbiAgICBjb21wb25lbnRUeXBlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElCb2F2aXp0YUNwdVBhcmFtcyB7XG4gICAgY29yZVVuaXRzPzogbnVtYmVyO1xuICAgIGRpZVNpemU/OiBudW1iZXI7XG4gICAgZGllU2l6ZVBlckNvcmU/OiBudW1iZXI7XG4gICAgbWFudWZhY3R1cmVyPzogc3RyaW5nO1xuICAgIG1vZGVsUmFuZ2U/OiBzdHJpbmc7XG4gICAgZmFtaWx5Pzogc3RyaW5nO1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgdGRwPzogbnVtYmVyO1xuICAgIHZlcmJvc2U/OiBib29sZWFuO1xuICAgIGFsbG9jYXRpb24/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBCb2F2aXp0YUNsb3VkSW1wYWN0TW9kZWwgaW1wbGVtZW50cyBJSW1wYWN0TW9kZWxJbnRlcmZhY2Uge1xuICAgIHB1YmxpYyBwcm92aWRlcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJvdGVjdGVkIGF1dGhDcmVkZW50aWFsczogYW55ID0gdW5kZWZpbmVkO1xuXG4gICAgbW9kZWxJZGVudGlmaWVyKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcImJvYXZpenRhLmNsb3VkLnNjaVwiXG4gICAgfVxuXG4gICAgY29uZmlndXJlKG5hbWU6IHN0cmluZywgc3RhdGljUGFyYW1zOiBvYmplY3QgfCB1bmRlZmluZWQpOiBJSW1wYWN0TW9kZWxJbnRlcmZhY2Uge1xuICAgICAgICBjb25zdCBzdGF0aWNQYXJhbUNhc3QgPSBzdGF0aWNQYXJhbXMgYXMgSUJvYXZpenRhU3RhdGljUGFyYW1zO1xuICAgICAgICBpZiAoc3RhdGljUGFyYW1DYXN0Py5oYXNPd25Qcm9wZXJ0eSgncHJvdmlkZXInKSkge1xuICAgICAgICAgICAgdGhpcy5wcm92aWRlciA9IHN0YXRpY1BhcmFtQ2FzdC5wcm92aWRlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25maWd1cmVUeXBlZChuYW1lOiBzdHJpbmcsIHN0YXRpY1BhcmFtQ2FzdDogSUJvYXZpenRhU3RhdGljUGFyYW1zKTogSUltcGFjdE1vZGVsSW50ZXJmYWNlIHtcbiAgICAgICAgaWYgKHN0YXRpY1BhcmFtQ2FzdD8uaGFzT3duUHJvcGVydHkoJ3Byb3ZpZGVyJykpIHtcbiAgICAgICAgICAgIHRoaXMucHJvdmlkZXIgPSBzdGF0aWNQYXJhbUNhc3QucHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXV0aGVudGljYXRlKGF1dGhQYXJhbXM6IG9iamVjdCkge1xuICAgICAgICB0aGlzLmF1dGhDcmVkZW50aWFscyA9IGF1dGhQYXJhbXM7XG4gICAgfVxuXG5cbiAgICBhc3luYyB1c2FnZShkYXRhOiBvYmplY3QpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgICAgICBjb25zdCBkYXRhQ2FzdCA9IGRhdGEgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcbiAgICAgICAgaWYgKCdwcm92aWRlcicgaW4gZGF0YUNhc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3ZpZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkYXRhQ2FzdC5wcm92aWRlciA9IHRoaXMucHJvdmlkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFRlbGVtZXRyeTogTWlzc2luZyBwcm92aWRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgnaW5zdGFuY2VfdHlwZScgaW4gZGF0YUNhc3QpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFRlbGVtZXRyeTogTWlzc2luZyBpbnN0YW5jZV90eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KCdodHRwczovL2FwaS5ib2F2aXp0YS5vcmcvdjEvY2xvdWQvJywgZGF0YUNhc3QpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb2F2aXp0YUNwdUltcGFjdE1vZGVsIGltcGxlbWVudHMgSUltcGFjdE1vZGVsSW50ZXJmYWNlIHtcbiAgICBwcml2YXRlIGNvbXBvbmVudFR5cGUgPSBcImNwdVwiO1xuICAgIHByaXZhdGUgc2hhcmVkUGFyYW1zOiBJQm9hdml6dGFDcHVQYXJhbXMgfCB1bmRlZmluZWQ7XG4gICAgcHVibGljIG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBwdWJsaWMgdmVyYm9zZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBhbGxvY2F0aW9uOiBzdHJpbmcgPSBcInRvdGFsXCI7XG4gICAgcHJvdGVjdGVkIGF1dGhDcmVkZW50aWFsczogYW55ID0gdW5kZWZpbmVkO1xuXG5cbiAgICBtb2RlbElkZW50aWZpZXIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiYm9hdml6dGEuY29tcG9uZW50LnNjaVwiXG4gICAgfVxuXG4gICAgYXV0aGVudGljYXRlKGF1dGhQYXJhbXM6IG9iamVjdCkge1xuICAgICAgICB0aGlzLmF1dGhDcmVkZW50aWFscyA9IGF1dGhQYXJhbXM7XG4gICAgfVxuXG4gICAgY29uZmlndXJlKG5hbWU6IHN0cmluZywgc3RhdGljUGFyYW1zOiBvYmplY3QgfCB1bmRlZmluZWQpOiBJSW1wYWN0TW9kZWxJbnRlcmZhY2Uge1xuICAgICAgICBjb25zdCBzdGF0aWNQYXJhbUNhc3QgPSBzdGF0aWNQYXJhbXMgYXMgSUJvYXZpenRhQ3B1UGFyYW1zXG4gICAgICAgIGlmICgndmVyYm9zZScgaW4gc3RhdGljUGFyYW1DYXN0KSB7XG4gICAgICAgICAgICB0aGlzLnZlcmJvc2UgPSBzdGF0aWNQYXJhbUNhc3QudmVyYm9zZSA/PyBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRpY1BhcmFtQ2FzdC52ZXJib3NlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICgnYWxsb2NhdGlvbicgaW4gc3RhdGljUGFyYW1DYXN0KSB7XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRpb24gPSBzdGF0aWNQYXJhbUNhc3QuYWxsb2NhdGlvbiA/PyBcInRvdGFsXCI7XG4gICAgICAgICAgICBzdGF0aWNQYXJhbUNhc3QuYWxsb2NhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnNoYXJlZFBhcmFtcyA9IHN0YXRpY1BhcmFtQ2FzdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uZmlndXJlVHlwZWQobmFtZTogc3RyaW5nLCBzdGF0aWNQYXJhbUNhc3Q6IElCb2F2aXp0YUNwdVBhcmFtcyk6IElJbXBhY3RNb2RlbEludGVyZmFjZSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc2hhcmVkUGFyYW1zID0gc3RhdGljUGFyYW1DYXN0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3luYyB1c2FnZShkYXRhOiBvYmplY3QpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgICAgICBjb25zdCB1c2FnZUNhc3QgPSBkYXRhIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgICAgIGlmICh0aGlzLnNoYXJlZFBhcmFtcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXByb3BlciBJbml0aWFsaXphdGlvbjogTWlzc2luZyBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnNcIilcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhQ2FzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IE9iamVjdC5hc3NpZ24odGhpcy5zaGFyZWRQYXJhbXMpO1xuICAgICAgICBkYXRhQ2FzdFsndXNhZ2UnXSA9IHVzYWdlQ2FzdFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3QoYGh0dHBzOi8vYXBpLmJvYXZpenRhLm9yZy92MS9jb21wb25lbnQvJHt0aGlzLmNvbXBvbmVudFR5cGV9P3ZlcmJvc2U9JHt0aGlzLnZlcmJvc2V9JmFsbG9jYXRpb249JHt0aGlzLmFsbG9jYXRpb259YCwgZGF0YUNhc3QpO1xuICAgICAgICBjb25zdCBtID0gcmVzcG9uc2UuZGF0YVsnZ3dwJ11bJ21hbnVmYWN0dXJlJ10gKiAxMDAwXG4gICAgICAgIC8vIE1KIHRvIGtXaCAsIDFNSiBlcSAwLjI3Nzc3OGtXaFxuICAgICAgICBjb25zdCBlID0gcmVzcG9uc2UuZGF0YVsncGUnXVsndXNlJ10gLyAzLjY7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIm1cIjogbSxcbiAgICAgICAgICAgIFwiZVwiOiBlLFxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==