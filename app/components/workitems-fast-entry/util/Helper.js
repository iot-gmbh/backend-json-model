sap.ui.define(['require'], (require) => ({
	resolvePath(sPath) {
		// Relative to application root
		return require.toUrl('../') + sPath;
	}
}));
