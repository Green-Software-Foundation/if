import { openYamlFileAsObject } from "../../util/yaml";
import { expect, jest, test } from '@jest/globals';
import * as fs from "fs";
jest.setTimeout(30000);

const path = "examples/ompls"
var files = fs.readdirSync(path)

if (files.length == 0) {
    throw ("no ompl files available. Please run scripts/rimpl-test.sh before running these tests.")
}

files.forEach(function (file) {
    test('check ompls have impacts field', async () => {
        openYamlFileAsObject(path + "/" + file).then(ompl =>
            expect(ompl["graph"]["children"]["child"]["impacts"]))
    });
    if (file.includes("sci-m")) {
        test('check sci-m has correct output', async () => {
            openYamlFileAsObject(path + "/" + file).then(ompl =>
                expect((ompl["graph"]["children"]["child"]["impacts"].includes("m"))));
        });
    }
    if (file.includes("complex-pipeline")) {
        test('check complex-pipeline has correct outputs', async () => {
            openYamlFileAsObject(path + "/" + file).then(ompl => {
                const res: string = ompl["graph"]["children"]["child"]["impacts"][0].toString();
                expect((res.includes("e-mem")) &&
                    (res.includes("e-cpu")) &&
                    (res.includes("e-net")) &&
                    (res.includes("energy")) &&
                    (res.includes("operational-carbon"))
                );
            });
        })
    }
})