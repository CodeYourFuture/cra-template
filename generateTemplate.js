#! /usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const merge = require("lodash.merge");

[copyBaseTemplate, createTemplateJson, updateIndex, removeUnwantedFiles].forEach((task) => {
	task();
});

function copyBaseTemplate() {
	fs.emptyDirSync(pathTo("template"));
	fs.copySync(pathTo("node_modules/cra-template/template"), pathTo("template"));
}

function createTemplateJson() {
	const defaults = require("cra-template/template.json");
	const overrides = {
		"package": {
			"dependencies": {
				"@codeyourfuture/eslint-config-standard": "^2.0.1",
				"stop-runaway-react-effects": "^2.0.0",
			},
			"eslintConfig": {
				"extends": [
					"react-app",
					"@codeyourfuture/standard",
				],
				"ignorePatterns": [
					"build/",
					"node_modules/",
				],
			},
			"scripts": {
				"lint": "eslint .",
				"test": "echo \"Error: no test specified\" && exit 1",
			},
		},
	};

	Object.keys(defaults.package.dependencies).forEach((dep) => {
		if (dep.startsWith("@testing-library")) {
			delete defaults.package.dependencies[dep];
		}
	});

	fs.writeFileSync(pathTo("/template.json"), JSON.stringify(merge(defaults, overrides), null, 2));
}

function removeUnwantedFiles() {
	[
		"src/App.test.js",
		"src/serviceWorker.js",
		"src/setupTests.js",
	].forEach((file) => {
		fs.unlinkSync(pathTo("template", file));
	});
}

function updateIndex() {
	let index = fs.readFileSync(pathTo("template/src/index.js"), "utf8");
	index = `import 'stop-runaway-react-effects/hijack';\n\n${index}`
		.replace(/<React\.StrictMode>\s+([\s\w<>/]+?)\s+<\/React\.StrictMode>/, "$1")
		.replace(/.*serviceWorker.*\n/g, "")
		.replace(/\/\/.*\n/g, "");
	fs.writeFileSync(pathTo("template/src/index.js"), index);
}

function pathTo(...rest) {
	return path.join(__dirname, ...rest);
}
