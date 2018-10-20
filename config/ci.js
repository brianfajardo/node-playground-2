module.exports = {
  googleClientID:
    '964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com',
  googleClientSecret: 'KnH-rZC23z4fr2CN4ISK4srN',
  // MongoDB instance in TravisCi will create a new database if it doesn't exist yet.
  mongoURI: 'mongodb://127.0.0.1:27017/test_blog_ci',
  cookieKey: '123123123',
  redisURL: 'redis://127.0.0.1:6379'
}
