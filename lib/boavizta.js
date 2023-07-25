"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoaviztaComponentImpactModel = exports.BoaviztaCloudImpactModel = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const axios_1 = require("axios");
class BoaviztaCloudImpactModel {
    constructor() {
        this.authCredentials = undefined;
    }
    configure(name, staticParams) {
        const staticParamCast = staticParams;
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
class BoaviztaComponentImpactModel {
    constructor() {
        this.authCredentials = undefined;
    }
    authenticate(authParams) {
        this.authCredentials = authParams;
    }
    configure(name, staticParams) {
        const staticParamCast = staticParams;
        if ('componentType' in staticParamCast) {
            this.componentType = staticParamCast.componentType;
        }
        this.name = name;
        return this;
    }
    async usage(data) {
        const dataCast = data;
        if (this.componentType === undefined) {
            throw new Error("Improper Initialization: Missing componentType");
        }
        const response = await axios_1.default.post(`https://api.boavizta.org/v1/component/${this.componentType}`, dataCast);
        return response.data;
    }
}
exports.BoaviztaComponentImpactModel = BoaviztaComponentImpactModel;
_b = JSII_RTTI_SYMBOL_1;
BoaviztaComponentImpactModel[_b] = { fqn: "carbonql.BoaviztaComponentImpactModel", version: "1.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9hdml6dGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJib2F2aXp0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLGlDQUEwQjtBQVkxQixNQUFhLHdCQUF3QjtJQUFyQztRQUdjLG9CQUFlLEdBQVEsU0FBUyxDQUFDO0tBK0I5QztJQTdCRyxTQUFTLENBQUMsSUFBWSxFQUFFLFlBQWdDO1FBQ3BELE1BQU0sZUFBZSxHQUFHLFlBQXFDLENBQUM7UUFDOUQsSUFBSSxlQUFlLEVBQUUsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQztTQUM1QztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxZQUFZLENBQUMsVUFBa0I7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7SUFDdEMsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBWTtRQUNwQixNQUFNLFFBQVEsR0FBRyxJQUE4QixDQUFDO1FBQ2hELElBQUksVUFBVSxJQUFJLFFBQVEsRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUM3QixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDckM7aUJBQU07Z0JBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2FBQzVEO1NBQ0o7UUFDRCxJQUFJLGVBQWUsSUFBSSxRQUFRLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDOztBQWpDTCw0REFrQ0M7OztBQUVELE1BQWEsNEJBQTRCO0lBQXpDO1FBR2Msb0JBQWUsR0FBUSxTQUFTLENBQUM7S0F3QjlDO0lBdEJHLFlBQVksQ0FBQyxVQUFrQjtRQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQVksRUFBRSxZQUFnQztRQUNwRCxNQUFNLGVBQWUsR0FBRyxZQUFxQyxDQUFDO1FBQzlELElBQUksZUFBZSxJQUFJLGVBQWUsRUFBRTtZQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUM7U0FDdEQ7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFZO1FBQ3BCLE1BQU0sUUFBUSxHQUFHLElBQThCLENBQUM7UUFDaEQsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtZQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUE7U0FDcEU7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMseUNBQXlDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRyxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDekIsQ0FBQzs7QUF6Qkwsb0VBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJSW1wYWN0TW9kZWxJbnRlcmZhY2V9IGZyb20gXCIuL2ludGVyZmFjZXMvaW5kZXhcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuZXhwb3J0IHtcbiAgICBJSW1wYWN0TW9kZWxJbnRlcmZhY2Vcbn0gZnJvbSBcIi4vaW50ZXJmYWNlcy9pbmRleFwiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJvYXZpenRhU3RhdGljUGFyYW1zIHtcbiAgICBwcm92aWRlcj86IHN0cmluZztcbiAgICBjb21wb25lbnRUeXBlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQm9hdml6dGFDbG91ZEltcGFjdE1vZGVsIGltcGxlbWVudHMgSUltcGFjdE1vZGVsSW50ZXJmYWNlIHtcbiAgICBwdWJsaWMgcHJvdmlkZXI6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByb3RlY3RlZCBhdXRoQ3JlZGVudGlhbHM6IGFueSA9IHVuZGVmaW5lZDtcblxuICAgIGNvbmZpZ3VyZShuYW1lOiBzdHJpbmcsIHN0YXRpY1BhcmFtczogb2JqZWN0IHwgdW5kZWZpbmVkKTogSUltcGFjdE1vZGVsSW50ZXJmYWNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGljUGFyYW1DYXN0ID0gc3RhdGljUGFyYW1zIGFzIElCb2F2aXp0YVN0YXRpY1BhcmFtcztcbiAgICAgICAgaWYgKHN0YXRpY1BhcmFtQ2FzdD8uaGFzT3duUHJvcGVydHkoJ3Byb3ZpZGVyJykpIHtcbiAgICAgICAgICAgIHRoaXMucHJvdmlkZXIgPSBzdGF0aWNQYXJhbUNhc3QucHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXV0aGVudGljYXRlKGF1dGhQYXJhbXM6IG9iamVjdCkge1xuICAgICAgICB0aGlzLmF1dGhDcmVkZW50aWFscyA9IGF1dGhQYXJhbXM7XG4gICAgfVxuXG5cbiAgICBhc3luYyB1c2FnZShkYXRhOiBvYmplY3QpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgICAgICBjb25zdCBkYXRhQ2FzdCA9IGRhdGEgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcbiAgICAgICAgaWYgKCdwcm92aWRlcicgaW4gZGF0YUNhc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3ZpZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkYXRhQ2FzdC5wcm92aWRlciA9IHRoaXMucHJvdmlkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFRlbGVtZXRyeTogTWlzc2luZyBwcm92aWRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgnaW5zdGFuY2VfdHlwZScgaW4gZGF0YUNhc3QpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFRlbGVtZXRyeTogTWlzc2luZyBpbnN0YW5jZV90eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KCdodHRwczovL2FwaS5ib2F2aXp0YS5vcmcvdjEvY2xvdWQvJywgZGF0YUNhc3QpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb2F2aXp0YUNvbXBvbmVudEltcGFjdE1vZGVsIGltcGxlbWVudHMgSUltcGFjdE1vZGVsSW50ZXJmYWNlIHtcbiAgICBwdWJsaWMgY29tcG9uZW50VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJvdGVjdGVkIGF1dGhDcmVkZW50aWFsczogYW55ID0gdW5kZWZpbmVkO1xuXG4gICAgYXV0aGVudGljYXRlKGF1dGhQYXJhbXM6IG9iamVjdCkge1xuICAgICAgICB0aGlzLmF1dGhDcmVkZW50aWFscyA9IGF1dGhQYXJhbXM7XG4gICAgfVxuXG4gICAgY29uZmlndXJlKG5hbWU6IHN0cmluZywgc3RhdGljUGFyYW1zOiBvYmplY3QgfCB1bmRlZmluZWQpOiBJSW1wYWN0TW9kZWxJbnRlcmZhY2Uge1xuICAgICAgICBjb25zdCBzdGF0aWNQYXJhbUNhc3QgPSBzdGF0aWNQYXJhbXMgYXMgSUJvYXZpenRhU3RhdGljUGFyYW1zO1xuICAgICAgICBpZiAoJ2NvbXBvbmVudFR5cGUnIGluIHN0YXRpY1BhcmFtQ2FzdCkge1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRUeXBlID0gc3RhdGljUGFyYW1DYXN0LmNvbXBvbmVudFR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXN5bmMgdXNhZ2UoZGF0YTogb2JqZWN0KTogUHJvbWlzZTxvYmplY3Q+IHtcbiAgICAgICAgY29uc3QgZGF0YUNhc3QgPSBkYXRhIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgICAgIGlmICh0aGlzLmNvbXBvbmVudFR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wcm9wZXIgSW5pdGlhbGl6YXRpb246IE1pc3NpbmcgY29tcG9uZW50VHlwZVwiKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChgaHR0cHM6Ly9hcGkuYm9hdml6dGEub3JnL3YxL2NvbXBvbmVudC8ke3RoaXMuY29tcG9uZW50VHlwZX1gLCBkYXRhQ2FzdCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH1cblxufVxuIl19