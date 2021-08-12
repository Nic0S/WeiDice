async function shouldThrow(promise) {
  try {
    await promise;
    assert(true);
  }
  catch (err) {
    return;
  }
  assert(false, "The contract did not throw.");
}

function wei(ether) {
  return web3.utils.toWei(ether.toString(), 'ether');
}

function mine(blocks) {
  for (let i = 0; i < blocks; i++) {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: new Date().getTime()
    })
  }
}


module.exports = {
  shouldThrow,
  wei,
  mine,
};
