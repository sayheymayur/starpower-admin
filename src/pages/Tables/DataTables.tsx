import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DataTableOne from "../../components/tables/DataTables/DataTableOne";
import DataTableTwo from "../../components/tables/DataTables/DataTableTwo";
import DataTableThree from "../../components/tables/DataTables/DataTableThree";

export default function DataTables() {
  return (
    <>
      <PageMeta
        title="React.js Data Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Data Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Data Tables" />
      <div className="space-y-6">
        <ComponentCard title="Datatable 1">
          <DataTableOne />
        </ComponentCard>
        <ComponentCard title="Datatable 2">
          <DataTableTwo />
        </ComponentCard>
        <ComponentCard title="Datatable 3">
          <DataTableThree />
        </ComponentCard>
      </div>
    </>
  );
}
