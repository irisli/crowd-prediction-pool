/**
 * Coinsight object
 * The main program has a pool of individual profiles.
 * This class creates a profile that weeds out users based off filters.
 */

module.exports = function coinsight(items, filters, profileMeta) {
  this.filters = filters;
  this.name = filters.name;
  this.slug = filters.slug;

  this.size = 0;
  this.numBears = 0;
  this.numBulls = 0;

  this.percentBears = 0;
  this.percentBulls = 0;

  this.creationTime = moment(); // coinsight *object* creation time

  this.value = profileMeta.value; // Percentage 
  this.users = items; 

  // Calculate some more statistics
  for (user in this.users) {

    // Round their BTC value to the nearest mBTC
    this.users[user]['btc_value'] = Math.round(this.users[user]['btc_value']*1000)/1000;

    // Calculate game account age (days)
    this.users[user]['account_age'] = Math.round(moment().diff(moment(this.users[user]['creation_time']), 'days', true) *100)/100;

    // Calculate prediction changes/30days and round to 2 decimal places
    this.users[user]['changes_month'] = Math.round(this.users[user]['change_count'] / (this.users[user]['account_age']/30) *100) / 100;
   
    // Calculate last prediction change in days and round to 2 decimal places
    this.users[user]['last_change'] = Math.round(moment().diff(this.users[user]['update_time'], 'days', true) *100)/100;

    //D :'( Timezones aren't working well here. It returns 
    // Uncomment the following line to see that some users have updated -0.33267 days in the past. 
    //console.log( Math.round(moment().diff(this.users[user]['update_time'], 'days', true) *100/100) );
    // Calculate total profit using coinsight provided btc conversion. Round to 1 decimal place
    this.users[user]['total_profit'] = Math.round((this.users[user]['btc_value']*100 - 100) *10)/10;
  }

  this.filter();

  this.percentBears = 0;
  this.percentBulls = 0;

  if (typeof filters.weight == 'undefined') {
    // Unweighted

    //? How can we make this more efficient/better?
    for (var key in this.users) {

      if (this.users[key]['position'] == 'bear')
        this.numBears += 1;
      else
        this.numBulls += 1;
    }
    this.size = this.numBulls + this.numBears;

    this.percentBulls = Math.round((this.numBulls/this.size)*100 *10)/10

    // We must do this or else we might get a rounding error
    this.percentBears = Math.round((100 - this.percentBulls) * 10)/10;
  } else {
    // Unweighted
    var weightBulls = 0; // Total weighted bull positions
    var weightBears = 0; // Total weighted bear positions
    var totalWeight = 0; // Total weight points
    var thisWeight = 0; // Temporary variable for the current weight

    for (var key in this.users) {
      if (this.users[key]['last_change'] < this.filters['weight']['maxDays']) {
        // Weighted user

        /* Example:
           maxDays = 2
           last_change = 1.5
           weight should become 75% of max weight advantage
           maxWeight = 1.6
           thisWeight = baseWeight + maxAdvantage * per
           thisWeight = 1 + (1.6 - 1) * (1.5/2) = 1 + 0.6 * 0.75 = 1.45
        */
        thisWeight = Math.round((1 + (this.filters['weight']['maxWeight'] - 1) * (this.users[key]['last_change'] / this.filters['weight']['maxDays'])) * 1000)/1000;
        /*console.log('=========DEBUG===========')
        console.log('maxDays');
        console.log(this.filters['weight']['maxDays'])
        console.log('last_change');
        console.log(this.users[key]['last_change']);
        console.log('maxWeight');
        console.log(this.filters['weight']['maxWeight']);
        console.log('thisWeight');
        console.log(thisWeight)*/
      } else {
        thisWeight = 1;
      }

      if (this.users[key]['position'] == 'bear') {
        this.numBears += 1;
        weightBears += thisWeight;
      }
      else {
        this.numBulls += 1;
        weightBulls += thisWeight;
      }
    }
    this.size = this.numBulls + this.numBears;
    totalWeight = weightBears + weightBulls;


    this.percentBulls = Math.round((weightBulls/totalWeight*100) *10)/10;
    this.percentBears = Math.round((100 - this.percentBulls) * 10)/10;

  }

  // In case we don't have any users in the pool, just go all bull to be safe
  if (this.size == 0) {
    this.size = 0;

    this.numBulls = 1;
    this.numBears = 0;

    this.percentBulls = 100;
    this.percentBears = 0;
  }
}

//! Merge with constructor since we won't ever call this by itself
module.exports.prototype.filter = function() {
  var filters = this.filters;

  this.users = this.users.filter(function (user) {
  return user['account_age'] > filters.minAccountAge &&
         user['total_profit'] > filters.minTotalProfit &&
         user['changes_month'] > filters.minChangesMonth &&
         user['change_count'] > filters.minChangeCount &&
         user['last_change'] < filters.maxLastChange &&
         (user['position'] == "bear" || user['position'] == "bull")
  });
}

// Returns amount of seconds since creation
module.exports.prototype.objectAge = function() {
  return Math.round(moment().diff(this.creationTime)/1000 * 10)/10;
}