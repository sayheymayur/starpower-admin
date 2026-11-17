import React from "react";
import { Overview } from "../../components/saas/Overview";
import { ChurnRate } from "../../components/saas/ChurnRate";
import { UserGrowth } from "../../components/saas/UserGrowth";
import { ProductPerformance } from "../../components/saas/ProductPerformance";
import { ConversionFunnel } from "../../components/saas/ConversionFunnel";
import { Activities } from "../../components/saas/Activities";
import { RecentInvoices } from "../../components/saas/RecentInvoices";
import { motion } from "framer-motion";

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, type: "spring" as const },
  }),
};

const SaasDashboard: React.FC = () => {
  return (
    <div className="saas-dashboard-container p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-screen-xl mx-auto">
      {/* Overview Section */}
      <section className="mb-8">
        <Overview />
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <ChurnRate />
        </div>
        <div className="col-span-1">
          <UserGrowth />
        </div>
        
      </section>

      {/* Product Performance and Conversion Funnel Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          style={{ width: '745px' }}
        >
          <ConversionFunnel />
        </motion.div>
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardAnim}
          className="h-full"
          style={{ marginTop: '-175px', marginLeft: '195px' }}
        >
          <ProductPerformance />
        </motion.div>
      </section>

      {/* Activities and Recent Invoices Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[<RecentInvoices key="inv" />,<Activities key="act" />].map((Comp, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardAnim}
          >
            {Comp}
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default SaasDashboard;