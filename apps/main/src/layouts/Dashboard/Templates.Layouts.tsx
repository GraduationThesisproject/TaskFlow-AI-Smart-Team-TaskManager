import React, { useEffect } from "react";
import { useTemplates } from "../../hooks/useTemplates";
import TemplatesHeader from "../../components/dashboard/templates/TemplatesHeader";
import TemplatesList from "../../components/dashboard/templates/TemplatesList";

const Templates: React.FC = () => {
  const { load } = useTemplates();

  // Load templates when component mounts
  useEffect(() => {
    console.log('Templates component mounted, calling load()');
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <TemplatesHeader />
      <TemplatesList />
    </div>
  );
};

export default Templates;
