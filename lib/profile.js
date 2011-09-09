var crypto = require('crypto')
  , util = require('util')
  , Hook = require('hook.io').Hook
  , settings = require('./settings')
  , db = require('./db.js').db

var Profile = exports.Profile = function (options) {
  Hook.call(this, options)
  var self = this
  self.on('hook::ready', function () {
    self._listeners()
  })
}
util.inherits(Profile, Hook)

Profile.prototype._listeners = function () {
  var self = this
  self.on('*::viewProfile', function (data) {
    self.viewProfile(data.email, function (err, result) {
      if (err) return self.emit('error::viewProfile', err)
      if (!result) return self.emit('viewProfileFail', 'not found')
      self.emit('viewProfileSuccess', result)
    })
  })
  self.on('*::saveProfile', function (data) {
    self.saveProfile(data.email, data.profile, function(err) {
      if (err) {
        if (err.error === 'not_found') {
          return self.emit('saveProfileFail', err)
        }
        return self.emit('error::saveProfile', err)
      }
      self.emit('saveProfileSuccess')
    })
  })
}

Profile.prototype.viewProfile = function (email, cb) {
  var self = this
  db.get('user-' + encodeURIComponent(email), function (err, doc) {
    if (err) {
      if (err.error === 'not_found')
        return cb(null, null)
      else
        return cb(err)
    }
    return cb(null, doc.profile || {})
  })
}

// might return an error with "err.error === 'not_found'" if the user doesn't
// exist
Profile.prototype.saveProfile = function (email, profile, cb) {
  var self = this
  db.get('user-' + encodeURIComponent(email), function (err, doc) {
    if (err) cb(err)
    doc.profile = profile
    db.put(doc, function (err, doc) {
      if (err) return cb(err)
      cb(null)
    })
  })
}

