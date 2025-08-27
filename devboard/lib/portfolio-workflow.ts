export function getDummyPortfolioWorkflow() {
  return {
    id: 'dummy-workflow-1',
    name: 'Sample Portfolio Workflow',
    steps: [
      { id: 'step-1', name: 'Ideation', status: 'completed' },
      { id: 'step-2', name: 'Design', status: 'in-progress' },
      { id: 'step-3', name: 'Development', status: 'pending' },
      { id: 'step-4', name: 'Review', status: 'pending' },
      { id: 'step-5', name: 'Launch', status: 'pending' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}