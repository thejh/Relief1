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
    self.viewProfile(data.email)
  })
  self.on('*::saveProfile', function (data) {
    self.saveProfile(data.email, data.profile)
  })
}

Profile.prototype.viewProfile = function (email) {
  var self = this
  db.get('user-' + encodeURIComponent(email), function (err, doc) {
    if (err) {
      if (err.error === 'not_found')
        return self.emit('viewProfileFail', err)
      else
        return self.emit('error::viewProfile', err)
    }
    self.emit('viewProfileSuccess', doc.profile || {})
  })
}

Profile.prototype.saveProfile = function (email, profile) {
  var self = this
  db.get('user-' + encodeURIComponent(email), function (err, doc) {
    if (err) {
      if (err.error === 'not_found')
        return self.emit('saveProfileFail', err)
      else
        return self.emit('error::saveProfile', err)
    }
    doc.profile = profile
    db.put(doc, function (err, doc) {
      if (err) {
        return self.emit('error::saveProfile', err)
      }
      self.emit('saveProfileSuccess')
    })
  })
}

