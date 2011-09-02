var crypto = require('crypto')
  , testCase = require('nodeunit').testCase

var settings = require('../lib/settings')
settings.__reload('test')
var db = require('../lib/db').db
  , login = require('../lib/login')
  , profile = require('../lib/profile')

module.exports = testCase(
{ setUp: function (callback) {
    var _login = new login.Login()
      , _profile = new profile.Profile()

    this.email = 'profiletest@example.com'
    this.password = 'password'
    _login.on('*::registrationFail', function(err) {
      throw err
    })
    _profile.on('*::saveProfileSuccess', function() { callback() })
    _login.on('*::registrationSuccess', function() {
      _profile.emit('saveProfile', {email: this.email, profile: {fullname: "Fuh Bahr"}})
    })
    _login.emit('userRegister', {email: this.email, password: this.password})
  }
, testRetrieveProfile: function(test) {
    var _profile = new profile.Profile()
    test.expect(2)
    _profile.on('*::viewProfileSuccess', function(profile) {
      test.ok(profile, 'there should be a profile object')
      test.equal(profile.fullname, "Fuh Bahr", 'full name should be right')
      test.done()
    })
    _profile.on('*::viewProfileFail', function(err) { throw err })
    _profile.emit('viewProfile', this.email)
  }
, tearDown: function (callback) {
    db.remove('user-' + encodeURIComponent(this.email))
  }
})

