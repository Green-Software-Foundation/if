import { openYamlFileAsObject } from "../../util/yaml";
import { expect, jest, test } from '@jest/globals';
import * as fs from "fs";
jest.setTimeout(30000);

const path = "examples/ompls"
var files = fs.readdirSync(path)
files.forEach(function (file) {
    test('check ompls have impacts field', async () => {
        openYamlFileAsObject(path + "/" + file).then(ompl =>
            expect(ompl["graph"]["children"]["child"]["impacts"]))
    });
    if (file.includes("sci-m")) {
        test('check sci-m has correct inputs and outputs', async () => {
            openYamlFileAsObject(path + "/" + file).then(ompl =>
                expect((ompl["graph"]["children"]["child"]["impacts"].includes("m"))));
        });
    }

})



//if ompl["graph"]["children"]["child"]["pipeline"]


// function runTests() {
//     const path = "examples/ompls"
//     fs.readdir(path, function (err, impls) {
//         if (err) {
//             console.error("Could not list the directory.", err);
//             process.exit(1);
//         }

//         impls.forEach(function (file) {
//             testOmpl(path, file)
//         })
//     }
//     )
// }

// function testOmpl(path: string, file: string) {
//     loadOmpl(path, file).then(ompl => {
//         test("Check ompl has impacts field", () => {
//             expect(ompl["graph"]["children"]["child"]["impacts"]);
//         })
//     })
// }

// async function loadOmpl(path: string, file: string) {
//     const ompl = await openYamlFileAsObject(path + "/" + file);
//     return ompl
// }

// runTests();