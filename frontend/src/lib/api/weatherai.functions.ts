import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
  AdminDashboardData,
  FarmerDashboardData,
  OfficerDashboardData,
} from "../shambaiq-types";

const farmerInput = z.object({
  farmerId: z.string().min(1).default("f-001"),
});

export const getFarmerDashboard = createServerFn({ method: "GET" })
  .inputValidator(farmerInput)
  .handler(async ({ data }): Promise<FarmerDashboardData> => {
    const backend = await import("../shambaiq-backend.server");
    return backend.getFarmerDashboardData(data.farmerId);
  });

export const getOfficerDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<OfficerDashboardData> => {
    const backend = await import("../shambaiq-backend.server");
    return backend.getOfficerDashboardData();
  },
);

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminDashboardData> => {
    const backend = await import("../shambaiq-backend.server");
    return backend.getAdminDashboardData();
  },
);
