import { FC, MutableRefObject } from "react";
// components
import { TIssue, IIssueDisplayProperties, TIssueMap, TUnGroupedIssues } from "@plane/types";
import { IssueBlockRoot } from "@/components/issues/issue-layouts/list";
// hooks
import { TSelectionHelper } from "@/hooks/use-multiple-select";
// types
import { TRenderQuickActions } from "./list-view-types";

interface Props {
  issueIds: TUnGroupedIssues;
  issuesMap: TIssueMap;
  groupId: string;
  canEditProperties: (projectId: string | undefined) => boolean;
  updateIssue: ((projectId: string, issueId: string, data: Partial<TIssue>) => Promise<void>) | undefined;
  quickActions: TRenderQuickActions;
  displayProperties: IIssueDisplayProperties | undefined;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  selectionHelpers: TSelectionHelper;
  isDragAllowed: boolean;
  canDropOverIssue: boolean;
}

export const IssueBlocksList: FC<Props> = (props) => {
  const {
    issueIds,
    issuesMap,
    groupId,
    updateIssue,
    quickActions,
    displayProperties,
    canEditProperties,
    containerRef,
    selectionHelpers,
    isDragAllowed,
    canDropOverIssue,
  } = props;

  return (
    <div className="relative size-full">
      {issueIds?.map((issueId, index) => (
        <IssueBlockRoot
          key={`${issueId}`}
          issueIds={issueIds}
          issueId={issueId}
          issuesMap={issuesMap}
          updateIssue={updateIssue}
          quickActions={quickActions}
          canEditProperties={canEditProperties}
          displayProperties={displayProperties}
          nestingLevel={0}
          spacingLeft={0}
          containerRef={containerRef}
          selectionHelpers={selectionHelpers}
          groupId={groupId}
          isLastChild={index === issueIds.length - 1}
          isDragAllowed={isDragAllowed}
          canDropOverIssue={canDropOverIssue}
        />
      ))}
    </div>
  );
};
