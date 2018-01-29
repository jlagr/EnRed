angular.module('EnRed')

.constant('AUTH_EVENTS',{
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES',{
  admin: 'admin',
  worker: 'worker',
  user: 'user',
  public: 'public'
})

.constant('API_ENDPOINT', {
  url: 'http://enreddgo.com.mx/api/index.php'
});