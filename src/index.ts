import {BoaviztaCloudImpactModel} from "../lib/boavizta";

const newModel = new BoaviztaCloudImpactModel();
newModel.configure('test', {provider: 'aws'});
newModel.usage({
    "provider": "aws",
    "instance_type": "t4g.micro",
}).then(
    (resp) => {
        console.log(JSON.stringify(resp))
        // console.log(util.inspect(resp, {showHidden: false, depth: null}))
    }
);
// alternative shortcut
