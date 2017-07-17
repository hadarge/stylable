import { Resolver } from '../src/resolver';
import { Stylesheet } from '../src/stylesheet';
import { expect } from "chai";

describe('Resolver', function () {

    describe('resolve', function () {


        it('get the import definition for the symbol', function () {

            var sheetA = Stylesheet.fromCSS(``);

            var sheetB = Stylesheet.fromCSS(`
                :import("./path/to/thing"){
                    -sb-default: Name;
                }
                .class {
                    -sb-type: Name;
                }
            `);

            const resolver = new Resolver({ "./path/to/thing": sheetA });

            expect(resolver.resolve(sheetB, "class")).to.equal(sheetA);
            expect(resolver.resolve(sheetB, "NotExist")).to.equal(sheetB);

        });


    });


    describe('resolveSymbols', function () {

        it('should resolve default symbols', function () {

            const resolvedModule = { resolved: 'name1' };
            const sheet = new Stylesheet({
                ":import('./path')": {
                    "-sb-default": "name1"
                }
            }, "namespace");

            const resolved = new Resolver({ "./path": resolvedModule }).resolveSymbols(sheet)

            expect(resolved).to.eql({ name1: resolvedModule });
        });

        it('should handle nameless default by using the path', function () {

            const resolvedModule = { resolved: 'name1' };

            var sheet = new Stylesheet({
                ":import('./path')": {}
            }, "namespace");

            const resolved = new Resolver({ "./path": resolvedModule }).resolveSymbols(sheet);

            expect(resolved).to.eql({ './path': resolvedModule });

        });

        it('should resolve named symbols', function () {

            const resolvedModule1 = { resolved: 'name1' };
            const resolvedModule2 = { resolved: 'name2' };

            var sheet = new Stylesheet({
                ":import('./path/1')": {
                    "-sb-named": "name1"
                },
                ":import('./path/2')": {
                    "-sb-named": "name2"
                }
            }, "namespace");

            const resolved = new Resolver({
                "./path/1": { name1: resolvedModule1 },
                "./path/2": { name2: resolvedModule2 }
            }).resolveSymbols(sheet);

            expect(resolved).to.contain({ name1: resolvedModule1, name2: resolvedModule2 });
        });

        it('should resolve stylesheets', function () {

            const resolvedModule = new Stylesheet({
                ":vars": {
                    "param1": "red",
                    "param2": "blue",
                }
            });

            var sheet = new Stylesheet({
                ":import('./path')": {
                    "-sb-named": "param1, param2",
                },
                ":vars": {
                    "param3": "green",
                },
            }, "namespace");

            const resolved = new Resolver({
                "./path": resolvedModule,
            }).resolveSymbols(sheet);

            expect(resolved).to.contain({ param1: "red", param2: "blue", param3: "green" });
        });

        it('should throw error on var name conflict', function () {

            const resolvedModule = new Stylesheet({
                ":vars": {
                    "param1": "red",
                    "param2": "blue",
                }
            });

            var sheet = new Stylesheet({
                ":import('./path')": {
                    "-sb-named": "param1, param2",
                },
                ":vars": {
                    "param": "orange",
                    "param1": "purple",
                },
            }, "namespace");

            expect(function resolveSymbols() {
                new Resolver({ "./path": resolvedModule }).resolveSymbols(sheet);
            }).to.throw('resolveSymbols: Name param1 already set');
        });

        it('should take last defiled name export', function () {

            const resolvedModule1 = { resolved: 'name1' };
            const resolvedModule2 = { resolved: 'name1' };

            var sheet = new Stylesheet({
                ":import('./path/1')": {
                    "-sb-named": "name1"
                },
                ":import('./path/2')": {
                    "-sb-named": "name1"
                }
            }, "namespace");

            const resolved = new Resolver({
                "./path/1": { name1: resolvedModule1 },
                "./path/2": { name1: resolvedModule2 }
            }).resolveSymbols(sheet);

            expect(resolved).to.contain({ name1: resolvedModule2 });
        });
    });


});
