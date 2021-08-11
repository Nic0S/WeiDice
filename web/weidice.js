let contract;
let account;
let web3;
let weiDice;
let eventSub;

async function connectAndReload() {
  const accounts = await ethereum.request({method: 'eth_requestAccounts'});
  account = accounts[0]

  const bal = await web3.eth.getBalance(account)
  $("#userBalance").text(web3.utils.fromWei(bal.toString()) + " ETH");

  contract = $("#contract").val();
  const cBal = await web3.eth.getBalance(contract)
  $("#contractBalance").text(web3.utils.fromWei(cBal.toString()) + " ETH");

  weiDice = new web3.eth.Contract(weiDiceABI, contract);

  let opts = {
    filter: {
      roller: account,
    },
    fromBlock: 0,
  }
  $("#events").empty();
  if (eventSub) {
    await eventSub.unsubscribe()
  }
  eventSub = weiDice.events.Rolled(opts).on('data', e => event(e))

  clearInterval()
  setInterval(async function () {
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    if (accounts[0] !== account) {
      account = accounts[0];
      await connectAndReload()
    }
  }, 500);


  $("#loggedIn").removeAttr("hidden")
}

function roll() {
  status("Sending roll transaction...")
  value = $("#wager").val()
  weiDice.methods.roll()
    .send({from: account, value: web3.utils.toWei(value.toString(), "ether")})
    .on("receipt", (receipt) => {
      status("Transaction sent! Results will appear below")
    })
    .on("error", (error) => {
      status(error.message)
      console.log(error)
    })
}

function event(e) {
  let eStr = "Block " + e.blockNumber + ", you rolled a " + e.returnValues.roll + ".";
  if (e.returnValues.won) {
    eStr += " Winnings: " + web3.utils.fromWei(e.returnValues.wonAmount.toString())
  } else {
    eStr += " Sorry, try again!"
  }
  var entry = document.createElement("p");
  entry.appendChild(document.createTextNode(eStr))
  $("#events").prepend(entry)
}

function status(message) {
  $("#status").text(message);
}