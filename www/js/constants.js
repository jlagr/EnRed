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
  url: 'http://enreddgo.com.mx/api/index.php',
  tmpImgFolder: 'http://enreddgo.com.mx/api/users/tickets/img_tmp/',
  ticketFolder: 'http://enreddgo.com.mx/api/users/tickets/',
  uploader: 'http://enreddgo.com.mx/api/uploader.php',
  cleaner: 'http://enreddgo.com.mx/api/imageCleaner.php'
});