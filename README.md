# prediction-pool
A **BTC/USD** swing trading bot that pulls data from user [flair predictions](http://coinsight.org/#reddit) on [/r/bitcoinmarkets](http://reddit.com/r/bitcoinmarkets). By using the wisdom of the crowds, this method can gain valuable insight on the market from a hopefully reliable pool of users.

## Terminology

- **pool** - Group of multiple profiles to compare which way can earn the most profits.
- **profile** - A portfolio of users created by filtering profitable users on reddit based on several criteria

## Install

Fill in the blanks of the config.json.sample and cp it to config.json.

Install mongodb, ubuntu instructions can be found at http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

Setup AWS command line tools, for ubuntu follow http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SettingUp_CommandLine.html#setting_up_ec2_command_linux

```bash
$ npm install
$ node main.js
```


## Object documentation

### config:
AWS is currently not used.
- **aws** - Access keys for connecting to Amazon S3. Can be retrieved from the AWS console under Security Credentials.
	- **bucket** - Must be a bucket that your aws account has read/write access to.
	- **s3File** - Filename of the database
- **serverPort** - Web interface server port. Port 80 requires sudo on most servers.
- **exchangeFee** - Fees taken from every trade. BTC-e imposes a 0.2% fee. Default is 0.5% to be conservative. Represented as a percent (0.2 = 0.2%)
- **exchangeHours** - Hours of the day in which trades occur. Represented in UTC time. In PST, this defaults to 4am, 10am, 4pm and 10pm
- **profiles** - Coinsight profiles with filters and settings
	- **name** - Text name of profile
	- **slug** - URL safe representation of the name (lowercase and no spaces)
	- **minAccountAge** - Minimum reddit coinsight age to be included in pool.
	- **minCurrentProfit** - Minimum coinsight monthly profit to be included in pool.
	- **minTotalProfit** - Minimum coinsight lifetime profit to be included in pool.
	- **minChangesMonth** - Minimum coinsight flair changes per month to be included in pool.
	- **minChangeCount** - Minimum coinsight flair lifetime changes to be included in pool.
	- **maxLastChange** - Maximum number of days since last flair change
	- **weight** - Weight parameter objects. The profile is not weighted if this object is undefined
		- **maxWeight** - Maximum weight that a profile can have. 1.5 means 150% the power of an unweighted user if flair was just updated
		- **maxDays** - Weight is linearly applied, and after the last flair change is older than maxDays, the user becomes unweighted.

### coinsight:
The coinight class is one that keeps track of the current profile. It is recreated every time coinsight data is fetched. Profile meta is to be derived from coinsight data. Expect coinsight data to be temporary.
- **users** - Object of user data from coinsight
- **filters** - Profile settings from config
- **size** - Amount of users that passed the filter
- **numBears** - Number of bear flairs
- **numBulls** - Number of bull flairs
- **percentBears** - Percent of bear flairs
- **percentBears** - Percent of bull flairs
- **creationTime** - Time of the javaScript coinsight object creation
- **totalProfit** - Percent profit of the profile in decimal form (1 = break even)

#### coinsight.user:
Here is an exmple of what an individual user in the coinsight object may look like:
```json
{
    "username": "boogie_wonderland",
    "monthly_balance": 0.741898402648962,
    "update_time": "2013-12-18 09:15:30",
    "current_profit": "123.15",
    "check_count": 24,
    "creation_time": 1380059113,
    "btc_value": 1.656,
    "position": "bear",
    "balance": 894.012468418656,
    "last_post": 0,
    "balance_str": "894.0125 USD",
    "change_count": 16,
    "account_age": 85.16,
    "changes_month": 5.64,
    "last_change": 0.38,
    "total_profit": 65.6
}
```

### profileMeta:
The profileMeta class keeps track of the long term information of the profile such as BTC and USD value. It is serialized and stored in a file and the program attempts to find a saved profileMeta file on each restart. 
- **profileBirth** - MomentJS object of when the profilemeta was first created
- **profitPercentage** - Represents the value of the profile relative to the initial investment 
- **BTC** - BTC Value. Rounded to nearest satoshi.
- **USD** - BTC-e USD Value. Rounded to nearest 1/1000th of a dollar
- **value** - Value expressed in BTC if the USD were to be immediately converted to BTC at the fastest price
- **trade()** - Method that converts trades BTC to try and match the bull ratio defined in the corresponding coinsight object
- **update()** - Method that updates the profile value but does not do any trading  