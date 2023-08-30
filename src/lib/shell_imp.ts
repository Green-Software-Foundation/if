const fs = require('fs');
const yaml = require('js-yaml');
const cp = require('child_process');

/* 
description:
    spawns a child process to run an external IMP
    expects execPath to be a path to an executable with a CLI exposing two methods: --calculate and --impl
    The shell command then calls the --command method passing var impl as the path to the desired impl file

params:
- impl: (string) path to impl file
- execPath: (string) path to executable
- omplName: (string) savename for ompl file

returns:
- ompl data to stdout
- ompl data to disk as omplName.yaml
*/
function runModelInShell(impl, execPath, omplName) {
    const result = cp.spawnSync(execPath, ['--calculate', '--impl=' + impl]).stdout.toString();
    const yamlData = yaml.dump(yaml.load(result))
    fs.writeFileSync(omplName, yamlData, 'utf8');
    return yamlData
}

//example invocation
// calling prototype python model available in ief-sandbox repo
// let out = runModelInShell('dow_msft.yaml', '/home/joe/Code/ief-sandbox/dist/cli/cli', 'ompl2.yaml')
// console.log(out)