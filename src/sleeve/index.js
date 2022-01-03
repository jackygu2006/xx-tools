/* eslint-disable */
import './wasm_exec';

export const fetchSleeveGenerator = () => new Promise(async (res, rej) => {
  if (window.newSleeve) {
    res(window.newSleeve);
  }

  const go = new Go();
  const url = "/sleeve.wasm"; // Protonet

  const resopose = await fetch(url);
  if(resopose.ok && resopose.status === 200) {
    const bytes = await resopose.arrayBuffer();
    const result = await WebAssembly.instantiate(bytes, go.importObject);
    go.run(result.instance);
    res(window.newSleeve);
  } else {
    rej(false);
  }

});

(async () => {

})();
