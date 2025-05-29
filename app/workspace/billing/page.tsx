import { PricingTable } from "@clerk/nextjs";
import React from "react";

const Billing = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-5">Selecciona un plan</h2>
      <PricingTable />
    </div>
  );
};

export default Billing;
