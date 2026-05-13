import { useStudioStore } from './studio-store';
import type { SelectedNodeDetails } from '@/types/graph';

export function useSelectedNode(): SelectedNodeDetails | null {
  const selectedNodeId = useStudioStore((state) => state.selectedNodeId);
  const editedGraph = useStudioStore((state) => state.editedGraph);

  if (!selectedNodeId || !editedGraph?.knowledgeGraph) return null;

  const node = editedGraph.knowledgeGraph.nodes.find((value) => value.id === selectedNodeId);
  if (!node) return null;

  return {
    node,
    service: node.kind === 'service' ? (editedGraph.services[node.label] ?? null) : null,
    incoming: editedGraph.knowledgeGraph.edges.filter((edge) => edge.target === selectedNodeId),
    outgoing: editedGraph.knowledgeGraph.edges.filter((edge) => edge.source === selectedNodeId),
    community:
      editedGraph.knowledgeGraph.communities.find((community) => community.id === node.community) ??
      null,
  };
}

export function useCommunities() {
  const editedGraph = useStudioStore((state) => state.editedGraph);
  return editedGraph?.knowledgeGraph?.communities ?? [];
}

export function useIsNodeDimmed(nodeId: string) {
  const hoveredNodeId = useStudioStore((state) => state.hoveredNodeId);
  const editedGraph = useStudioStore((state) => state.editedGraph);
  const searchQuery = useStudioStore((state) => state.searchQuery);
  const nodeKindFilter = useStudioStore((state) => state.nodeKindFilter);
  const communityFilter = useStudioStore((state) => state.communityFilter);
  const confidenceFilter = useStudioStore((state) => state.confidenceFilter);
  const ownershipFilter = useStudioStore((state) => state.ownershipFilter);

  if (!editedGraph?.knowledgeGraph) return false;

  if (hoveredNodeId) {
    if (hoveredNodeId === nodeId) return false;
    const isConnected = editedGraph.knowledgeGraph.edges.some(
      (edge) =>
        (edge.source === hoveredNodeId && edge.target === nodeId) ||
        (edge.target === hoveredNodeId && edge.source === nodeId)
    );
    return !isConnected;
  }

  const node = editedGraph.knowledgeGraph.nodes.find((value) => value.id === nodeId);
  if (!node) return true;

  const owned = editedGraph.knowledgeGraph.edges.some(
    (edge) => edge.relation === 'owns' && edge.target === nodeId
  );

  const matchesSearch =
    !searchQuery ||
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.path?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesKind = !nodeKindFilter || node.kind === nodeKindFilter;
  const matchesCommunity = !communityFilter || node.community === communityFilter;
  const matchesOwnership = !ownershipFilter || (ownershipFilter === 'owned' ? owned : !owned);
  const matchesConfidence =
    !confidenceFilter ||
    editedGraph.knowledgeGraph.edges.some(
      (edge) =>
        edge.confidence === confidenceFilter && (edge.source === nodeId || edge.target === nodeId)
    ) ||
    node.kind === 'service';

  return !(
    matchesSearch &&
    matchesKind &&
    matchesCommunity &&
    matchesOwnership &&
    matchesConfidence
  );
}
