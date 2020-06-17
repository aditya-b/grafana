import { e2e } from '@grafana/e2e';

e2e.scenario({
  describeName: 'Explore',
  itName: 'Basic path through Explore.',
  addScenarioDataSource: true,
  addScenarioDashBoard: false,
  skipScenario: false,
  scenario: () => {
    e2e.pages.Explore.visit();
    e2e.pages.Explore.General.container().should('have.length', 1);
    const canvases = e2e().get('canvas');
    canvases.should('have.length', 2);
    e2e.components.DataSource.TestData.QueryTab.noise().should('have.length', 1);

    expectInitialToolbarContent();
    exploreSplitScenario();
    expectMetricsInitialContent();
    exploreMetricsScenario();

    exploreModeChangeScenario();
    expectLogsInitialContent();
    exploreLogsScenario();

    exploreQueryHistoryScenario();
  },
});

const expectInitialToolbarContent = () => {
  // toolbar elements
  e2e.pages.Explore.Toolbar.splitButton().should('have.length', 1);
  e2e.pages.Explore.Toolbar.closeSplitButton().should('have.length', 0);
  e2e.components.DataSourcePicker.container().should('have.length', 1);
  e2e.pages.Explore.Toolbar.clearAllButton().should('have.length', 1);
  e2e.pages.Explore.Toolbar.runButton().should('have.length', 1);
  e2e.pages.Explore.Toolbar.liveTailButton().should('have.length', 0);
};

const exploreSplitScenario = () => {
  // explore split - before
  e2e.pages.Explore.General.container().should('have.length', 1);
  e2e()
    .get('canvas')
    .should('have.length', 2);

  // explore split
  e2e.pages.Explore.Toolbar.splitButton().click();
  e2e.pages.Explore.General.container().should('have.length', 2);
  e2e()
    .get('canvas')
    .should('have.length', 4);
  e2e.pages.Explore.Toolbar.closeSplitButton()
    .should('have.length', 2)
    .first()
    .click();

  // explore split - after
  e2e.pages.Explore.General.container().should('have.length', 1);
  e2e()
    .get('canvas')
    .should('have.length', 2);
};

const expectMetricsInitialContent = () => {
  // metrics response elements
  e2e.pages.Explore.General.metricsGraphContainer().should('be.visible');
  e2e.pages.Explore.General.tableContainer().should('be.visible');
};

const exploreMetricsScenario = () => {};

const exploreModeChangeScenario = () => {};

const expectLogsInitialContent = () => {
  // logs response elements
  e2e.pages.Explore.Logs.container().should('be.visible');
};

const exploreLogsScenario = () => {};

const exploreQueryHistoryScenario = () => {};
