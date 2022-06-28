window.suite = function () {
  const t = new parent.jsUnitTestSuite();
  const n = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);
  t.addTestPage(`${n}unit/unitTests.qunit.html`);
  t.addTestPage(`${n}integration/opaTests.qunit.html`);
  return t;
};
