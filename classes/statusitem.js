/**
 * Status of different components
 * Tells us which which components are loaded so we can start the server
 */

// Wowwie, I've been scared of OOP for all my life (more like 5 years .. thats a lot :'( ) and now I realize how cool and powerful it is
//? AmIDoingThisRite?

//? Why am I trying to use javadoc'ish block comments so incorrectly (above, not below)? And ... im not even doing it right. How should I comment instead?
// Arguments: items - Array of items to populate this.items
//? Bad argument naming? Two "items"
module.exports = function statusItem(items) {
  this.items = {}; 
  this.onlineItems = 0; // Number of online components
  this.totalItems = 0; // Total number of components
  this.allOnline = false;

  if (typeof items == 'object') {
    for (var key in items) {
      this.items[items[key]] = false;
    }
  }

  this.update();
}

// Returns status
module.exports.prototype.update = function(item, status) {
  // Add new item if defined
  if (typeof item !== 'undefined' && typeof status !== 'undefined') {
    if (!(item in this.items)) {
      throw new Error('Component "' + component + '" doesn\'t exist');
    } else {
      this.items[item] = status; //? Hey, should we typecast this into Boolean or do we trust that we don't mess things up by accidentally (0.01% chance) putting in a number or something else? Maybe for our purposes, it isn't important but for a public api, it would?
    }
  }

  this.totalItems = Object.size(this.items); //? Is there any way to be able to call Object

  // Update online count
  this.onlineItems = 0;
  for (var key in this.items) {
    if (this.items[key] == true)
      this.onlineItems += 1;
  }

  if (this.onlineItems == this.totalItems)
    this.allOnline = true;

  // Return status report
  if (status == true) {
    var report = 'ready';
  } else {
    var report = 'offline';
  }

  return '"' + item + '" is now ' + report + '. [' + this.onlineItems + '/' + this.totalItems + ']';
}