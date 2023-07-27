"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boavizta_1 = require("../lib/boavizta");
async function test() {
    const newModel = new boavizta_1.BoaviztaCpuImpactModel();
    const params = new boavizta_1.BoaviztaCpuParams();
    params.allocation = 'TOTAL';
    params.verbose = true;
    params.name = 'Intel Xeon Platinum 8160 Processor';
    params.core_units = 2;
    newModel.configureTyped('test', params);
    const usage = await newModel.usage([
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 5,
        },
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 5,
        }
    ]);
    console.log(usage);
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwRTtBQUUxRSxLQUFLLFVBQVUsSUFBSTtJQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksaUNBQXNCLEVBQUUsQ0FBQztJQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLDRCQUFpQixFQUFFLENBQUM7SUFDdkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDdEIsTUFBTSxDQUFDLElBQUksR0FBRyxvQ0FBb0MsQ0FBQTtJQUNsRCxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUN0QixRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDL0I7WUFDSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIsZUFBZSxFQUFFLENBQUM7U0FDckI7UUFDRDtZQUNJLGdCQUFnQixFQUFFLENBQUM7WUFDbkIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixlQUFlLEVBQUUsQ0FBQztTQUNyQjtLQUNKLENBQUMsQ0FBQTtJQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCb2F2aXp0YUNwdUltcGFjdE1vZGVsLCBCb2F2aXp0YUNwdVBhcmFtc30gZnJvbSBcIi4uL2xpYi9ib2F2aXp0YVwiO1xuXG5hc3luYyBmdW5jdGlvbiB0ZXN0KCkge1xuICAgIGNvbnN0IG5ld01vZGVsID0gbmV3IEJvYXZpenRhQ3B1SW1wYWN0TW9kZWwoKTtcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgQm9hdml6dGFDcHVQYXJhbXMoKTtcbiAgICBwYXJhbXMuYWxsb2NhdGlvbiA9ICdUT1RBTCc7XG4gICAgcGFyYW1zLnZlcmJvc2UgPSB0cnVlO1xuICAgIHBhcmFtcy5uYW1lID0gJ0ludGVsIFhlb24gUGxhdGludW0gODE2MCBQcm9jZXNzb3InXG4gICAgcGFyYW1zLmNvcmVfdW5pdHMgPSAyO1xuICAgIG5ld01vZGVsLmNvbmZpZ3VyZVR5cGVkKCd0ZXN0JywgcGFyYW1zKTtcbiAgICBjb25zdCB1c2FnZSA9IGF3YWl0IG5ld01vZGVsLnVzYWdlKFtcbiAgICAgICAge1xuICAgICAgICAgICAgXCJob3Vyc191c2VfdGltZVwiOiAxLFxuICAgICAgICAgICAgXCJ1c2FnZV9sb2NhdGlvblwiOiBcIlVTQVwiLFxuICAgICAgICAgICAgXCJ0aW1lX3dvcmtsb2FkXCI6IDUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIFwiaG91cnNfdXNlX3RpbWVcIjogMSxcbiAgICAgICAgICAgIFwidXNhZ2VfbG9jYXRpb25cIjogXCJVU0FcIixcbiAgICAgICAgICAgIFwidGltZV93b3JrbG9hZFwiOiA1LFxuICAgICAgICB9XG4gICAgXSlcbiAgICBjb25zb2xlLmxvZyh1c2FnZSk7XG59XG5cbnRlc3QoKTtcbiJdfQ==