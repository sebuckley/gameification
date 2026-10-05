import { useState } from "react";
import {
  DISCOVERY_TEMPLATE_CATEGORIES,
  DISCOVERY_INTRODUCTION_TEMPLATES,
  DISCOVERY_QUESTION_TEMPLATES
} from "../../data/discoveryTemplates";
import DiscoverySetList from "../discovery/DiscoverySetList";
import DiscoverySetCreate from "../discovery/DiscoverySetCreate";
import DiscoverySetEditor from "../discovery/DiscoverySetEditor";

export default function QuestionSetsPage() {
  const [view, setView] = useState("list");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Question Sets</h1>
        <p className="text-sm text-slate-600">
          Build structured discovery sets using templates, introductions and guided questions.
          Link them to interviews or observations on the agenda.
        </p>
      </div>

      {/* Main Card */}
      
        {view === "list" && (
          <DiscoverySetList
            onCreate={() => setView("create")}
            onEdit={(id) => setView({ editId: id })}
          />
        )}

        {view === "create" && (
          <DiscoverySetCreate
            categories={DISCOVERY_TEMPLATE_CATEGORIES}
            introductions={DISCOVERY_INTRODUCTION_TEMPLATES}
            questions={DISCOVERY_QUESTION_TEMPLATES}
            onCreated={(id) => setView({ editId: id })}
            onCancel={() => setView("list")}
          />
        )}

        {view?.editId && (
          <DiscoverySetEditor
            key={view.editId}
            setId={view.editId}
            onClose={() => setView("list")}
            categories={DISCOVERY_TEMPLATE_CATEGORIES}
          />
        )}
      </div>
  
  );
}
