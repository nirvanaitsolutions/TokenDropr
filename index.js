const express = require('express')
const app = express()
const port = 3000
const steem = require('steem')
steem.api.setOptions({ url: 'https://api.steemit.com' });
steem.config.set('address_prefix','STM');
app.get('/api/voters', async (req, res) => {
    var rewardBalance, recentClaims, steemPrice =null;

    await steem.api.getRewardFund("post", function(e, t) {
        rewardBalance = parseFloat(t.reward_balance.replace(" STEEM", ""));
        recentClaims = t.recent_claims;
    });

    await steem.api.getCurrentMedianHistoryPrice(function(e, t) {
        steemPrice = parseFloat(t.base.replace(" SBD", "")) / parseFloat(t.quote.replace(" STEEM", ""));
    });
    await steem.api.getActiveVotes(req.query.author, req.query.permalink, function(err, result) {
        if(err) res.send(err);
        if (result.length > 1) {
            result = result.map(({voter, rshares, percent}) => {
                let estimated_payout = '$' + (rshares* rewardBalance / recentClaims * steemPrice).toFixed(3)
                percent = `${percent/100}%`;
                return {
                    voter,
                    percent,
                    estimated_payout
                }
            })
        }
        res.send(result)
    });
})

app.listen(port, () => console.log(`App listening on port ${port}!`))