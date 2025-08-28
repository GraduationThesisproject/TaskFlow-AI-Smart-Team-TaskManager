import React from "react";
import { DashboardShell } from "./DashboardShell";
import TemplatesHeader from "../../components/dashboard/templates/TemplatesHeader";
import TemplatesList from "../../components/dashboard/templates/TemplatesList";

const Templates: React.FC = () => {
  return (
    <DashboardShell title="Templates">
      <TemplatesHeader />
      <TemplatesList />
    </DashboardShell>
  );
};

export default Templates;
