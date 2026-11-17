import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    allowedHosts: [
      "admin.starpower.co.in",
      "admin.starpower.app",
      "starpower-admin.sayhey.co.in",
      "localhost",
      "127.0.0.1",
    ],
    watch: {
      ignored: ['**/var/logs/**','**/var/log/**','**/logs/**','**/log/**','**/var/tmp/**','**/tmp/**'],
    },
  },
  preview: {
    allowedHosts: [
      "admin.starpower.co.in",
      "admin.starpower.app",
      "starpower-admin.sayhey.co.in",
      "localhost",
      "127.0.0.1",
    ],
  },
});
