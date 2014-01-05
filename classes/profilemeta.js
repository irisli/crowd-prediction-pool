/**
 * Profile meta
 * Contains the data for each profile. This data object will [hopefully] live forever
 * (unlike the coinsight object which is recreated).
 * The profile meta will be backed up to a file every once in a while.
 * 
 * If no arguments are passed to the constructor, a new profile meta will be created.
 */

module.exports = function profileMeta(profileMetaImport) {
  if(typeof profileMetaImport != 'undefined') {
    this.profileBirth = moment(profileMetaImport.profileBirth);
    this.profitPercentage = profileMetaImport.profitPercentage;

    this.BTC = profileMetaImport.BTC;
    this.USD = profileMetaImport.USD;

    this.value = profileMetaImport.value;
  } else {
    // Give birth to a new profile meta
    this.profileBirth = moment();
    this.profitPercentage = 100; // Percentage

    this.BTC = 1; // Holdings of bitcoin
    this.USD = 0; // Holdings of USD

    this.value = 1; // Value of the profile expressed in BTC
  }
}

// Accepts the coinsight object as an argument and updates holdings based on the coinsight object
// Fee is a number that represents the fees paid when switching position
//   Fees are only taken when changing positions
// BTC value is calculated by taking immediate amounts (buy high, sell low)
module.exports.prototype.trade = function(coinsight, btce, fee) {

  this.value = this.BTC + this.USD/btce.buy;
  
  // How much of our holdings do we want in BTC
  var targetBTC = this.value*(coinsight.percentBulls/100);

  // How much BTC do we want to change by (positive: buy btc; negative: sell btc)
  var deltaBTC = (targetBTC - this.BTC);
    if (deltaBTC > 0) {
      var sign = '+';
    } else {
      var sign = '';
    }
    console.log('ProfileMeta: Trading ' + this.BTC + sign + deltaBTC + ' = ' + targetBTC + ' / ' + this.USD + ' USD');
  //! Todo: Make an trade object that takes care of the low level aspects of 
  //  interfacing with the exchange since we must interact with the bid-ask spread and
  //  our orders might not be instantly processed.
  //  The trader can be smart and use a predictors such as StochRSI to determine
  //  where to place buy/sell order to minimize money lost through the bid-ask spread.
  //  See: http://www.investopedia.com/terms/s/stochasticoscillator.asp
  //  In action: http://bitcoinwisdom.com/  and under Settings, turn on StochRSI
  if (deltaBTC == 0) {
    // Chances of this happening are extremely slim, but lets handle it gracefully anyways
  } else if (deltaBTC > 0) { // Buy BTC high; lose money to fees
    this.BTC = targetBTC;
    this.USD = this.USD - deltaBTC * btce.sell * (1/(1 - fee/100));
    // Sign  =          - [   +  ] * [   +  ] = -; losing USD from buying BTC; loss increased by fees
  } else if (deltaBTC < 0) { // Sell BTC low; lose money to fees
    this.BTC = targetBTC;
    this.USD = this.USD - deltaBTC * btce.buy * (1 - fee/100);
    // Sign  =          - [   -  ] * [   +  ]; gaining USD from selling BTC; gain dampened by fees
  }
    

  // Round to the nearest satoshi (Bitcoin protocol's lowest denomination)
  this.value = Math.round((this.BTC + this.USD/btce.sell) * 100000000)/100000000;
  this.BTC = Math.round(this.BTC * 100000000)/100000000;

  this.USD = Math.round(this.USD * 1000)/1000
  this.profitPercentage = Math.round(this.value/1 * 100 * 1000)/1000;
}

// Recalculate the value of the profile without trading anything
module.exports.prototype.update = function(btce) {
  this.value = this.BTC + this.USD/btce.buy;

  this.value = Math.round((this.BTC + this.USD/btce.sell) * 100000000)/100000000;
  this.profitPercentage = Math.round(this.value/1 * 100 * 1000)/1000;
}

// Exports the profile meta as an object which we can later use as an argument for the constructor
module.exports.prototype.export = function() {
  return {
    "profileBirth": this.profileBirth,
    "profitPercentage": this.profitPercentage,
    "BTC": this.BTC,
    "USD": this.USD,
    "value": this.value
  }
};